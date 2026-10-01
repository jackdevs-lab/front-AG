'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { diagnosticsApi } from '@/lib/api/diagnostics';
import { DiagnosticRunResult, DiagnosticHistory } from '@/types/diagnostic';
import { config } from '@/lib/config';

const DIAGNOSTICS_TIMEOUT = 90000;

export function useLatestDiagnostics(
    connectionId: string,
    options?: { refetchInterval?: number | false }
) {
    return useQuery<DiagnosticRunResult | null>({
        queryKey: ['diagnostics', 'latest', connectionId],
        queryFn: async () => {
            try {
                const response = await diagnosticsApi.getLatest(connectionId, {
                    timeout: DIAGNOSTICS_TIMEOUT
                });

                if (!response || !response.data) {
                    return null;
                }

                return response.data;
            } catch (error: any) {
                const status = error?.response?.status ?? error?.status;

                if (status === 403 || status === 402) {
                    return (
                        error?.response?.data?.data ?? {
                            locked: true,
                            issues: [],
                            checks: []
                        }
                    ) as DiagnosticRunResult;
                }

                throw error;
            }
        },
        enabled: !!connectionId,
        staleTime: 10000,
        refetchInterval: options?.refetchInterval ?? false,
        retry: (failureCount, error: any) => {
            const status = error?.response?.status ?? error?.status;
            if (status === 403 || status === 402) return false;
            return failureCount < 1;
        },
    });
}

export function useSuspenseLatestDiagnostics(connectionId: string) {
    return useSuspenseQuery<DiagnosticRunResult | null>({
        queryKey: ['diagnostics', 'latest', connectionId],
        queryFn: async () => {
            const response = await diagnosticsApi.getLatest(connectionId, {
                timeout: DIAGNOSTICS_TIMEOUT
            });

            return response?.data ?? null;
        },
        staleTime: 10000,
        retry: 1,
    });
}

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;

export function useDiagnosticStream(connectionId: string | null) {
    const queryClient = useQueryClient();
    const { getToken, orgId, userId } = useAuth();
    const tenantId = orgId || userId;

    const abortRef = useRef<AbortController | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const unmountedRef = useRef(false);

    useEffect(() => {
        if (!connectionId || !tenantId) return;

        unmountedRef.current = false;
        reconnectAttemptsRef.current = 0;

        const invalidate = () => {
            queryClient.invalidateQueries({ queryKey: ['diagnostics', 'latest', connectionId] });
            queryClient.invalidateQueries({ queryKey: ['diagnostics', 'history', connectionId] });
            queryClient.invalidateQueries({ queryKey: ['connections'] });
            queryClient.invalidateQueries({ queryKey: ['connection', connectionId] });
            queryClient.invalidateQueries({ queryKey: ['connection-status', connectionId] });
        };

        const handleEvent = (raw: string) => {
            try {
                const data = JSON.parse(raw);
                reconnectAttemptsRef.current = 0;

                // 4.2 C9: Trigger UI refresh ONLY on run_completed event from analysis queue
                if (data.type === 'run_completed' || data.status === 'COMPLETED') {
                    invalidate();
                }
            } catch (err) {
                console.error('Failed to parse SSE data', err);
            }
        };

        const scheduleReconnect = () => {
            if (unmountedRef.current) return;
            if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                console.warn('SSE reconnect limit reached. Falling back to standard polling.');
                return;
            }
            reconnectAttemptsRef.current += 1;
            console.warn(`SSE connection failed. Reconnecting... (Attempt ${reconnectAttemptsRef.current})`);
            reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        };

        const connect = async (): Promise<void> => {
            if (unmountedRef.current) return;

            const token = await getToken({ skipCache: true });
            if (!token) {
                console.warn('SSE: no token available, aborting connect');
                return;
            }

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const url =
                    `${config.api.baseUrl}/diagnostics/stream/${connectionId}` +
                    `?tenantId=${encodeURIComponent(tenantId)}`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Accept: 'text/event-stream',
                        Authorization: `Bearer ${token}`,
                        'x-tenant-id': tenantId,
                    },
                    signal: controller.signal,
                    cache: 'no-store',
                    credentials: 'omit',
                });

                if (!response.ok || !response.body) {
                    throw new Error(`SSE failed: ${response.status} ${response.statusText}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';

                while (!unmountedRef.current) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    // Normalize line endings per SSE spec
                    buffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

                    let sep: number;
                    while ((sep = buffer.indexOf('\n\n')) !== -1) {
                        const block = buffer.slice(0, sep);
                        buffer = buffer.slice(sep + 2);

                        const dataLines: string[] = [];
                        for (const line of block.split('\n')) {
                            if (line.startsWith('data:')) {
                                dataLines.push(line.slice(5).replace(/^ /, ''));
                            }
                        }
                        if (dataLines.length > 0) {
                            handleEvent(dataLines.join('\n'));
                        }
                    }
                }

                if (!unmountedRef.current) {
                    scheduleReconnect();
                }
            } catch (err: any) {
                if (err?.name === 'AbortError') return;
                console.warn('SSE connection error:', err);
                scheduleReconnect();
            }
        };

        connect();

        return () => {
            unmountedRef.current = true;
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
            if (abortRef.current) {
                abortRef.current.abort();
                abortRef.current = null;
            }
        };
    }, [connectionId, tenantId, queryClient, getToken]);
}

export function useDiagnosticHistory(connectionId: string, limit = 30) {
    return useQuery<DiagnosticHistory[]>({
        queryKey: ['diagnostics', 'history', connectionId, limit],
        queryFn: async () => {
            const response = await diagnosticsApi.getHistory(connectionId, limit, { timeout: DIAGNOSTICS_TIMEOUT });
            return response.data;
        },
        enabled: !!connectionId,
        staleTime: 60000,
        retry: 1,
    });
}

export function useSuspenseDiagnosticHistory(connectionId: string, limit = 30) {
    return useSuspenseQuery<DiagnosticHistory[]>({
        queryKey: ['diagnostics', 'history', connectionId, limit],
        queryFn: async () => {
            const response = await diagnosticsApi.getHistory(connectionId, limit, { timeout: DIAGNOSTICS_TIMEOUT });
            return response.data;
        },
        staleTime: 60000,
        retry: 1,
    });
}

export function useInvalidateAfterPayment() {
    const queryClient = useQueryClient();
    return (connectionId: string) => {
        queryClient.invalidateQueries({ queryKey: ['diagnostics', 'latest', connectionId] });
        queryClient.invalidateQueries({ queryKey: ['diagnostics', 'history', connectionId] });
        queryClient.invalidateQueries({ queryKey: ['connections'] });
        queryClient.invalidateQueries({ queryKey: ['connection', connectionId] });
        queryClient.invalidateQueries({ queryKey: ['connection-status', connectionId] });
    };
}