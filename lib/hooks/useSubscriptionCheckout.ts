import { useState, useCallback } from 'react';
import { subscriptionsApi } from '@/lib/api/subscription';
import { api } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';

interface ConnectionStatusData {
    subscriptionStatus: string;
}

interface UseSubscriptionCheckoutReturn {
    initiateCheckout: (connectionId: string, planCode: string) => Promise<void>;
    pollSubscriptionStatus: (connectionId: string) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
}

export const useSubscriptionCheckout = (): UseSubscriptionCheckoutReturn => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const initiateCheckout = useCallback(async (connectionId: string, planCode: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await subscriptionsApi.checkout({ connectionId, planCode });

            if (response.success && response.data?.authorizationUrl) {
                window.location.href = response.data.authorizationUrl;
            } else {
                throw new Error(response.message || 'Failed to retrieve authorization URL');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during checkout initialization');
            setIsLoading(false);
        }
    }, []);

    const pollSubscriptionStatus = useCallback(async (connectionId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        const maxAttempts = 5;
        const delayMs = 3000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await api.get<ApiResponse<ConnectionStatusData>>(`/connections/${connectionId}/status`);

                if (response.success && response.data?.subscriptionStatus === 'ACTIVE') {
                    setIsLoading(false);
                    return true;
                }
            } catch (err) {
                console.error('Error polling subscription status:', err);
            }

            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        setIsLoading(false);
        setError('Subscription verification timed out. Please refresh the page in a moment to check your status.');
        return false;
    }, []);

    return {
        initiateCheckout,
        pollSubscriptionStatus,
        isLoading,
        error
    };
};