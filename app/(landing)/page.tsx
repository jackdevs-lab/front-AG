import React from 'react';
import Link from 'next/link';
import {
    CheckCircle2,
    ArrowRight,
    BarChart3,
    ShieldCheck,
    Search,
    AlertCircle,
    FileText,
    Briefcase,
    Building2,
    LineChart,
    Shield,
    AlertTriangle,
    Users,
    TrendingDown
} from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-zinc-900 antialiased font-sans">
            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link className="flex items-center gap-3" href="/">
                        <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center">
                            <span className="font-bold text-sm text-white tracking-widest">AG</span>
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-zinc-900">
                            Audit Gen
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
                        <Link className="hover:text-zinc-900 transition-colors" href="#platform">
                            Platform
                        </Link>
                        <Link className="hover:text-zinc-900 transition-colors" href="/issues">
                            Support
                        </Link>
                        <Link className="hover:text-zinc-900 transition-colors" href="/pricing">
                            See Pricing
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <SignUpButton mode="modal">
                            <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2">
                                Sign in
                            </button>
                        </SignUpButton>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <Button size="sm" className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-md shadow-sm transition-all px-4">
                                Start monitoring
                            </Button>
                        </SignUpButton>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 bg-zinc-50 border-b border-zinc-200 overflow-hidden">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">

                            {/* Hero Content */}
                            <div className="flex flex-col items-start space-y-8 text-left z-10">
                                <div className="space-y-4">
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
                                        Professional-grade <br />
                                        Quickbooks Health Monitor.
                                    </h1>
                                    <p className="text-lg text-zinc-600 max-w-lg leading-relaxed">
                                        The continuous monitoring standard for modern bookkeepers and CPAs. Audit Gen automatically scans your QuickBooks Online ledger to catch discrepancies, enforce compliance, and protect your financial integrity.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                        <Button size="lg" className="h-12 px-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md shadow-sm font-medium gap-2 w-full sm:w-auto">
                                            Connect QuickBooks <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </SignUpButton>
                                    <Link href="/pricing">
                                        <Button variant="outline" size="lg" className="h-12 px-6 bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-300 rounded-md font-medium transition-all w-full sm:w-auto">
                                            See Plans
                                        </Button>
                                    </Link>
                                </div>

                                <div className="flex items-center gap-6 text-sm font-medium text-zinc-500 pt-4">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-zinc-400" />
                                        <span>Read-only access</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                                        <span>SOC2 Compliant</span>
                                    </div>
                                </div>
                            </div>

                            {/* Realistic Mock UI adapted from Attachments */}
                            <div className="relative w-full max-w-2xl mx-auto lg:max-w-none lg:mx-0">
                                <div className="relative bg-slate-50/80 backdrop-blur-sm rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden">

                                    {/* Mock App Header */}
                                    <div className="h-12 border-b border-slate-200 px-5 flex items-center justify-between bg-white">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded px-2.5 py-1">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Entity:</span>
                                            <span className="text-[11px] font-bold text-slate-700">Anne's Flower Store</span>
                                        </div>
                                    </div>

                                    {/* Dashboard Body */}
                                    <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

                                        {/* Card 1: Health Score */}
                                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col col-span-1">
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-slate-400" />
                                                    <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Health Score</h2>
                                                </div>
                                                <span className="bg-rose-100/60 text-rose-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    Critical
                                                </span>
                                            </div>

                                            <div className="flex items-baseline gap-1 mb-4">
                                                <span className="text-5xl font-bold text-rose-500 tracking-tighter">45</span>
                                                <span className="text-sm font-semibold text-slate-300">/100</span>
                                            </div>

                                            <div className="w-full h-2 bg-slate-100 rounded-full mb-5 overflow-hidden">
                                                <div className="h-full bg-rose-500 w-[45%] rounded-full"></div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex-1 text-center py-1.5 border border-emerald-100 bg-emerald-50/50 text-emerald-600 text-[9px] font-bold rounded uppercase tracking-wider">Passed</div>
                                                <div className="flex-1 text-center py-1.5 border border-amber-100 bg-white text-amber-500 text-[9px] font-bold rounded uppercase tracking-wider">Warn</div>
                                                <div className="flex-1 text-center py-1.5 border border-rose-100 bg-white text-rose-500 text-[9px] font-bold rounded uppercase tracking-wider">Crit</div>
                                            </div>
                                        </div>

                                        {/* Card 2: Detected Issues */}
                                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col col-span-1">
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-slate-400" />
                                                    <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Detected Issues</h2>
                                                </div>
                                            </div>

                                            <div className="flex items-baseline gap-2 mb-6">
                                                <span className="text-5xl font-bold text-slate-800 tracking-tighter">77</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Risks</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                <div className="bg-rose-50/40 border border-rose-100 rounded-lg p-3 flex flex-col justify-center">
                                                    <p className="text-[9px] font-bold text-rose-600 uppercase tracking-widest mb-1">Critical</p>
                                                    <p className="text-xl font-bold text-rose-600">0</p>
                                                </div>
                                                <div className="bg-amber-50/40 border border-amber-100 rounded-lg p-3 flex flex-col justify-center">
                                                    <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-1">Warning</p>
                                                    <p className="text-xl font-bold text-amber-600">77</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 3: Impact Scope (Spans full width) */}
                                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between col-span-1 sm:col-span-2 gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Impact Scope</h2>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-bold text-slate-800 tracking-tighter">142</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Affected Entities</span>
                                                </div>
                                            </div>

                                            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex items-center gap-6">
                                                <div>
                                                    <p className="text-[9px] font-bold text-rose-600 uppercase tracking-widest mb-1">Estimated Exposure</p>
                                                    <p className="text-2xl font-bold text-rose-600">$166,250.00</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-lg bg-rose-100/50 flex items-center justify-center border border-rose-100 shrink-0">
                                                    <TrendingDown className="w-5 h-5 text-rose-600" />
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="platform" className="py-24 bg-white">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mb-16">
                            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-4">
                                Built for absolute accuracy.
                            </h2>
                            <p className="text-lg text-zinc-600">
                                We designed Audit Gen to remove the guesswork from month-end close. Run comprehensive diagnostics across your QuickBooks Online files with a platform trusted by professional accountants.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
                            {/* Feature 1 */}
                            <div className="flex flex-col items-start">
                                <div className="w-10 h-10 rounded bg-zinc-100 flex items-center justify-center mb-5">
                                    <Building2 className="w-5 h-5 text-zinc-900" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">On Demand Data Sync</h3>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    Connect directly to QuickBooks Online. Our engine pulls your general ledger, vendor records, and chart of accounts securely in the background.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex flex-col items-start">
                                <div className="w-10 h-10 rounded bg-zinc-100 flex items-center justify-center mb-5">
                                    <FileText className="w-5 h-5 text-zinc-900" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">30+ Proprietary Rules</h3>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    Our auditor-designed algorithms scan for unlinked payments, uncategorized income, abnormal balances, and broken reconciliations instantly.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex flex-col items-start">
                                <div className="w-10 h-10 rounded bg-zinc-100 flex items-center justify-center mb-5">
                                    <LineChart className="w-5 h-5 text-zinc-900" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Executive Reporting</h3>
                                <p className="text-sm text-zinc-600 leading-relaxed">
                                    Generate clean, client-ready QuickBooks Online Health reports. Track historical hygiene scores and demonstrate the value of your bookkeeping services.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data Security & Process */}
                {/* Data Security & Remediation */}
                <section className="py-24 bg-zinc-50 border-t border-zinc-200 overflow-hidden">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">

                            {/* Left Content */}
                            <div>
                                <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-6">
                                    Direct Links. Instant remediation.
                                </h2>
                                <p className="text-zinc-600 mb-8 leading-relaxed">
                                    Your clients' financial data requires the highest level of protection. Audit Gen operates under a strict read-only protocol to surface errors, while providing <strong>secure, direct deep links</strong> to instantly inspect and correct flagged transactions within your QuickBooks Online ledger.
                                </p>

                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-zinc-900 shrink-0 mt-0.5" />
                                        <span className="text-sm text-zinc-700 font-medium">Read-only OAuth 2.0 Intuit integration</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-zinc-900 shrink-0 mt-0.5" />
                                        <span className="text-sm text-zinc-700 font-medium">One-click deep linking to QuickBooks Online source records</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-zinc-900 shrink-0 mt-0.5" />
                                        <span className="text-sm text-zinc-700 font-medium">No writing or modifying capabilities</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Right Content: Realistic QuickBooks Link Mock UI */}
                            <div className="relative w-full max-w-xl mx-auto lg:max-w-none lg:mx-0">
                                <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden font-sans">

                                    {/* Mock Header */}
                                    <div className="p-6 lg:p-8 border-b border-zinc-100">
                                        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">Payment Date Before Invoice</h3>
                                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Warning</span>
                                    </div>

                                    {/* Risk Status Banner */}
                                    <div className="px-6 lg:px-8 py-5 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Risk Status</p>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                                                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Integrity Breaches Found</span>
                                            </div>
                                        </div>
                                        <div className="bg-rose-50/70 border border-rose-100 rounded-lg px-4 py-2 flex items-center gap-2">
                                            <TrendingDown className="w-4 h-4 text-rose-600" />
                                            <span className="text-lg font-bold text-rose-600 tracking-tight">$700.00.</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="px-6 lg:px-8 pb-6 flex items-center gap-4">
                                        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-500 w-[65%] rounded-full"></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Audit Precision: 98%</span>
                                    </div>

                                    {/* Diagnostic Incidents Body */}
                                    <div className="p-6 lg:p-8 bg-zinc-50/50 border-t border-zinc-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Diagnostic Incidents</h4>
                                                <span className="bg-zinc-100 text-zinc-600 text-xs font-bold px-2.5 py-0.5 rounded-full">1</span>
                                            </div>
                                        </div>

                                        {/* Incident Card */}
                                        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                                            <h5 className="font-semibold text-zinc-900 mb-4">Payment 2736 Integrity Exception</h5>

                                            <div className="flex flex-wrap gap-2 mb-5">
                                                <span className="text-[10px] font-medium bg-zinc-50 border border-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md font-mono">
                                                    ID: xxxxxxx
                                                </span>
                                                <span className="text-[10px] font-medium bg-zinc-50 border border-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md font-mono">
                                                    PAYMENT 2736
                                                </span>
                                            </div>

                                            <p className="text-sm text-zinc-700 mb-8 leading-relaxed">
                                                Payment of $700.00 on 2026-05-31 is linked to Invoice 2737 dated 2026-06-13 (in the future).
                                            </p>

                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                                                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    Verified Incident
                                                </div>

                                                {/* Direct QuickBooks Link Button (Static UI) */}
                                                <div className="inline-flex items-center justify-center gap-2 bg-[#2CA01C] hover:bg-[#108000] transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm cursor-pointer">
                                                    <BarChart3 className="w-4 h-4 rotate-90" />
                                                    QuickBooks Link
                                                    <ArrowRight className="w-3.5 h-3.5 -rotate-45 ml-1 opacity-80" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Simple CTA */}
                <section className="py-24 bg-white border-t border-zinc-200">
                    <div className="container mx-auto max-w-4xl px-4 text-center">
                        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-6">
                            Ready to standardize your bookkeeping?
                        </h2>
                        <p className="text-lg text-zinc-600 mb-8 max-w-2xl mx-auto">
                            Join the firms using Audit Gen to maintain impeccable QuickBooks Online health and catch costly errors before they become liabilities.
                        </p>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <Button size="lg" className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md font-medium shadow-sm">
                                Get started for free
                            </Button>
                        </SignUpButton>
                    </div>
                </section>
            </main>

            {/* Clean Footer */}
            <footer className="border-t border-zinc-200 bg-white py-12">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center">
                            <span className="font-bold text-[10px] text-white tracking-widest">AG</span>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900">Audit Gen Inc.</span>
                    </div>

                    <p className="text-sm text-zinc-500">
                        © 2026 Audit Gen. All rights reserved. QuickBooks is a trademark of Intuit Inc.
                    </p>

                    <nav className="flex gap-6 text-sm font-medium text-zinc-500">
                        <Link href="/tos" className="hover:text-zinc-900 transition-colors">
                            Terms
                        </Link>
                        <Link href="/privacy" className="hover:text-zinc-900 transition-colors">
                            Privacy
                        </Link>

                    </nav>
                </div>
            </footer>
        </div>
    );
}