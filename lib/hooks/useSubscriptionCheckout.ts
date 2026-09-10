//lib/hooks/useSubscriptionCheckout.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../api/subscription';
import { api } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';

interface ConnectionStatusData {
    subscriptionStatus: string;
}

// 1. Checkout Mutation (From your Hook 2)
export function useCheckout() {
    return useMutation({
        mutationFn: ({ connectionId, planCode }: { connectionId: string, planCode: string }) =>
            subscriptionsApi.checkout({ connectionId, planCode }),
    });
}

// 2. Status Polling Query (Replacing Hook 1's manual loop)
export function useSubscriptionStatus(connectionId: string) {
    return useQuery({
        queryKey: ['subscription-status', connectionId],
        queryFn: async () => {
            const res = await api.get(`/connections/${connectionId}/subscription`);
            return res.data.status;
        },
        // Poll every 3 seconds. Stop polling once the status is ACTIVE.
        refetchInterval: (query) => (query.state.data === 'ACTIVE' ? false : 3000),
    });
}