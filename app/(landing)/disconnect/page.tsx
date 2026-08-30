'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
    Unlink,
    ArrowRight,
    ShieldAlert,
    Database,
    RefreshCw
} from 'lucide-react';


function DisconnectContent() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const searchParams = useSearchParams();
    const realmId = searchParams.get('realmId');

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;
        async function triggerCleanup() {
            try {
                const token = await getToken();
                if (!token) return;

                const rawApiUrl = process.env.API_URL || '';
                const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
                const endpoint = `${cleanApiUrl}/api/connections/verify-and-sync`;

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ realmId: realmId || undefined }),
                });

                if (!res.ok) {
                    console.error('Disconnect cleanup failed with status:', res.status);
                }
            }
            catch (error) {
                console.error('Disconnect cleanup failed:', error);
            }
        }

        triggerCleanup();
    }, [getToken, realmId]);

    return (
        <main className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center px-6 py-12 antialiased font-sans text-zinc-900">
            <div className="max-w-3xl mx-auto w-full">

                {/* Minimalist Header */}
                <div className="mb-16">
                    <Unlink className="w-8 h-8 text-zinc-300 mb-8 stroke-[1.5]" />
                    <h1 className="text-3xl md:text-5xl font-light tracking-tight mb-5">
                        QuickBooks disconnected.
                    </h1>
                    <p className="text-zinc-500 text-lg md:text-xl font-light max-w-xl leading-relaxed">
                        Your company connection has been unlinked from Audit Gen. All active access tokens have been permanently invalidated.
                    </p>
                </div>

                {/* Delicate Separator */}
                <hr className="border-zinc-200/60 mb-16" />

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-16 mb-20">
                    {/* What this means */}
                    <div>
                        <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-[0.2em] mb-8">
                            What this means
                        </h2>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <ShieldAlert className="w-5 h-5 text-zinc-400 shrink-0 stroke-[1.5]" />
                                <span className="text-sm text-zinc-600 leading-relaxed font-light">
                                    Automated health checks and diagnostic rules are paused.
                                </span>
                            </li>
                            <li className="flex gap-4">
                                <RefreshCw className="w-5 h-5 text-zinc-400 shrink-0 stroke-[1.5]" />
                                <span className="text-sm text-zinc-600 leading-relaxed font-light">
                                    Financial transaction syncing is completely disabled.
                                </span>
                            </li>
                            <li className="flex gap-4">
                                <Database className="w-5 h-5 text-zinc-400 shrink-0 stroke-[1.5]" />
                                <span className="text-sm text-zinc-600 leading-relaxed font-light">
                                    Historical audit reports remain securely stored.
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* How to reconnect */}
                    <div>
                        <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-[0.2em] mb-8">
                            Reconnection
                        </h2>
                        <ol className="space-y-6">
                            <li className="flex gap-4">
                                <span className="text-xs font-medium text-zinc-400 mt-0.5">01</span>
                                <span className="text-sm text-zinc-600 leading-relaxed font-light">
                                    Return to the <strong className="text-zinc-900 font-medium">Connections</strong> tab in your dashboard.
                                </span>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-xs font-medium text-zinc-400 mt-0.5">02</span>
                                <span className="text-sm text-zinc-600 leading-relaxed font-light">
                                    Select <strong className="text-zinc-900 font-medium">Connect to QuickBooks</strong> to re-authorize.
                                </span>
                            </li>
                        </ol>
                    </div>
                </div>

                {/* Elegant CTA */}
                <div>
                    <Link
                        href="/connections"
                        className="inline-flex items-center text-sm font-medium text-zinc-900 hover:text-zinc-500 transition-colors group gap-3"
                    >
                        Return to Dashboard
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[1.5]" />
                    </Link>
                </div>

            </div>
        </main>
    );
}

export default function DisconnectPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center antialiased font-sans">
                <div className="flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-zinc-400 animate-spin stroke-[1.5]" />
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.2em]">Updating state</p>
                </div>
            </main>
        }>
            <DisconnectContent />
        </Suspense>
    );
}