// components/dashboard/DashboardErrorFallback.tsx
'use client';

import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-sm w-full bg-white rounded-3xl border border-zinc-100 p-8 text-center shadow-sm space-y-6">
                <div className="mx-auto w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500">
                    <AlertCircle className="w-5 h-5" />
                </div>

                <div className="space-y-1.5">
                    <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
                        Oops, something went wrong
                    </h2>
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-[260px] mx-auto">
                        {isAuthOrConnectionError
                            ? 'Please log back in again if its possible to resume your QuickBooks session.'
                            : 'An unexpected issue occurred while loading this view. You can try refreshing the dashboard.'}
                    </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                    {isAuthOrConnectionError ? (
                        <Button
                            className="w-full bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-10 gap-2 text-xs font-medium shadow-sm transition-all"
                            onClick={() => window.location.href = '/sign-in'}
                        >
                            <LogIn className="w-3.5 h-3.5" />
                            Log Back In
                        </Button>
                    ) : (
                        <Button
                            onClick={resetErrorBoundary || (() => window.location.reload())}
                            className="w-full bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-10 gap-2 text-xs font-medium shadow-sm transition-all"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Reload Dashboard
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}