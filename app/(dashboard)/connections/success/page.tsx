'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: useSearchParams() requires a Suspense boundary in Next.js App Router.
// The page is split into ConnectionSuccessPageContent (uses hook) wrapped in
// Suspense by the default export. This prevents the "Missing Suspense boundary"
// static build error.
// ─────────────────────────────────────────────────────────────────────────────

function ConnectionSuccessPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const realmId = searchParams.get('realmId');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#2CA01C] to-emerald-400 rounded-full blur-3xl opacity-20 animate-pulse" />
                <div className="relative bg-white p-6 rounded-full shadow-2xl border border-[#2CA01C]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-16 h-16 text-[#2CA01C]" />
                </div>
            </div>

            <div className="text-center space-y-2 max-w-md">
                <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-[#2CA01C] to-gray-600">
                    Connection Successful!
                </h1>
                <p className="text-lg text-muted-foreground font-medium">
                    Your QuickBooks company{' '}
                    <span className="text-gray-900 font-bold">
                        {realmId ? `(${realmId.slice(0, 8)})` : ''}
                    </span>{' '}
                    is now linked.
                </p>
                <p className="text-sm text-gray-400">
                    Your financial data is being analyzed for health diagnostics.
                </p>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
                <Button
                    asChild
                    className="h-12 px-8 text-base font-bold bg-[#2CA01C] hover:bg-[#1D6E11] shadow-lg shadow-[#2CA01C]/20 rounded-xl"
                >
                    <Link href="/dashboard" className="flex items-center gap-2">
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting in {countdown}s...
                </div>
            </div>
        </div>
    );
}

function ConnectionSuccessPageSkeleton() {
    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
        </div>
    );
}

export default function ConnectionSuccessPage() {
    return (
        <Suspense fallback={<ConnectionSuccessPageSkeleton />}>
            <ConnectionSuccessPageContent />
        </Suspense>
    );
}
