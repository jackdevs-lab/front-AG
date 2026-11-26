import Link from 'next/link';
import type { Metadata } from 'next';
import {
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    Building2,
    Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Pricing — Audit Gen',
    description:
        'Free QuickBooks Online health checks on every company you connect. Upgrade for entity-level findings and direct QuickBooks links.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Free: summary-level diagnostics on every connected company.
// Paid: entity-level breakdown + deep links into QuickBooks.
// ─────────────────────────────────────────────────────────────────────────────

const FREE_FEATURES = [
    'Connect all your QuickBooks Online companies',
    'Total exposure amount per company',
    'Every rule triggered across your ledger',
    'Exposure amount per rule',
    'Affected entity counts',
    'Unlimited on-demand audit runs',
    'Read-only access — we never modify your books',
];

const SINGLE_FEATURES = [
    'Everything in the Free plan',
    'Breakdown of individual affected entities',
    'See the exact invoices, bills and contacts behind every flag',
    'Exposure amount per individual entity',
    'Direct QuickBooks links that open each affected record',
];

const TRUST_SIGNALS = [
    'SSL-secured via Paystack',
    'Cancel anytime — no lock-in',
    'Instant access post-payment',
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-zinc-50 font-sans antialiased text-zinc-900 pb-24">
            {/* Header Section */}
            <div className="pt-24 pb-16 text-center px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">
                    Start free. Upgrade when you need the details.
                </h1>
                <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                    Every company you connect gets a full health check free — total exposure,
                    rules triggered, and affected entity counts. The paid plan opens the
                    entity-by-entity breakdown and links straight into QuickBooks.
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-8 items-start">

                    {/* ── Free Plan ─────────────────────────────────────────────── */}
                    <div className="relative bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-8 flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <Search className="w-5 h-5 text-zinc-400" />
                                <h2 className="text-lg font-semibold text-zinc-900">Free Health Check</h2>
                            </div>

                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-bold tracking-tight text-zinc-900">$0</span>
                                <span className="text-sm font-medium text-zinc-500">/ forever</span>
                            </div>
                            <p className="text-sm text-zinc-500 mb-8 pb-8 border-b border-zinc-100">
                                Free on every QuickBooks Online company you connect. No credit card required.
                            </p>

                            <ul className="space-y-4 mb-8">
                                {FREE_FEATURES.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                                        <span className="text-sm text-zinc-600 leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-8 pt-0 mt-auto">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full h-12 border-zinc-300 text-zinc-900 rounded-md font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <Link href="/dashboard">
                                    Connect a company <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Read-only via Intuit OAuth
                            </div>
                        </div>
                    </div>

                    {/* ── Single Company Plan ($49) ─────────────────────────────── */}
                    <div className="relative bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900" />

                        <div className="p-8 flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-zinc-400" />
                                    <h2 className="text-lg font-semibold text-zinc-900">Single Company</h2>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                                    Full detail
                                </span>
                            </div>

                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-bold tracking-tight text-zinc-900">$49</span>
                                <span className="text-sm font-medium text-zinc-500">/ month</span>
                            </div>
                            <p className="text-sm text-zinc-500 mb-8 pb-8 border-b border-zinc-100">
                                Billed monthly per connected QuickBooks Online file. Cancel anytime.
                            </p>

                            <ul className="space-y-4 mb-8">
                                {SINGLE_FEATURES.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                                        <span className="text-sm text-zinc-600 leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-8 pt-0 mt-auto">
                            <Button
                                asChild
                                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <Link href="/dashboard">
                                    Get Started <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>

                            <div className="mt-6 space-y-2">
                                {TRUST_SIGNALS.map((signal) => (
                                    <div key={signal} className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        {signal}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Read-only reassurance */}
                <p className="mt-10 text-center text-sm text-zinc-500 max-w-2xl mx-auto">
                    Both plans are read-only. Audit Gen never changes your books — you review
                    every finding and make each correction yourself in QuickBooks.
                </p>
            </div>
        </div>
    );
}