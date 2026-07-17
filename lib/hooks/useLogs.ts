'use client';

import { useQuery } from '@tanstack/react-query';
import { diagnosticsApi } from '@/lib/api/diagnostics';

export function useLogs(connectionId: string, limit = 100) {
    return useQuery({
        queryKey: ['diagnostics', 'logs', connectionId, limit],
        queryFn: async () => {
            const response = await diagnosticsApi.getLogs(connectionId, limit);
            return response.data;
        },
        enabled: !!connectionId,
        staleTime: 5000, // 5 seconds
        refetchInterval: 10000, // 10 seconds
    });
}
