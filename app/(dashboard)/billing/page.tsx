'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCheckout } from '@/lib/hooks/useSubscription';
import {
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Zap,
    Lock,
    BarChart2,
    Users,
    RefreshCw,
    Bell,
    FileText,
    Clock,
    Globe,
    Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: useSearchParams() requires a Suspense boundary in Next.js App Router.
// The page is split into BillingPageContent (uses hook) wrapped in Suspense
// by the default export. This prevents the "Missing Suspense boundary" build error.
// ─────────────────────────────────────────────────────────────────────────────

// Updated Features List for Subscription Model
const FEATURES = [
    { icon: BarChart2, text: 'Full rule-by-rule audit findings' },
    { icon: AlertCircle, text: 'Critical, Warning & Info severity breakdown' },
    { icon: Users, text: 'Affected entity counts per rule' },
    { icon: ShieldCheck, text: 'Remediation action plans per issue' },
    { icon: RefreshCw, text: 'Unlimited on-demand audit runs' }, // CHANGED: Emphasize unlimited access
    //{ icon: Bell, text: 'Real-time health score monitoring' },
    { icon: FileText, text: 'Direct Links to Affected Entities to quickbooks' },
    //{ icon: Clock, text: 'Historical run comparison (30 days)' },
    { icon: Globe, text: 'Multi-company connection support' },
    //{ icon: Zap, text: 'Instant unlock — no setup, cancel anytime' },
];

const TRUST_SIGNALS = [
    'SSL-secured via Paystack',
    'Cancel anytime — no lock-in',
    'Instant access post-payment',
];

// ── Inner component that uses useSearchParams ─────────────────────────────────
function BillingPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const connectionId = searchParams.get('connectionId');

    const { mutate: checkout, isPending } = useCheckout();
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Subscribe — Audit Gen  | $49/mo';
    }, []);

    const handleSubscribe = () => {
        if (!connectionId) return;
        setCheckoutError(null);

        // CHANGED: Switch to a monthly subscription plan code
        checkout({ connectionId, planCode: "PLN_44437ae17tzxlk5" }, { // Use the correct plan code from your Paystack dashboard
            onSuccess: (data: any) => {
                const url = data?.data?.authorizationUrl ?? data?.authorizationUrl;
                if (url) {
                    window.location.href = url;
                } else {
                    setCheckoutError('Checkout URL missing. Please try again.');
                }
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to start checkout. Please try again.';
                setCheckoutError(msg);
            },
        });
    };

    // ── Missing connectionId ─────────────────────────────────────────────────
    if (!connectionId) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                    <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
                </div>
                <div className="space-y-2 max-w-sm">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        No connection selected
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Return to the dashboard and click <strong>Subscribe</strong> from
                        your diagnostics panel to link a connection.
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest h-11 px-6 rounded-xl shadow-lg"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    // ── Main billing layout ──────────────────────────────────────────────────
    return (
        <div className="min-h-[80vh] flex flex-col">

            {/* Back nav */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto w-full">

                {/* ── Left — Pricing Card ─────────────────────────────────── */}
                <div className="relative">
                    {/* Glow decoration */}
                    <div
                        className="absolute -inset-4 rounded-[32px] opacity-[0.06] blur-2xl pointer-events-none bg-[radial-gradient(circle_at_50%_30%,hsl(199,89%,48%),transparent_70%)]"
                        aria-hidden="true"
                    />

                    <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-100/80 overflow-hidden">
                        {/* Accent strip */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-[linear-gradient(90deg,hsl(199,89%,48%),hsl(199,89%,65%))]"
                        />

                        {/* Header badge */}
                        <div className="inline-flex items-center gap-2 bg-[hsl(199,89%,48%)]/10 text-[hsl(199,89%,40%)] border border-[hsl(199,89%,48%)]/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                            <Star className="h-3 w-3" />
                            Audit Gen Pro Monthly
                        </div>

                        {/* Price block */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-6xl font-mono font-black text-slate-900 tracking-tighter">
                                    $49
                                </span>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-sm font-bold text-slate-500">/ month</span> {/* CHANGED: Indicate recurring price */}
                                </div>
                            </div>
                            <p className="text-[12px] text-slate-400 font-medium">
                                Billed monthly · Cancel anytime {/* CHANGED: Clarify billing cycle */}
                            </p>
                        </div>

                        <div className="h-px bg-slate-100 mb-6" />

                        {/* Included features preview */}
                        <div className="space-y-2 mb-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                What you unlock
                            </p>
                            {[
                                'Full rule-by-rule findings',
                                'Exact affected entity counts',
                                'Remediation action plans',
                                'Unlimited on-demand audits', // CHANGED: Reflect unlimited access
                            ].map(item => (
                                <div key={item} className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-slate-700">{item}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <button
                            id="billing-subscribe-btn"
                            onClick={handleSubscribe}
                            disabled={isPending}
                            aria-busy={isPending}
                            className={cn(
                                'w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-3 shadow-xl',
                                isPending
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-slate-900 hover:bg-black text-white shadow-slate-900/25 active:scale-[0.98]'
                            )}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Connecting to Paystack…
                                </>
                            ) : (
                                <>
                                    <Lock className="h-4 w-4" />
                                    Subscribe Now — $49/mo {/* CHANGED: Reflect subscription action */}
                                </>
                            )}
                        </button>

                        {/* Inline error */}
                        {checkoutError && (
                            <div
                                role="alert"
                                aria-live="polite"
                                className="mt-4 flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl"
                            >
                                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest">
                                        Checkout Failed
                                    </p>
                                    <p className="text-[12px] text-rose-500 font-medium mt-0.5 break-words">
                                        {checkoutError}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setCheckoutError(null)}
                                    className="text-rose-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest shrink-0"
                                    aria-label="Dismiss error"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* Trust signals */}
                        <div className="mt-6 flex flex-col gap-2">
                            {TRUST_SIGNALS.map(signal => (
                                <div key={signal} className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                    <ShieldCheck className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                                    {signal}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right — Feature grid ─────────────────────────────────── */}
                <div className="space-y-8 lg:pt-4">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <Zap className="h-3 w-3" />
                            Monthly Access {/* CHANGED: Reflect recurring nature */}
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            Unlock full<br />
                            <span className="text-[hsl(199,89%,48%)]">diagnostic findings</span>
                        </h1>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">
                            Your audit already ran — the issues are real. Subscribe to see
                            exactly which transactions are at risk and how to fix them before
                            they become a compliance problem. {/* CHANGED: Generalize text */}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {FEATURES.map(({ icon: Icon, text }) => (
                            <div
                                key={text}
                                className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-sm transition-all"
                            >
                                <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                    <Icon className="h-4 w-4 text-slate-500" />
                                </div>
                                <span className="text-[12px] font-semibold text-slate-700 leading-tight">
                                    {text}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Social proof */}
                    <div className="flex items-center gap-4 p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[12px] font-black text-emerald-800">
                                Built for QuickBooks Online teams
                            </p>
                            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                                Covers 20+ diagnostic rules across AR, AP, Banking, and Ledger hygiene.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Suspense fallback ─────────────────────────────────────────────────────────
function BillingPageSkeleton() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
        </div>
    );
}

// ── Default export with required Suspense wrapper ─────────────────────────────
export default function BillingPage() {
    return (
        <Suspense fallback={<BillingPageSkeleton />}>
            <BillingPageContent />
        </Suspense>
    );
}