// app/(dashboard)/error.tsx
'use client';

import { useEffect } from 'react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong!</h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Try again
            </button>
        </div>
    );
}