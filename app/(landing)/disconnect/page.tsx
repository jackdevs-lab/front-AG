// qb-health-frontend/app/(landing)/disconnect/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DisconnectPage() {
    const router = useRouter();

    useEffect(() => {
        // Automatically trigger backend safety-net cleanup on load
        async function triggerCleanup() {
            try {
                await fetch('/api/connections/verify-and-sync', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (err) {
                console.error('Failed to sync connection state on disconnect', err);
            }
        }

        triggerCleanup();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">QuickBooks Disconnected</h1>
            <p className="text-gray-600 mb-6">
                Your QuickBooks connection has been successfully removed.
            </p>
            <Link
                href="/connections"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Return to Connections
            </Link>
        </div>
    );
}