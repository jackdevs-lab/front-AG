import { api } from '@/lib/api/client';
import { ApiResponse } from '@/types/api';

export interface CheckoutRequest {
    connectionId: string;
    planCode: string;
}

export interface CheckoutResponseData {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
}

export const subscriptionsApi = {
    checkout(data: CheckoutRequest): Promise<ApiResponse<CheckoutResponseData>> {
        return api.post('/subscriptions/checkout', data);
    }
};