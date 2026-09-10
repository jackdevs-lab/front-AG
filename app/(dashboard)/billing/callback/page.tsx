'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BillingCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Add your payment verification logic here
        const reference = searchParams.get('reference');
        if (reference) {
            console.log('Payment reference:', reference);
            // Redirect back to dashboard or handle verification
            // router.push('/dashboard'); 
        }
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-slate-600">Processing your payment...</p>
        </div>
    );
}