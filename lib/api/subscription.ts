import { api } from '@/lib/api/client';

export const subscriptionApi = {
    /**
     * Initiates a Paystack checkout for a QbConnection.
     *
     * IMPORTANT: Pass connectionId (not realmId). The backend uses connectionId
     * as the primary key stored in Paystack metadata so the webhook can look up
     * the exact QbConnection to activate on payment success.
     */
    checkout(connectionId: string): Promise<{ success: boolean; data: { authorizationUrl: string; accessCode: string; reference: string } }> {
        return api.post('/subscriptions/checkout', { connectionId });
    }
};
