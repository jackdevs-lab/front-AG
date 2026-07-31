'use client';

import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { connectionsApi } from '@/lib/api/connections';
import { api } from '@/lib/api/client';
import { Connection } from '@/types/connection';

export function useConnections() {
    const queryClient = useQueryClient();
    const { isLoaded, isSignedIn } = useAuth();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['connections'],
        queryFn: async () => {
            const response = await connectionsApi.list();
            return response.data as Connection[];
        },
        enabled: isLoaded && isSignedIn,
        staleTime: 0,
        refetchInterval: (query) => {
            const connections = query.state.data as Connection[] | undefined;
            return connections?.some(c => c.syncStatus === 'SYNCING') ? 5000 : false;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => connectionsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['connections'] });
        },
        onError: (error: any) => {
            console.error('Failed to disconnect QuickBooks account:', error);
        },
    });

    const auditMutation = useMutation({
        mutationFn: async (id: string) => {
            try {
                return await connectionsApi.triggerSync(id);
            } catch (error: any) {
                if (error?.response?.status === 429 || error?.status === 429) {
                    throw new Error('Sync is currently on cooldown. Please try again later.');
                }
                throw error;
            }
        },
        retry: false,
        onSuccess: (data, connectionId) => {
            queryClient.invalidateQueries({ queryKey: ['connections'] });
            queryClient.invalidateQueries({ queryKey: ['connection-status', connectionId] });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, companyName }: { id: string, companyName: string }) =>
            connectionsApi.update(id, { companyName }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['connections'] });
        },
    });

    return {
        connections: data || [],
        isLoading: isLoading || !isLoaded,
        error,
        refetch,
        deleteConnection: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        deleteError: deleteMutation.error,
        runAudit: auditMutation.mutate,
        isTriggeringAudit: auditMutation.isPending,
        auditError: auditMutation.error,
        updateConnection: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
    };
}

export function useSuspenseConnections() {
    const { data, refetch } = useSuspenseQuery({
        queryKey: ['connections'],
        queryFn: async () => {
            const response = await connectionsApi.list();
            return response.data as Connection[];
        },
        staleTime: 0,
    });

    return {
        connections: data || [],
        refetch,
    };
}

export function useConnection(id: string) {
    const { isLoaded, isSignedIn } = useAuth();

    return useQuery({
        queryKey: ['connection', id],
        queryFn: async () => {
            const response = await connectionsApi.getById(id);
            return response.data;
        },
        enabled: !!id && isLoaded && !!isSignedIn,
        staleTime: 10000,
    });
}

export function useConnectionStatus(connectionId: string, isSyncExpectedToRun?: boolean) {
    const { isLoaded, isSignedIn } = useAuth();

    return useQuery({
        queryKey: ['connection-status', connectionId],
        queryFn: async () => {
            const data = await api.get(`/connections/${connectionId}/status`);
            return data;
        },
        enabled: !!connectionId && isLoaded && !!isSignedIn,
        refetchInterval: (query) => {
            const currentStatus = query.state.data?.syncStatus;
            return (currentStatus === 'SYNCING' || isSyncExpectedToRun) ? 3000 : false;
        },
        staleTime: 1000,
    });
}

export function useConnectionFindings(connectionId: string) {
    const { isLoaded, isSignedIn } = useAuth();

    return useQuery({
        queryKey: ['connection-findings', connectionId],
        queryFn: async () => {
            try {
                const response = await api.get(`/connections/${connectionId}/findings`);
                return {
                    findings: response.data ?? response,
                    isLocked: false
                };
            } catch (error: any) {
                if (error?.response?.status === 403 || error?.status === 403) {
                    return {
                        findings: null,
                        isLocked: true
                    };
                }
                throw error;
            }
        },
        enabled: !!connectionId && isLoaded && !!isSignedIn,
        staleTime: 10000,
    });
}