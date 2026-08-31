'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

function CallbackInner() {
    const params = useSearchParams();
    const router = useRouter();
    const { getToken } = useAuth();
    const [state, setState] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        const reference = params.get('reference') || params.get('trxref');
        if (!reference) { setState('failed'); return; }

        (async () => {
            try {
                const token = await getToken();
                const base = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(
                    `${base}/api/subscriptions/verify?reference=${encodeURIComponent(reference)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const json = await res.json().catch(() => ({}));
                console.info('[billing-callback]', res.status, json);

                if (res.ok && json.success) {
                    setState('success');
                    setTimeout(() => router.replace('/dashboard'), 2500);
                } else {
                    setState('failed');
                }
            } catch (e) {
                console.error('[billing-callback]', e);
                setState('failed');
            }
        })();
    }, [params, router, getToken]);

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