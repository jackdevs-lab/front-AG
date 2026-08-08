'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

function DisconnectContent() {
    const { getToken } = useAuth();
    const searchParams = useSearchParams();
    const realmId = searchParams.get('realmId');

    useEffect(() => {
        async function triggerCleanup() {
            try {
                const token = await getToken();
                if (!token) return;

                // Pass the realmId from Intuit's query params to immediately identify and purge the DB record
                await fetch('/api/connections/verify-and-sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ realmId }),
                    credentials: 'include'
                });
            } catch (err) {
                console.error('Failed to purge disconnected state:', err);
            }
        }

        triggerCleanup();
    }, [getToken, realmId]);

    return (
        <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center px-6 py-16 sm:py-24">
            <div className="w-full max-w-md space-y-8">
                {/* Header & Explicit Notice */}
                <header className="space-y-2">
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                        QuickBooks Integration
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-gray-900">
                        Disconnected
                    </h1>
                    <p className="text-gray-500 text-sm leading-relaxed pt-1">
                        Your QuickBooks company connection has been unlinked from AuditorGen. All active access tokens have been invalidated.
                    </p>
                </header>

                <hr className="border-gray-100" />

                {/* Intuit Requirement: Implications of Disconnection */}
                <section className="space-y-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        What this means
                    </h2>
                    <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside marker:text-gray-300">
                        <li>Automated accounting health checks and discrepancy diagnostics are paused.</li>
                        <li>Financial transaction syncs between QuickBooks and AuditorGen are disabled.</li>
                        <li>Your historical audit reports remain safely stored in your account.</li>
                    </ul>
                </section>

                <hr className="border-gray-100" />

                {/* Intuit Requirement: Steps to Reconnect */}
                <section className="space-y-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        How to reconnect
                    </h2>
                    <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside marker:font-medium marker:text-gray-400">
                        <li>Log in to your <strong className="text-gray-900 font-medium">AuditorGen</strong> account.</li>
                        <li>Navigate to <strong className="text-gray-900 font-medium">Connections</strong> in the main navigation.</li>
                        <li>Click <strong className="text-gray-900 font-medium">"Connect to QuickBooks"</strong> to re-authorize.</li>
                    </ol>
                </section>

                {/* CTA */}
                <div className="pt-4">
                    <Link
                        href="/connections"
                        className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors w-full sm:w-auto"
                    >
                        Return to Connections
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function DisconnectPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-xs text-gray-400 font-medium">Updating connection state...</p>
            </main>
        }>
            <DisconnectContent />
        </Suspense>
    );
}