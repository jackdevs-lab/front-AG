/**import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../api/subscription';

/**
 * Initiates a Paystack checkout for a connection.
 * On success, redirects the user to Paystack's hosted payment page.
 * After payment, Paystack redirects back to the app's success page.
 *
 * Pass connectionId — the subscription API now expects connectionId (not realmId).
 
export function useCheckout() {
    return useMutation({
        mutationFn: ({ connectionId, planCode }: { connectionId: string, planCode: string }) => subscriptionsApi.checkout({ connectionId, planCode }),
    });
}
**/