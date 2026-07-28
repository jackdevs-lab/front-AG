// components/dashboard/DashboardErrorFallback.tsx
'use client';

import { AlertTriangle, RefreshCw, LogIn, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorFallbackProps {
    error?: Error;
    resetErrorBoundary?: () => void;
}

export function DashboardErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
    const isAuthOrConnectionError =
        error?.message?.toLowerCase().includes('token') ||
        error?.message?.toLowerCase().includes('unauthorized') ||
        error?.message?.toLowerCase().includes('expired') ||
        error?.message?.toLowerCase().includes('401');

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 p-8 text-center shadow-xs space-y-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                    <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                        {isAuthOrConnectionError ? 'Session or Connection Expired' : 'Unable to Load Dashboard'}
                    </h2>
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                        {isAuthOrConnectionError
                            ? 'Your QuickBooks or user authentication session has expired. Please log back in or reconnect to resume monitoring.'
                            : 'An unexpected issue occurred while fetching your diagnostic metrics. You can try reloading the dashboard state.'}
                    </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                    {isAuthOrConnectionError ? (
                        <Button
                            className="w-full bg-zinc-900 text-white hover:bg-zinc-800 gap-2 font-medium"
                            onClick={() => window.location.href = '/sign-in'}
                        >
                            <LogIn className="w-4 h-4" />
                            Log Back In
                        </Button>
                    ) : (
                        <Button
                            onClick={resetErrorBoundary || (() => window.location.reload())}
                            className="w-full bg-zinc-900 text-white hover:bg-zinc-800 gap-2 font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Dashboard
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        asChild
                        className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50 gap-2"
                    >
                        <Link href="/issues">
                            <LifeBuoy className="w-4 h-4" />
                            Contact Support
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}