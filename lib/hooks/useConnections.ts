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

    // Optimistic Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => connectionsApi.delete(id),
        onMutate: async (deletedId: string) => {
            await queryClient.cancelQueries({ queryKey: ['connections'] });

            const previousConnections = queryClient.getQueryData<Connection[]>(['connections']);

            queryClient.setQueryData<Connection[]>(['connections'], (old) =>
                old ? old.filter((connection) => connection.id !== deletedId) : []
            );

            return { previousConnections };
        },
        onError: (err, deletedId, context) => {
            if (context?.previousConnections) {
                queryClient.setQueryData(['connections'], context.previousConnections);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['connections'] });
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
        runAudit: auditMutation.mutate,
        isTriggeringAudit: auditMutation.isPending,
        auditError: auditMutation.error,
        updateConnection: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
    };
}