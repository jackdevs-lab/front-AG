"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    ChevronRight,
    FileText,
    Play,
    ShieldCheck,
    AlertTriangle,
    Building2,
    Search,
    LockKeyhole,
    ExternalLink,
} from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const checks = [
    { group: "Banking", items: ["Unreconciled activity", "Unprocessed transactions", "Balance discrepancies"] },
    { group: "Accounts Receivable", items: ["Duplicate invoices", "Old unpaid invoices", "Payment anomalies"] },
    { group: "Accounts Payable", items: ["Duplicate bills", "Old unpaid bills", "Supplier anomalies"] },
    { group: "Tax", items: ["Missing tax treatment", "Unexpected tax codes", "Tax inconsistencies"] },
    { group: "Classification", items: ["Unexpected accounts", "Misallocated transactions", "Unusual coding"] },
    { group: "Bookkeeping Hygiene", items: ["Duplicate contacts", "Inactive accounts", "Missing information"] },
];

const clients = [
    { name: "Anne's Flower Store", health: 45, status: "Critical", issues: 77, exposure: "$166,250" },
    { name: "Wilson Consulting", health: 82, status: "Review", issues: 14, exposure: "$12,400" },
    { name: "Northstar Ltd.", health: 94, status: "Healthy", issues: 3, exposure: "$1,200" },
    { name: "Smith & Partners", health: 68, status: "Review", issues: 31, exposure: "$28,900" },
];

function StatusBadge({ status }: { status: string }) {
    const styles =
        status === "Critical"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : status === "Review"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700";

    return <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${styles}`}>{status}</span>;
}

export default function LandingPage() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans text-zinc-950 antialiased">
            {/* Navigation */}
            <header className="sticky top-0 z-50 border-b border-zinc-200/90 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Image src="/icon.png" alt="Audit Gen logo" width={30} height={30} className="rounded-md" />
                        <span className="text-[17px] font-semibold tracking-[-0.02em]">Audit Gen</span>
                    </Link>

                    <nav className="hidden items-center gap-8 text-[13px] font-medium text-zinc-600 md:flex">
                        <Link className="transition-colors hover:text-zinc-950" href="#product">Product</Link>
                        <Link className="transition-colors hover:text-zinc-950" href="/learn">How it works</Link>
                        <Link className="transition-colors hover:text-zinc-950" href="#checks">Checks</Link>
                        <Link className="transition-colors hover:text-zinc-950" href="/pricing">Pricing</Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link href="/sign-in" className="hidden text-[13px] font-medium text-zinc-600 hover:text-zinc-950 sm:block">Sign in</Link>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <Button size="sm" className="h-9 rounded-md bg-zinc-950 px-4 text-[13px] font-medium text-white shadow-none hover:bg-zinc-800">
                                Get started
                            </Button>
                        </SignUpButton>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section id="product" className="border-b border-zinc-200 bg-zinc-50/70">
                    <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-6 md:pb-24 md:pt-24 lg:px-8">
                        <div className="grid items-center gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-16">
                            <div className="max-w-xl">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600 shadow-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    QuickBooks Online · Read-only
                                </div>

                                <h1 className="text-[42px] font-semibold leading-[1.04] tracking-[-0.045em] text-zinc-950 sm:text-5xl lg:text-[58px]">
                                    Automated bookkeeping intelligence for QuickBooks Online.
                                </h1>
                                <p className="mt-6 max-w-lg text-[17px] leading-8 text-zinc-600">
                                    Audit Gen analyzes your clients&apos; books, identifies transactions that require review, and takes your team directly to the source record in QuickBooks.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                        <Button size="lg" className="h-12 rounded-md bg-zinc-950 px-6 text-sm font-medium text-white shadow-none hover:bg-zinc-800">
                                            Run a free health check <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </SignUpButton>
                                    <Button onClick={() => setIsVideoOpen(true)} variant="outline" size="lg" className="h-12 rounded-md border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-900 shadow-none hover:bg-zinc-50">
                                        <Play className="mr-2 h-4 w-4" /> See how it works
                                    </Button>
                                </div>

                                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-zinc-200 pt-5 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                                    <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-zinc-700" /> Read-only access</span>
                                    <span className="inline-flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5 text-zinc-700" /> No write access</span>
                                    <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-zinc-700" /> Intuit OAuth</span>
                                </div>
                            </div>

                            {/* Portfolio dashboard */}
                            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_24px_70px_-35px_rgba(0,0,0,0.28)]">
                                <div className="flex h-12 items-center justify-between border-b border-zinc-200 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-zinc-300" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Portfolio health</span>
                                    </div>
                                    <span className="text-[11px] font-medium text-zinc-400">47 clients</span>
                                </div>

                                <div className="border-b border-zinc-200 bg-zinc-950 px-5 py-5 text-white sm:px-6">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Firm overview</p>
                                            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em]">Client bookkeeping status</p>
                                        </div>
                                        <div className="hidden text-right sm:block">
                                            <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Last scan</p>
                                            <p className="mt-1 text-xs font-medium text-zinc-300">Today, 09:42</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 grid grid-cols-3 gap-3">
                                        <div className="border-l border-zinc-700 pl-3"><p className="text-xl font-semibold">29</p><p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-zinc-500">Healthy</p></div>
                                        <div className="border-l border-zinc-700 pl-3"><p className="text-xl font-semibold">12</p><p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-zinc-500">Review</p></div>
                                        <div className="border-l border-zinc-700 pl-3"><p className="text-xl font-semibold">6</p><p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-zinc-500">Critical</p></div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[560px] text-left">
                                        <thead className="border-b border-zinc-200 bg-zinc-50">
                                            <tr className="text-[9px] font-semibold uppercase tracking-[0.13em] text-zinc-400">
                                                <th className="px-5 py-3 font-semibold">Client</th>
                                                <th className="px-3 py-3 font-semibold">Health</th>
                                                <th className="px-3 py-3 font-semibold">Issues</th>
                                                <th className="px-5 py-3 text-right font-semibold">Exposure</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clients.map((client) => (
                                                <tr key={client.name} className="border-b border-zinc-100 last:border-0">
                                                    <td className="px-5 py-4 text-xs font-semibold text-zinc-800">{client.name}</td>
                                                    <td className="px-3 py-4"><span className="font-semibold text-zinc-800">{client.health}</span><span className="ml-1 text-[10px] text-zinc-400">/100</span></td>
                                                    <td className="px-3 py-4"><StatusBadge status={client.status} /><span className="ml-2 text-xs text-zinc-500">{client.issues}</span></td>
                                                    <td className="px-5 py-4 text-right text-xs font-semibold text-zinc-800">{client.exposure}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3.5">
                                    <span className="text-[10px] font-medium text-zinc-400">47 connected companies</span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-700">Open portfolio <ChevronRight className="h-3 w-3" /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow */}
                <section id="how-it-works" className="border-b border-zinc-200 bg-white">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
                        <div className="max-w-2xl">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">The workflow</p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">From connected books to actionable findings.</h2>
                            <p className="mt-4 text-base leading-7 text-zinc-600">A focused review process for firms that need to know which client books require attention.</p>
                        </div>

                        <div className="mt-14 grid divide-y divide-zinc-200 border-y border-zinc-200 md:grid-cols-4 md:divide-x md:divide-y-0">
                            {[
                                ["01", "Connect", "Connect a QuickBooks Online company using a read-only Intuit authorization."],
                                ["02", "Analyze", "Run a comprehensive set of bookkeeping integrity checks across the ledger."],
                                ["03", "Prioritize", "Review health scores, severity, affected transactions and potential exposure."],
                                ["04", "Resolve", "Open the source record in QuickBooks and take the appropriate action."],
                            ].map(([number, title, text]) => (
                                <div key={number} className="px-0 py-8 md:px-7 md:py-9 first:md:pl-0 last:md:pr-0">
                                    <span className="text-[10px] font-semibold tracking-[0.16em] text-zinc-400">{number}</span>
                                    <h3 className="mt-4 text-base font-semibold text-zinc-950">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Checks */}
                <section id="checks" className="border-b border-zinc-200 bg-zinc-50/60">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
                        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                            <div className="max-w-2xl">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Diagnostic engine</p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">One health check. 30+ bookkeeping tests.</h2>
                                <p className="mt-4 text-base leading-7 text-zinc-600">Audit Gen evaluates common sources of bookkeeping risk and surfaces the transactions that deserve professional review.</p>
                            </div>
                            <div className="shrink-0 rounded-md border border-zinc-200 bg-white px-4 py-3 text-right">
                                <p className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">30+</p>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Automated checks</p>
                            </div>
                        </div>

                        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
                            {checks.map((section) => (
                                <div key={section.group} className="bg-white p-6 sm:p-7">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-zinc-950">{section.group}</h3>
                                        <Search className="h-4 w-4 text-zinc-300" />
                                    </div>
                                    <ul className="mt-5 space-y-3">
                                        {section.items.map((item) => (
                                            <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-600">
                                                <span className="h-1 w-1 rounded-full bg-zinc-400" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <p className="mt-5 text-xs text-zinc-500">The diagnostic library is designed to expand as new bookkeeping integrity checks are introduced.</p>
                    </div>
                </section>

                {/* Evidence */}
                <section className="border-b border-zinc-200 bg-white">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
                        <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
                            <div className="max-w-xl">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Evidence, not guesswork</p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Every finding comes with a reason.</h2>
                                <p className="mt-5 text-base leading-7 text-zinc-600">When Audit Gen flags an issue, your team can inspect the evidence, understand why it was detected, and move directly to the relevant QuickBooks record.</p>
                                <div className="mt-8 space-y-4 border-t border-zinc-200 pt-6">
                                    <div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" /><span className="text-sm text-zinc-600">Read-only QuickBooks Online integration</span></div>
                                    <div className="flex gap-3"><ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" /><span className="text-sm text-zinc-600">Direct links to source records</span></div>
                                    <div className="flex gap-3"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" /><span className="text-sm text-zinc-600">No writing or modifying capabilities</span></div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_20px_60px_-35px_rgba(0,0,0,0.3)]">
                                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                                    <div className="flex items-center gap-3"><AlertTriangle className="h-4 w-4 text-amber-600" /><span className="text-sm font-semibold">Payment date before invoice</span></div>
                                    <StatusBadge status="Review" />
                                </div>
                                <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-7">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Finding</p>
                                        <p className="mt-2 text-sm leading-6 text-zinc-700">Payment of <strong>$700.00</strong> on <strong>31 May 2026</strong> is linked to Invoice 2737 dated <strong>13 June 2026</strong>.</p>
                                        <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Transaction</p>
                                            <p className="mt-1 font-mono text-xs font-medium text-zinc-700">PAYMENT 2736</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between gap-6 sm:items-end">
                                        <div className="text-left sm:text-right"><p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Amount</p><p className="mt-1 text-2xl font-semibold tracking-[-0.03em]">$700.00</p></div>
                                        <Button className="h-10 rounded-md bg-zinc-950 px-4 text-xs font-medium text-white shadow-none hover:bg-zinc-800"><BarChart3 className="mr-2 h-3.5 w-3.5" /> Open in QuickBooks <ArrowRight className="ml-2 h-3.5 w-3.5" /></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Firm features */}
                <section className="border-b border-zinc-200 bg-zinc-950 text-white">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
                        <div className="max-w-2xl">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">For accounting & bookkeeping firms</p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">One control layer across your client portfolio.</h2>
                        </div>
                        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800 md:grid-cols-3">
                            {[
                                [Building2, "Monitor", "Switch between client companies and see which books require attention from a centralized workspace."],
                                [Search, "Detect", "Run 30+ automated checks across your QuickBooks Online files instead of manually hunting for anomalies."],
                                [FileText, "Report", "Create a professional record of findings for internal review, onboarding diagnostics and client conversations."],
                            ].map(([Icon, title, text]) => (
                                <div key={String(title)} className="bg-zinc-950 p-7 sm:p-8">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900"><Icon className="h-4 w-4 text-zinc-300" /></div>
                                    <h3 className="mt-6 text-base font-semibold">{String(title)}</h3>
                                    <p className="mt-3 text-sm leading-6 text-zinc-400">{String(text)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="border-b border-zinc-200 bg-zinc-50">
                    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white"><ShieldCheck className="h-5 w-5 text-zinc-700" /></div>
                                <div><h3 className="text-sm font-semibold">Designed around read-only access.</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">Audit Gen analyzes your QuickBooks data without writing changes to the ledger. Findings link back to QuickBooks so your team remains in control of every correction.</p></div>
                            </div>
                            <Link href="/learn" className="inline-flex shrink-0 items-center text-sm font-semibold text-zinc-900">Security & access <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-white">
                    <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">See what your books reveal</p>
                        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Run your first QuickBooks health check.</h2>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600">Connect a company and see which bookkeeping issues Audit Gen identifies. Start with one client and expand when you&apos;re ready.</p>
                        <div className="mt-8"><SignUpButton mode="modal" forceRedirectUrl="/dashboard"><Button size="lg" className="h-12 rounded-md bg-zinc-950 px-7 text-sm font-medium text-white shadow-none hover:bg-zinc-800">Get started for free <ArrowRight className="ml-2 h-4 w-4" /></Button></SignUpButton></div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-zinc-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div className="flex items-center gap-2"><Image src="/icon.png" alt="Audit Gen logo" width={24} height={24} className="rounded" /><span className="text-sm font-semibold">Audit Gen Inc.</span></div>
                    <p className="text-xs text-zinc-400">© 2026 Audit Gen. All rights reserved. QuickBooks is a trademark of Intuit Inc.</p>
                    <nav className="flex gap-5 text-xs font-medium text-zinc-500"><Link href="/tos" className="hover:text-zinc-950">Terms</Link><Link href="/privacy" className="hover:text-zinc-950">Privacy</Link></nav>
                </div>
            </footer>

            {isVideoOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm" onClick={() => setIsVideoOpen(false)}>
                    <div className="relative w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsVideoOpen(false)} aria-label="Close video" className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950/80 text-white">×</button>
                        <div className="aspect-video w-full bg-black"><iframe className="h-full w-full" src="https://www.youtube.com/embed/k80TgYyreJ8?si=9jubHhjNNMaA1GSQ" title="Audit Gen Demo" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
                        <div className="flex flex-col gap-4 border-t border-zinc-100 p-6 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-base font-semibold">See Audit Gen in action</h3><p className="mt-1 text-sm text-zinc-500">See how quickly a client portfolio can be reviewed.</p></div><SignUpButton mode="modal" forceRedirectUrl="/dashboard"><Button className="rounded-md bg-zinc-950 text-white shadow-none hover:bg-zinc-800">Start free trial</Button></SignUpButton></div>
                    </div>
                </div>
            )}
        </div>
    );
}