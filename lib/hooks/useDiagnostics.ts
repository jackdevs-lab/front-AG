'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { diagnosticsApi } from '@/lib/api/diagnostics';
import { DiagnosticRunResult, DiagnosticHistory } from '@/types/diagnostic';
import { config } from '@/lib/config';

// Diagnostics can be heavy, so we give them 90 seconds
const DIAGNOSTICS_TIMEOUT = 90000;

export function useLatestDiagnostics(connectionId: string) {
    return useQuery<DiagnosticRunResult | null>({
        queryKey: ['diagnostics', 'latest', connectionId],
        queryFn: async () => {
            try {
                const response = await diagnosticsApi.getLatest(connectionId, { timeout: DIAGNOSTICS_TIMEOUT });
                return response.data ?? null;
            } catch (error: any) {
                const status = error?.response?.status;

                // Handle locked/subscription states gracefully without breaking the UI
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
        retry: (failureCount, error: any) => {
            const status = error?.response?.status;
            // Never retry on subscription or permission blocks
            if (status === 403 || status === 402) {
                return false;
            }
            return failureCount < 1;
        },
    });
}

export function useSuspenseLatestDiagnostics(connectionId: string) {
    return useSuspenseQuery<DiagnosticRunResult | null>({
        queryKey: ['diagnostics', 'latest', connectionId],
        queryFn: async () => {
            const response = await diagnosticsApi.getLatest(connectionId, { timeout: DIAGNOSTICS_TIMEOUT });
            return response.data ?? null;
        },
        staleTime: 10000,
        retry: 1,
    });
}

export function useDiagnosticStream(connectionId: string | null) {
    const queryClient = useQueryClient();
    const { getToken, orgId, userId } = useAuth();
    const tenantId = orgId || userId;

    useEffect(() => {
        if (!connectionId || !tenantId) return;

        let eventSource: EventSource | null = null;

        const connectStream = async () => {
            const token = await getToken();
            if (!token) return;

            const url = `${config.api.baseUrl}/diagnostics/stream/${connectionId}?token=${token}&tenantId=${tenantId}`;
            eventSource = new EventSource(url);

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'run_completed') {
                        // Invalidate both diagnostics and connection caches simultaneously.
                        // React Query batches these synchronously, preventing UI flicker 
                        // where diagnostics load but subscription status hasn't updated yet.
                        queryClient.invalidateQueries({
                            queryKey: ['diagnostics', 'latest', connectionId]
                        });
                        queryClient.invalidateQueries({
                            queryKey: ['diagnostics', 'history', connectionId]
                        });
                        queryClient.invalidateQueries({
                            queryKey: ['connections']
                        });
                        queryClient.invalidateQueries({
                            queryKey: ['connection', connectionId]
                        });
                        queryClient.invalidateQueries({
                            queryKey: ['connection-status', connectionId]
                        });
                    }
                } catch (err) {
                    console.error('Failed to parse SSE data', err);
                }
            };

            eventSource.onerror = (err) => {
                console.error('SSE Error', err);
            };
        };

        connectStream();

        return () => {
            if (eventSource) {
                eventSource.close();
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
        // Apply the exact same synced invalidations post-payment
        queryClient.invalidateQueries({ queryKey: ['diagnostics', 'latest', connectionId] });
        queryClient.invalidateQueries({ queryKey: ['diagnostics', 'history', connectionId] });
        queryClient.invalidateQueries({ queryKey: ['connections'] });
        queryClient.invalidateQueries({ queryKey: ['connection', connectionId] });
        queryClient.invalidateQueries({ queryKey: ['connection-status', connectionId] });
    };
}