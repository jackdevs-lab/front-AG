// app/support/page.tsx
import { LifeBuoy, Mail, Phone, Clock, ShieldCheck, RefreshCw, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Support & Help Center — Audit Gen',
    description: 'Get help with Audit Gen, troubleshooting, FAQs, and QuickBooks integration support.',
};

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
            {/* Header / Nav */}
            <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-zinc-200 shrink-0">
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-semibold tracking-tight text-zinc-900">
                        Audit Gen
                    </span>
                </Link>
                <Link
                    href="/"
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                    Back to Home
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-12">

                {/* Hero Section */}
                <div className="flex flex-col gap-3 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 self-start bg-zinc-100 text-zinc-800 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                        <LifeBuoy className="h-3.5 w-3.5" />
                        <span>Customer Help Center</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
                        We are here to help you keep your books audit-ready
                    </h1>
                    <p className="text-base text-zinc-600 max-w-2xl">
                        Have questions about your QuickBooks integration, subscription, or diagnostic reports? Our support team is backed by accounting software specialists ready to assist.
                    </p>
                </div>

                {/* Support Channels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Email Support */}
                    <div className="bg-white p-6 rounded-lg border border-zinc-200 flex flex-col gap-4 shadow-xs">
                        <div className="h-10 w-10 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-900">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="font-semibold text-zinc-900">Email Support</h2>
                            <p className="text-sm text-zinc-600">Get written assistance from our technical team.</p>
                        </div>
                        <a
                            href="mailto:auditgenhours@gmail.com"
                            className="text-sm font-medium text-zinc-900 hover:underline mt-auto flex items-center gap-1"
                        >
                            auditgenhours@gmail.com<ArrowRight className="h-3.5 w-3.5" />
                        </a>
                    </div>

                    {/* Support Hours */}
                    <div className="bg-white p-6 rounded-lg border border-zinc-200 flex flex-col gap-4 shadow-xs">
                        <div className="h-10 w-10 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-900">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="font-semibold text-zinc-900">Hours of Operation</h2>
                            <p className="text-sm text-zinc-600">Monday – Friday</p>
                            <p className="text-xs text-zinc-500">9:00 AM – 6:00 PM (EST)</p>
                        </div>
                        <span className="text-xs text-zinc-500 mt-auto">
                            Expected response time: Within 24 hours
                        </span>
                    </div>

                    {/* Phone Support */}
                    <div className="bg-white p-6 rounded-lg border border-zinc-200 flex flex-col gap-4 shadow-xs">
                        <div className="h-10 w-10 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-900">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="font-semibold text-zinc-900">Text the Developer</h2>
                            <p className="text-sm text-zinc-600">Whatsapp line for urgent support requests. </p>
                        </div>
                        <a
                            href="tel:+254797661210"
                            className="text-sm font-medium text-zinc-900 hover:underline mt-auto flex items-center gap-1"
                        >
                            +254 797 661 210 <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>

                {/* Frequently Asked Questions */}
                <section className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold tracking-tight text-zinc-900">Frequently Asked Questions</h2>
                        <p className="text-sm text-zinc-600">Quick answers to common questions regarding data security and integration.</p>
                    </div>

                    <div className="space-y-4">
                        {/* FAQ 1 */}
                        <div className="bg-white p-6 rounded-lg border border-zinc-200 flex flex-col gap-2">
                            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-zinc-900 shrink-0" />
                                How does Audit Gen store and secure accounting data?
                            </h3>
                            <p className="text-sm text-zinc-600 pl-6">
                                Audit Gen uses secure, encrypted OAuth 2.0 protocols to connect to your QuickBooks Online account on a read-only basis. We evaluate your ledger via deterministic rules to surface discrepancies without altering your raw accounting database.
                            </p>
                        </div>

                        {/* FAQ 2 */}
                        <div className="bg-white p-6 rounded-lg border border-zinc-200 flex flex-col gap-2">
                            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-zinc-900 shrink-0" />
                                What specific QuickBooks data is synced with the application?
                            </h3>
                            <p className="text-sm text-zinc-600 pl-6">
                                The platform securely syncs transaction records, chart of accounts metadata, and ledger entries necessary to run automated diagnostic health checks and rule-based error detection.
                            </p>
                        </div>

                        {/* FAQ 3 */}
                        <div className="bg-white p-6 rounded-lg border border-zinc-200 flex flex-col gap-2">
                            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 text-zinc-900 shrink-0" />
                                How do I disconnect or manage my QuickBooks connection?
                            </h3>
                            <p className="text-sm text-zinc-600 pl-6">
                                You maintain complete control over your data connection at all times. You can trigger an instant revocation of access by navigating to your account settings within Audit Gen and clicking the in-app disconnect button, which immediately revokes tokens via the QuickBooks Revoke Access API.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200 bg-white py-6 px-6 text-center text-xs text-zinc-500">
                <p>&copy; {new Date().getFullYear()} Audit Gen. All rights reserved. Built for QuickBooks Online.</p>
            </footer>
        </div>
    );
}