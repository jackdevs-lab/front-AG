// app/QuickBooks/page.tsx
import { CheckCircle2, ShieldCheck, ArrowRight, Database } from 'lucide-react';
import Link from 'next/link';
import { SignUpButton } from '@clerk/nextjs';

export const metadata = {
    title: 'QuickBooks Integration — Audit Gen',
    description: 'Discover how Audit Gen integrates with QuickBooks Online to automate diagnostic bookkeeping reviews and error detection.',
};

export default function QuickBooksIntegrationPage() {
    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-zinc-200 shrink-0">
                <Link href="/" className="font-semibold tracking-tight text-zinc-900">
                    Audit Gen
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/issues" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                        Support
                    </Link>
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors">
                            Get Started
                        </button>
                    </SignUpButton>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-12">

                {/* Hero Section */}
                <div className="flex flex-col gap-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 self-start bg-zinc-100 text-zinc-800 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                        <Database className="h-3.5 w-3.5" />
                        <span>QuickBooks Online Integration</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900">
                        Seamless, secure QuickBooks integration for automated bookkeeping audits
                    </h1>
                    <p className="text-base text-zinc-600 max-w-2xl">
                        Audit Gen connects directly to your QuickBooks Online account to perform continuous, rule-based diagnostic scanning, catching discrepancies and errors before they become issues.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-md font-medium hover:bg-zinc-800 transition-colors">
                                Get Started with Audit Gen <ArrowRight className="h-4 w-4" />
                            </button>
                        </SignUpButton>
                    </div>
                </div>

                {/* How the Integration Works */}
                <section className="bg-white p-8 rounded-lg border border-zinc-200 flex flex-col gap-6 shadow-xs">
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900">How Audit Gen Works with QuickBooks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-zinc-900" /> Secure OAuth 2.0 Connection
                            </h3>
                            <p className="text-sm text-zinc-600">
                                Connect your company file securely using Intuit’s official OAuth protocol. You maintain complete control and can revoke access instantly at any time.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-zinc-900" /> Read-Only Diagnostic Scans
                            </h3>
                            <p className="text-sm text-zinc-600">
                                Our engine safely analyzes your chart of accounts, ledgers, and transactions without altering your underlying financial records.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-zinc-900" /> Automated Discrepancy Detection
                            </h3>
                            <p className="text-sm text-zinc-600">
                                Deterministic rules automatically surface miscategorized expenses, duplicate entries, and compliance risks directly on your dashboard.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-zinc-900" /> Transparent Flat-Fee Pricing
                            </h3>
                            <p className="text-sm text-zinc-600">
                                Enjoy full, unlimited diagnostic scanning for a straightforward subscription of $49 per company file per month.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Security & Data Privacy */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900">Enterprise-Grade Security</h2>
                    <div className="bg-white p-6 rounded-lg border border-zinc-200 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="font-semibold text-zinc-900">Your Data Privacy is Protected</h3>
                            <p className="text-sm text-zinc-600">
                                We adhere to strict data security standards. Audit Gen never stores your raw bank credentials or sensitive financial tokens beyond secure session management, and you can revoke integration access at any point from your account settings.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200 bg-white py-6 px-6 text-center text-xs text-zinc-500">
                <p>&copy; {new Date().getFullYear()} Audit Gen. Designed for QuickBooks Online.</p>
            </footer>
        </div>
    );
}