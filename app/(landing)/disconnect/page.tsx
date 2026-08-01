// qb-health-frontend/app/(landing)/disconnect/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DisconnectPage() {
    const { getToken } = useAuth();

    useEffect(() => {
        // Fires silently in the background without blocking the UI
        async function triggerCleanup() {
            try {
                const token = await getToken();
                await fetch('/api/connections/verify-and-sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include'
                });
            } catch (err) {
                console.error('Failed to sync connection state on disconnect', err);
            }
        }

        triggerCleanup();
    }, [getToken]);

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background ambient blurs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 p-8 shadow-2xl text-center">
                <div className="flex flex-col items-center justify-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">

                    {/* App Logo */}
                    <div className="flex justify-center mb-2">
                        <Image
                            src="/icon.png"
                            alt="Audit Gen Logo"
                            width={56}
                            height={56}
                            className="rounded-2xl shadow-sm border border-gray-100 bg-white"
                            priority
                        />
                    </div>

                    {/* Success Icon */}
                    <div className="flex items-center justify-center w-20 h-20 bg-green-50 rounded-2xl border border-green-100 shadow-sm">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Connection Removed
                        </h1>
                        <p className="text-gray-600 font-medium leading-relaxed">
                            Your QuickBooks account has been successfully unlinked. We have securely purged your access tokens.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Local sync status securely updated
                    </div>

                    <Link
                        href="/connections"
                        className="group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 mt-4 bg-gray-900 text-white rounded-xl font-semibold transition-all hover:bg-gray-800 hover:shadow-lg active:scale-[0.98]"
                    >
                        Return to Dashboard
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
}