'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSubscriptionStatus } from '@/lib/hooks/useSubscriptionCheckout';

interface PaymentVerificationModalProps {
    connectionId: string;
}

export function PaymentVerificationModal({ connectionId }: PaymentVerificationModalProps) {
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const [isSuccess, setIsSuccess] = useState(false);

    // Polls the backend for the current subscription status
    const { data: status, error } = useSubscriptionStatus(connectionId);

    useEffect(() => {
        if (status === 'ACTIVE' && !isSuccess) {
            setIsSuccess(true);

            // 1. Invalidate cached data to immediately unlock the dashboard UI
            queryClient.invalidateQueries({ queryKey: ['connections'] });
            queryClient.invalidateQueries({ queryKey: ['diagnostics'] });

            // 2. Delay the redirect slightly so the user registers the success message
            const timeoutId = setTimeout(() => {
                // Replacing with just the pathname strips all Paystack query parameters
                router.replace(pathname);
            }, 2000);

            return () => clearTimeout(timeoutId);
        }
    }, [status, isSuccess, queryClient, router, pathname]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center border border-slate-200">
                {isSuccess ? (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">Payment Confirmed!</h2>
                        <p className="text-sm text-slate-500 font-medium">Unlocking your full diagnostic findings...</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <Loader2 className="mx-auto h-12 w-12 text-slate-900 animate-spin mb-6" />
                        <h2 className="text-xl font-black text-slate-900 mb-2">Verifying Payment</h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Waiting for secure confirmation from Paystack. This usually takes a few seconds.
                        </p>

                        {error && (
                            <div className="mt-6 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-left">
                                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-amber-700 font-medium leading-tight">
                                    Taking longer than expected. We are still attempting to verify your transaction.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}