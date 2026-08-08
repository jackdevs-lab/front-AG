'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function DisconnectPage() {
    const { getToken } = useAuth();

    useEffect(() => {
        // Fires silently in the background without blocking the UI
        async function triggerCleanup() {
            try {
                const token = await getToken();

                // Guard: Skip background sync if user is unauthenticated or session is inactive
                if (!token) {
                    return;
                }

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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background ambient blurs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-100 p-8 shadow-2xl">
                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Status Icon */}
                    <div className="flex items-center justify-center w-16 h-16 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
                        <CheckCircle2 className="w-8 h-8 text-amber-600" />
                    </div>

                    {/* Intuit Requirement 1: Explicit Disconnect Notice */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                            Disconnected from QuickBooks Online
                        </h1>
                        <p className="text-gray-600 font-medium leading-relaxed text-sm">
                            Your QuickBooks company connection has been unlinked from AuditorGen and access tokens have been invalidated.
                        </p>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100/80 px-4 py-2 rounded-full border border-gray-200">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        OAuth tokens invalidated successfully
                    </div>

                    {/* Intuit Requirement 2: Implications of Disconnection */}
                    <div className="w-full text-left bg-amber-50/60 border border-amber-200/60 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            Implications of Disconnection
                        </div>
                        <ul className="text-xs text-amber-800/90 space-y-1.5 pl-6 list-disc font-medium">
                            <li>Automated accounting health checks and discrepancy diagnostics are paused.</li>
                            <li>Financial transaction syncs between QuickBooks and AuditorGen are disabled.</li>
                            <li>Your historical audit reports remain safely accessible in your AuditorGen account.</li>
                        </ul>
                    </div>

                    {/* Intuit Requirement 3: 1-2-3 Steps to Reconnect */}
                    <div className="w-full text-left bg-gray-50 border border-gray-200/70 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                            <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
                            How to Reconnect Audit Gen to QuickBooks
                        </div>
                        <ol className="text-xs text-gray-700 space-y-2 font-medium">
                            <li className="flex items-start gap-2">
                                <span className="flex items-center justify-center bg-blue-100 text-blue-800 font-bold rounded-full w-5 h-5 shrink-0 text-[11px]">1</span>
                                <span>Log into your <strong>Audit Gen</strong> account.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="flex items-center justify-center bg-blue-100 text-blue-800 font-bold rounded-full w-5 h-5 shrink-0 text-[11px]">2</span>
                                <span>Navigate to <strong>Company Connections</strong> in your account.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="flex items-center justify-center bg-blue-100 text-blue-800 font-bold rounded-full w-5 h-5 shrink-0 text-[11px]">3</span>
                                <span>Click the <strong>"Connect to QuickBooks"</strong> button to authorize access.</span>
                            </li>
                        </ol>
                    </div>

                    {/* Dashboard Navigation */}
                    <Link
                        href="/connections"
                        className="group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-xl font-semibold transition-all hover:bg-gray-800 hover:shadow-lg active:scale-[0.98]"
                    >
                        Go to Integrations Dashboard
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
}