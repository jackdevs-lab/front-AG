// app/(dashboard)/billing/callback/page.tsx
'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CallbackInner() {
    const params = useSearchParams();
    const router = useRouter();
    const [state, setState] = useState<'verifying' | 'success' | 'failed'>('verifying');

    useEffect(() => {
        const reference = params.get('reference') || params.get('trxref');
        if (!reference) { setState('failed'); return; }

        (async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/verify?reference=${encodeURIComponent(reference)}`,
                    { credentials: 'include' }
                );
                const json = await res.json();
                setState(json.success ? 'success' : 'failed');
                if (json.success) setTimeout(() => router.replace('/dashboard'), 2500);
            } catch {
                setState('failed');
            }
        })();
    }, [params, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            {state === 'verifying' && <p>Confirming your payment…</p>}
            {state === 'success' && <p>Subscription activated! Redirecting…</p>}
            {state === 'failed' && <p>We couldn't confirm this payment. Contact support.</p>}
        </div>
    );
}

export default function PaymentCallbackPage() {
    return <Suspense fallback={null}><CallbackInner /></Suspense>;
}