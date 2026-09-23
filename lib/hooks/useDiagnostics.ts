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

export function useDiagnosticStream(connectionId: string | null) {
    const queryClient = useQueryClient();
    const { getToken, orgId, userId } = useAuth();
    const tenantId = orgId || userId;

    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 3;

    useEffect(() => {
        if (!connectionId || !tenantId) return;

        const setupEventSource = async () => {
            const token = await getToken({ skipCache: true });
            if (!token) return;

            const url = `${config.api.baseUrl}/diagnostics/stream/${connectionId}?token=${token}&tenantId=${tenantId}`;
            const es = new EventSource(url);

            eventSourceRef.current = es;

            es.onmessage = (event) => {
                reconnectAttemptsRef.current = 0;
                try {
                    const data = JSON.parse(event.data);

                    // 4.2 C9: Trigger UI refresh ONLY on run_completed event from analysis queue
                    if (data.type === 'run_completed' || data.status === 'COMPLETED') {
                        queryClient.invalidateQueries({ queryKey: ['diagnostics', 'latest', connectionId] });
                        queryClient.invalidateQueries({ queryKey: ['diagnostics', 'history', connectionId] });
                        queryClient.invalidateQueries({ queryKey: ['connections'] });
                        queryClient.invalidateQueries({ queryKey: ['connection', connectionId] });
                        queryClient.invalidateQueries({ queryKey: ['connection-status', connectionId] });
                    }
                } catch (err) {
                    console.error('Failed to parse SSE data', err);
                }
            };

            es.onerror = async () => {
                es.close();

                if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                    console.warn('SSE reconnect limit reached. Falling back to standard polling.');
                    return;
                }

                reconnectAttemptsRef.current += 1;
                console.warn(`SSE connection failed. Reconnecting... (Attempt ${reconnectAttemptsRef.current})`);

                setTimeout(() => {
                    setupEventSource();
                }, 2000);
            };
        };

        setupEventSource();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
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