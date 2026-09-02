// app/how-it-works/page.tsx
import { SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

export const metadata = {
    title: 'How It Works — Audit Gen',
    description: 'Learn how Audit Gen connects securely to QuickBooks Online, scans your books automatically, and helps you resolve issues with direct deep links.',
};

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-zinc-200 shrink-0">
                <Link href="/" className="font-semibold tracking-tight text-zinc-900">
                    Audit Gen
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
                    <Link href="/how-it-works" className="text-zinc-900 border-b-2 border-zinc-900">
                        How it Works
                    </Link>
                    <Link href="/issues" className="hover:text-zinc-900 transition-colors">
                        Support
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors">
                            Get Started
                        </button>
                    </SignUpButton>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">

                {/* Hero Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
                        How Audit Gen Works
                    </h1>
                    <p className="mt-4 text-zinc-600">
                        Three simple steps to automated bookkeeping diagnostics.
                    </p>
                </div>

                {/* Video Placeholder */}
                <div className="mb-16">
                    <div className="aspect-video w-full bg-zinc-200 rounded-lg overflow-hidden">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/k80TgYyreJ8?si=9jubHhjNNMaA1GSQ"
                            title="Audit Gen Demo"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </div>

                {/* Step-by-Step */}
                <div className="space-y-16">
                    {/* Step 1 */}
                    <section className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Step 1: Connect</h2>
                            <p className="text-zinc-600 leading-relaxed">
                                Authorize Intuit access in under 60 seconds. Audit Gen uses strict read-only permissions, guaranteeing your clients' production ledgers cannot be accidentally modified or corrupted.
                            </p>
                        </div>
                        {/* Image placeholder */}
                        <div className="bg-zinc-200 rounded-lg aspect-video flex items-center justify-center">
                            <img
                                src="/link.png"
                                alt="Connect QuickBooks securely"
                                className="object-cover w-full h-full rounded-lg"
                            />
                        </div>
                    </section>

                    {/* Step 2 */}
                    <section className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="md:order-2">
                            <h2 className="text-xl font-semibold mb-2">Step 2: Scan</h2>
                            <p className="text-zinc-600 leading-relaxed">
                                Automated background workers scan general ledgers, vendor records, and charts of accounts across 30+ forensic rules to calculate an instant Health Score.
                            </p>
                        </div>
                        {/* Image placeholder */}
                        <div className="bg-zinc-200 rounded-lg aspect-video flex items-center justify-center md:order-1">
                            <img
                                src="/beta.png"
                                alt="Automated scanning dashboard"
                                className="object-cover w-full h-full rounded-lg"
                            />
                        </div>
                    </section>

                    {/* Step 3 */}
                    <section className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Step 3: Resolve</h2>
                            <p className="text-zinc-600 leading-relaxed">
                                Click direct deep links from flagged incident reports straight to the exact transaction inside QuickBooks Online to inspect and fix errors instantly.
                            </p>
                        </div>
                        {/* Image placeholder */}
                        <div className="bg-zinc-200 rounded-lg aspect-video flex items-center justify-center">
                            <img
                                src="/deeplinks.png"
                                alt="Resolve issues with direct links"
                                className="object-cover w-full h-full rounded-lg"
                            />
                        </div>
                    </section>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="bg-zinc-900 text-white px-6 py-3 rounded-md font-medium hover:bg-zinc-800 transition-colors">
                            Get Started for Free
                        </button>
                    </SignUpButton>
                </div>

            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200 bg-white py-6 px-6 text-center text-xs text-zinc-500">
                <p>&copy; {new Date().getFullYear()} Audit Gen. Designed for QuickBooks Online.</p>
            </footer>
        </div>
    );
}