import Link from 'next/link';
import type { Metadata } from 'next';
import {
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    Building2,
    Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Pricing — Audit Gen',
    description: 'Professional-grade QuickBooks Online health oversight pricing.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared feature definitions for the pricing tiers
// ─────────────────────────────────────────────────────────────────────────────

const SINGLE_FEATURES = [
    '1 QuickBooks Online connection',
    'Full rule-by-rule audit findings',
    'Critical, Warning & Info severity breakdown',
    'Affected entity counts & direct QuickBooks Online links',
    'Remediation action plans per issue',
    'Unlimited on-demand audit runs',
];

const FIRM_FEATURES = [
    'Up to 5 QuickBooks Online connections',
    'Unified multi-client health dashboard',
    'Client-ready executive summary reports',
    'Priority email and chat support',
    'Historical trend comparison (90 days)',
    'Everything in the Single Company plan',
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
                    Transparent, predictable pricing.
                </h1>
                <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                    Professional-grade QuickBooks Online health oversight. Pay per company monitored, or scale up with our upcoming firm-level packages.
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-8 items-start">

                    {/* ── Single Company Plan ($29) ─────────────────────────────────── */}
                    <div className="relative bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
                        {/* Status Indicator */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900" />

                        <div className="p-8 flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <Building2 className="w-5 h-5 text-zinc-400" />
                                <h2 className="text-lg font-semibold text-zinc-900">Single Company</h2>
                            </div>

                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-bold tracking-tight text-zinc-900">$49</span>
                                <span className="text-sm font-medium text-zinc-500">/ month</span>
                            </div>
                            <p className="text-sm text-zinc-500 mb-8 pb-8 border-b border-zinc-100">
                                Billed monthly per connected QuickBooks Online file. Cancel anytime.
                            </p>

                            <ul className="space-y-4 mb-8">
                                {SINGLE_FEATURES.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                                        <span className="text-sm text-zinc-600 leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-8 pt-0 mt-auto">
                            {/* Standard static link replacing the mutation logic */}
                            <Button asChild className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md font-medium transition-all shadow-sm flex items-center justify-center gap-2">
                                <Link href="/dashboard">
                                    Get Started <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>

                            {/* Trust Signals */}
                            <div className="mt-6 space-y-2">
                                {TRUST_SIGNALS.map((signal, idx) => (
                                    <div key={idx} className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        {signal}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Firm Plan ($99) - Coming Soon ──────────────────────────────── */}
                    <div className="relative bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden flex flex-col h-full opacity-90">
                        <div className="p-8 flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-zinc-400" />
                                    <h2 className="text-lg font-semibold text-zinc-900">Professional Firm</h2>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                                    Coming Soon
                                </span>
                            </div>

                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-bold tracking-tight text-zinc-400">$199</span>
                                <span className="text-sm font-medium text-zinc-400">/ month</span>
                            </div>
                            <p className="text-sm text-zinc-500 mb-8 pb-8 border-b border-zinc-200">
                                Billed monthly for up to 5 connected QuickBooks Online files.
                            </p>

                            <ul className="space-y-4 mb-8">
                                {FIRM_FEATURES.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                                        <span className="text-sm text-zinc-500 leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-8 pt-0 mt-auto">
                            <Button
                                disabled
                                variant="outline"
                                className="w-full h-12 bg-transparent border-zinc-300 text-zinc-500 rounded-md font-medium cursor-not-allowed"
                            >
                                Currently in Beta
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}