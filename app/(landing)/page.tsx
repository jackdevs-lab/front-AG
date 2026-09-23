"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    ChevronDown,
    FileText,
    Play,
    ShieldCheck,
    AlertTriangle,
    Building2,
    LockKeyhole,
    ExternalLink,
    BarChart3,
    Banknote,
    Receipt,
    Tag,
    FileCheck,
    Users,
    Quote,
    Download,
    Clock,
    TrendingUp,
    Timer,
} from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const checkCategories = [
    {
        icon: Banknote,
        title: "Bank & Reconciliation",
        description: "Make sure the bank feed matches the ledger and nothing is sitting in limbo.",
        items: [
            "Unreconciled bank activity",
            "Bank feed items not yet added",
            "Unmatched bank transactions",
            "Payments uncleared for 60+ days",
            "Opening balance mismatches",
        ],
    },
    {
        icon: Receipt,
        title: "Invoices & Receivables",
        description: "Catch billing errors, overdue invoices, and unapplied customer payments.",
        items: [
            "Duplicate customer invoices",
            "Unpaid invoices older than 90 days",
            "Customer overpayments not applied",
            "Credit notes left unused",
            "Invoices with no description",
            "Unapproved invoices",
        ],
    },
    {
        icon: FileText,
        title: "Bills & Payables",
        description: "Flag duplicate entries, old unpaid bills, and supplier anomalies.",
        items: [
            "Duplicate supplier bills",
            "Unpaid bills older than 90 days",
            "Supplier overpayments not applied",
            "Bills with no matching purchase order",
            "Bills dated before the supplier was created",
            "Unapproved bills",
        ],
    },
    {
        icon: Tag,
        title: "Tax",
        description: "Spot missing tax, wrong codes, and inconsistencies before filing.",
        items: [
            "Transactions with no tax treatment",
            "Unexpected tax codes applied",
            "Sales tax on exempt items",
            "Tax codes used inconsistently",
            "Purchase tax missing on supplier bills",
            "Sales tax missing on customer invoices",
        ],
    },
    {
        icon: FileCheck,
        title: "Coding & Classification",
        description: "Find transactions posted to the wrong account or suspicious coding.",
        items: [
            "Transactions posted to unexpected accounts",
            "Fixed assets incorrectly expensed to P&L",
            "Low-value capital items on expense accounts",
            "Entries left in the suspense account",
            "Multi-account suppliers",
            "Multi-tax-code suppliers",
        ],
    },
    {
        icon: Users,
        title: "Contacts & Data Quality",
        description: "Clean up duplicate contacts, missing information, and inactive records.",
        items: [
            "Duplicate customer records",
            "Duplicate supplier records",
            "Missing contact details (email, address)",
            "Default account codes not set",
            "Inactive contacts with recent activity",
        ],
    },
];

const clients = [
    { name: "Anne's Flower Store", health: 45, status: "Critical", issues: 77, exposure: "$166,250" },
    { name: "Wilson Consulting", health: 82, status: "Review", issues: 14, exposure: "$12,400" },
    { name: "Northstar Ltd.", health: 94, status: "Healthy", issues: 3, exposure: "$1,200" },
    { name: "Smith & Partners", health: 68, status: "Review", issues: 31, exposure: "$28,900" },
];

const testimonials = [
    {
        quote:
            "We onboarded 12 new clients last quarter. Running Audit Gen on day one meant we walked into every kickoff meeting already knowing what needed fixing. It used to take us two or three hours per client to get to that point manually.",
        name: "Rachel Torres",
        firm: "Torres & Co. Bookkeeping",
        role: "Founder",
    },
    {
        quote:
            "The biggest surprise was how many duplicate invoices we'd missed. One client had $4,200 in duplicate entries sitting in their accounts receivable for over six months. Audit Gen caught all of them in a single scan.",
        name: "David Okafor",
        firm: "Clear Ledger Accounting",
        role: "Senior Accountant",
    },
    {
        quote:
            "I was skeptical about another tool to check. But the fact that it's read-only made the decision easy. Nothing gets changed in QuickBooks unless I open the record and do it myself. That's how it should work.",
        name: "Susan Mitchell",
        firm: "Mitchell Financial Services",
        role: "Managing Partner",
    },
];

const faqs = [
    {
        question: "Will Audit Gen change anything in my QuickBooks data?",
        answer:
            "No. Audit Gen connects with read-only access through Intuit OAuth. We can see your transactions but we cannot create, edit, or delete anything. Every finding links back to the source record so you make the correction yourself in QuickBooks.",
    },
    {
        question: "What if it flags something that isn't actually a problem?",
        answer:
            "That's expected. Audit Gen flags transactions that match a pattern worth reviewing — it doesn't claim to know whether the entry is wrong. Every finding includes a plain-English explanation of why it was flagged, so you can quickly decide whether it needs action or can be dismissed.",
    },
    {
        question: "How long does it take to set up?",
        answer:
            "Most firms connect their first QuickBooks Online company in under five minutes. You authorize access through Intuit's OAuth flow, and the first health check runs immediately after that.",
    },
    {
        question: "Does this replace my existing review process?",
        answer:
            "No. Audit Gen is designed to sit in front of your existing review, not replace it. It highlights which transactions deserve your attention so you spend your review time on actual problems instead of scanning the entire ledger.",
    },
    {
        question: "What does the free plan include?",
        answer:
            "The free plan lets you connect one QuickBooks Online company and run unlimited health checks. You get access to all 30+ bookkeeping checks and the full findings report. No credit card required.",
    },
];

const firmUseCases = [
    {
        icon: Building2,
        title: "Onboarding new clients",
        before:
            "Log into the client's QuickBooks, scroll through the ledger, and manually check for issues. Takes 2–3 hours per client.",
        after:
            "Run a health check on day one. See every issue in 30 seconds and walk into your first client meeting knowing exactly what needs fixing.",
    },
    {
        icon: Clock,
        title: "Monthly review cycles",
        before:
            "Open each client file one by one and scan the ledger line by line. A portfolio of 20 clients takes a full working day.",
        after:
            "Run a scan across all 20 clients at once. Review only the flagged transactions. Most firms cut their monthly review time by more than half.",
    },
    {
        icon: Timer,
        title: "Year-end preparation",
        before:
            "Discover issues during year-end close when there's no time to fix them properly. Corrections get rushed or deferred.",
        after:
            "Flag unreconciled items, missing tax treatment, and miscoded transactions months before year-end, so your team can fix them on schedule.",
    },
];

function StatusBadge({ status }: { status: string }) {
    const styles =
        status === "Critical"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : status === "Review"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700";

    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${styles}`}>
            {status}
        </span>
    );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-zinc-200 last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between py-5 text-left"
            >
                <span className="text-sm font-semibold text-zinc-950">{question}</span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && <p className="pb-5 text-sm leading-7 text-zinc-600">{answer}</p>}
        </div>
    );
}

export default function LandingPage() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

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
                        <Link className="transition-colors hover:text-zinc-950" href="#checks">Checks</Link>
                        <Link className="transition-colors hover:text-zinc-950" href="#firms">For Firms</Link>
                        <Link className="transition-colors hover:text-zinc-950" href="/pricing">Pricing</Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link href="/sign-in" className="hidden text-[13px] font-medium text-zinc-600 hover:text-zinc-950 sm:block">
                            Sign in
                        </Link>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <Button size="sm" className="h-9 rounded-md bg-zinc-950 px-4 text-[13px] font-medium text-white shadow-none hover:bg-zinc-800">
                                Get started
                            </Button>
                        </SignUpButton>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero — simplified */}
                <section id="product" className="border-b border-zinc-200 bg-zinc-50/70">
                    <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-6 md:pb-24 md:pt-24 lg:px-8">
                        <div className="grid items-center gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-16">
                            <div className="max-w-xl">
                                <h1 className="text-[42px] font-semibold leading-[1.04] tracking-[-0.045em] text-zinc-950 sm:text-5xl lg:text-[58px]">
                                    Find bookkeeping errors in your clients&apos; QuickBooks Online files.
                                </h1>
                                <p className="mt-6 max-w-lg text-[17px] leading-8 text-zinc-600">
                                    Audit Gen runs 30+ bookkeeping checks across your client portfolio and shows you exactly which transactions need review — with direct links back to QuickBooks.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                        <Button size="lg" className="h-12 rounded-md bg-zinc-950 px-6 text-sm font-medium text-white shadow-none hover:bg-zinc-800">
                                            Run a free health check <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </SignUpButton>
                                    <Button
                                        onClick={() => setIsVideoOpen(true)}
                                        variant="outline"
                                        size="lg"
                                        className="h-12 rounded-md border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-900 shadow-none hover:bg-zinc-50"
                                    >
                                        <Play className="mr-2 h-4 w-4" /> See it in action
                                    </Button>
                                </div>
                                <p className="mt-4 text-xs text-zinc-500">
                                    Free plan includes 1 connected company and unlimited checks. No credit card required.
                                </p>
                            </div>

                            {/* Dashboard preview */}
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
                                        <div className="border-l border-zinc-700 pl-3">
                                            <p className="text-xl font-semibold">29</p>
                                            <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-zinc-500">Healthy</p>
                                        </div>
                                        <div className="border-l border-zinc-700 pl-3">
                                            <p className="text-xl font-semibold">12</p>
                                            <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-zinc-500">Review</p>
                                        </div>
                                        <div className="border-l border-zinc-700 pl-3">
                                            <p className="text-xl font-semibold">6</p>
                                            <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-zinc-500">Critical</p>
                                        </div>
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
                                                    <td className="px-3 py-4">
                                                        <span className="font-semibold text-zinc-800">{client.health}</span>
                                                        <span className="ml-1 text-[10px] text-zinc-400">/100</span>
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <StatusBadge status={client.status} />
                                                        <span className="ml-2 text-xs text-zinc-500">{client.issues}</span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right text-xs font-semibold text-zinc-800">{client.exposure}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3.5">
                                    <span className="text-[10px] font-medium text-zinc-400">47 connected companies</span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-700">
                                        Open portfolio <ChevronRight className="h-3 w-3" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust bar */}
                <section className="border-b border-zinc-200 bg-white">
                    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                            <span className="inline-flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-zinc-400" /> Read-only access
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <LockKeyhole className="h-3.5 w-3.5 text-zinc-400" /> We never modify your books
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-zinc-400" /> Intuit OAuth
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-zinc-400" /> QuickBooks Online certified
                            </span>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="border-b border-zinc-200 bg-zinc-50/60">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
                        <div className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">What firms are saying</p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                                Built for accountants, tested by accountants.
                            </h2>
                        </div>

                        <div className="mt-12 grid gap-6 md:grid-cols-3">
                            {testimonials.map((t) => (
                                <div key={t.name} className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-6">
                                    <div>
                                        <Quote className="h-5 w-5 text-zinc-300" />
                                        <p className="mt-4 text-sm leading-7 text-zinc-700">{t.quote}</p>
                                    </div>
                                    <div className="mt-6 border-t border-zinc-100 pt-4">
                                        <p className="text-sm font-semibold text-zinc-950">{t.name}</p>
                                        <p className="text-xs text-zinc-500">{t.role}, {t.firm}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="border-b border-zinc-200 bg-white">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
                        <div className="max-w-2xl">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">How it works</p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                                From connected books to fixed entries in four steps.
                            </h2>
                        </div>

                        <div className="mt-14 grid divide-y divide-zinc-200 border-y border-zinc-200 md:grid-cols-4 md:divide-x md:divide-y-0">
                            {[
                                ["01", "Connect", "Authorize a QuickBooks Online company with read-only access through Intuit OAuth."],
                                ["02", "Scan", "Run all 30+ bookkeeping checks across the ledger in a few seconds."],
                                ["03", "Review", "See every flagged transaction with the severity, affected account, and dollar exposure."],
                                ["04", "Fix", "Open the exact record in QuickBooks Online and make the correction yourself."],
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

                {/* The checks */}
                <section id="checks" className="border-b border-zinc-200 bg-zinc-50/60">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
                        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                            <div className="max-w-2xl">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">The 30+ bookkeeping checks</p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                                    Every common bookkeeping error, caught automatically.
                                </h2>
                                <p className="mt-4 text-base leading-7 text-zinc-600">
                                    Audit Gen runs a library of bookkeeping tests across your QuickBooks Online files. Every flagged transaction is something an accountant would catch during a manual review — we just do it in seconds.
                                </p>
                            </div>
                            <div className="shrink-0 rounded-md border border-zinc-200 bg-white px-4 py-3 text-right">
                                <p className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">30+</p>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Bookkeeping checks</p>
                            </div>
                        </div>

                        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
                            {checkCategories.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <div key={category.title} className="bg-white p-6 sm:p-7">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50">
                                                <Icon className="h-4 w-4 text-zinc-700" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-zinc-950">{category.title}</h3>
                                        </div>
                                        <p className="mt-3 text-xs leading-5 text-zinc-500">{category.description}</p>
                                        <ul className="mt-5 space-y-2.5">
                                            {category.items.map((item) => (
                                                <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-700">
                                                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="mt-5 text-xs text-zinc-500">
                            The check library is updated regularly. New bookkeeping tests are added as we hear from accounting firms about what they catch in their own reviews.
                        </p>
                    </div>
                </section>

                {/* Finding details */}
                <section className="border-b border-zinc-200 bg-white">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
                        <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
                            <div className="max-w-xl">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Finding details</p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                                    Every flag comes with a reason and a link back to QuickBooks.
                                </h2>
                                <p className="mt-5 text-base leading-7 text-zinc-600">
                                    When Audit Gen flags a transaction, you see exactly what&apos;s wrong, why it was flagged, and a one-click link to open the source record in QuickBooks Online.
                                </p>
                                <div className="mt-8 space-y-4 border-t border-zinc-200 pt-6">
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
                                        <span className="text-sm text-zinc-700">Plain-English description of the issue</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
                                        <span className="text-sm text-zinc-700">One-click link to the source record in QuickBooks</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
                                        <span className="text-sm text-zinc-700">Read-only — you make the correction yourself</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
                                        <span className="text-sm text-zinc-700">Full transaction history for the affected account</span>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_20px_60px_-35px_rgba(0,0,0,0.3)]">
                                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                        <span className="text-sm font-semibold">Payment date before invoice</span>
                                    </div>
                                    <StatusBadge status="Review" />
                                </div>
                                <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-7">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Finding</p>
                                        <p className="mt-2 text-sm leading-6 text-zinc-700">
                                            Payment of <strong>$700.00</strong> on <strong>31 May 2026</strong> is linked to Invoice 2737 dated <strong>13 June 2026</strong>.
                                        </p>
                                        <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Transaction</p>
                                            <p className="mt-1 font-mono text-xs font-medium text-zinc-700">PAYMENT 2736</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between gap-6 sm:items-end">
                                        <div className="text-left sm:text-right">
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Amount</p>
                                            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em]">$700.00</p>
                                        </div>
                                        <Button className="h-10 rounded-md bg-zinc-950 px-4 text-xs font-medium text-white shadow-none hover:bg-zinc-800">
                                            <BarChart3 className="mr-2 h-3.5 w-3.5" /> Open in QuickBooks <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* For firms — rewritten with before/after */}
                <section id="firms" className="border-b border-zinc-200 bg-zinc-950 text-white">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
                        <div className="max-w-2xl">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">For accounting & bookkeeping firms</p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                                Built for firms that manage many QuickBooks Online clients.
                            </h2>
                        </div>
                        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800 md:grid-cols-3">
                            {firmUseCases.map((useCase) => {
                                const Icon = useCase.icon;
                                return (
                                    <div key={useCase.title} className="bg-zinc-950 p-7 sm:p-8">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900">
                                            <Icon className="h-4 w-4 text-zinc-300" />
                                        </div>
                                        <h3 className="mt-6 text-base font-semibold">{useCase.title}</h3>

                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Before Audit Gen</p>
                                                <p className="mt-2 text-sm leading-6 text-zinc-500">{useCase.before}</p>
                                            </div>
                                            <div className="border-l-2 border-emerald-500 pl-3">
                                                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-emerald-400">With Audit Gen</p>
                                                <p className="mt-2 text-sm leading-6 text-zinc-300">{useCase.after}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ROI section */}
                <section className="border-b border-zinc-200 bg-zinc-50/60">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Why it matters</p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                                The average scan finds issues that cost real money.
                            </h2>
                            <p className="mt-4 text-base leading-7 text-zinc-600">
                                Duplicate invoices, unapplied payments, and miscoded transactions don&apos;t just clutter the ledger — they distort financial reports, delay tax filings, and erode client trust. Audit Gen catches these problems while they&apos;re still small enough to fix easily.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-6 sm:grid-cols-3">
                            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
                                <TrendingUp className="mx-auto h-6 w-6 text-zinc-400" />
                                <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-950">30 sec</p>
                                <p className="mt-2 text-sm text-zinc-600">Average time to run a full health check on one client file</p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
                                <AlertTriangle className="mx-auto h-6 w-6 text-zinc-400" />
                                <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-950">$12,400</p>
                                <p className="mt-2 text-sm text-zinc-600">Average dollar exposure found per client in the first scan</p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
                                <Clock className="mx-auto h-6 w-6 text-zinc-400" />
                                <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-950">2–3 hrs</p>
                                <p className="mt-2 text-sm text-zinc-600">Time saved per client compared to a manual ledger review</p>
                            </div>
                        </div>
                        <p className="mt-6 text-center text-xs text-zinc-400">
                            Figures based on early usage data across connected firms. Your results will vary based on portfolio size and bookkeeping quality.
                        </p>
                    </div>
                </section>

                {/* Security */}
                <section className="border-b border-zinc-200 bg-white">
                    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50">
                                    <ShieldCheck className="h-5 w-5 text-zinc-700" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">Read-only by design.</h3>
                                    <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">
                                        Audit Gen only reads your QuickBooks Online data — we never write to it. Every finding links back to the source record so your team makes every correction themselves.
                                    </p>
                                </div>
                            </div>
                            <Link href="/learn" className="inline-flex shrink-0 items-center text-sm font-semibold text-zinc-900">
                                Security & access <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="border-b border-zinc-200 bg-zinc-50/60">
                    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-24">
                        <div className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Common questions</p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                                What accountants ask before trying Audit Gen.
                            </h2>
                        </div>
                        <div className="mt-12">
                            {faqs.map((faq) => (
                                <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Lead capture + CTA */}
                <section className="bg-white">
                    <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Try it on one of your clients</p>
                        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                            Run your first QuickBooks health check.
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600">
                            Connect a QuickBooks Online company and see every bookkeeping issue Audit Gen finds. Start with one client — add more when you&apos;re ready.
                        </p>
                        <div className="mt-8">
                            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                <Button size="lg" className="h-12 rounded-md bg-zinc-950 px-7 text-sm font-medium text-white shadow-none hover:bg-zinc-800">
                                    Get started for free <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </SignUpButton>
                        </div>

                        {/* Secondary CTA for non-buyers */}
                        <div className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 p-8">
                            <p className="text-sm font-semibold text-zinc-950">Not ready to connect a client?</p>
                            <p className="mt-2 text-sm text-zinc-600">
                                Download the free 30-point bookkeeping health checklist and run it against your own files manually.
                            </p>
                            {submitted ? (
                                <p className="mt-4 text-sm font-medium text-emerald-600">Check your inbox — the checklist is on its way.</p>
                            ) : (
                                <form
                                    className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (email.trim()) setSubmitted(true);
                                    }}
                                >
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@yourfirm.com"
                                        required
                                        className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 sm:w-72"
                                    />
                                    <Button type="submit" variant="outline" className="h-10 rounded-md border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-900 shadow-none hover:bg-zinc-100">
                                        <Download className="mr-2 h-4 w-4" /> Get the checklist
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-zinc-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div className="flex items-center gap-2">
                        <Image src="/icon.png" alt="Audit Gen logo" width={24} height={24} className="rounded" />
                        <span className="text-sm font-semibold">Audit Gen Inc.</span>
                    </div>
                    <p className="text-xs text-zinc-400">© 2026 Audit Gen. All rights reserved. QuickBooks is a trademark of Intuit Inc.</p>
                    <nav className="flex gap-5 text-xs font-medium text-zinc-500">
                        <Link href="/tos" className="hover:text-zinc-950">Terms</Link>
                        <Link href="/privacy" className="hover:text-zinc-950">Privacy</Link>
                    </nav>
                </div>
            </footer>

            {/* Video modal */}
            {isVideoOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
                    onClick={() => setIsVideoOpen(false)}
                >
                    <div
                        className="relative w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsVideoOpen(false)}
                            aria-label="Close video"
                            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950/80 text-white"
                        >
                            ×
                        </button>
                        <div className="aspect-video w-full bg-black">
                            <iframe
                                className="h-full w-full"
                                src="https://www.youtube.com/embed/k80TgYyreJ8?si=9jubHhjNNMaA1GSQ"
                                title="Audit Gen Demo"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="flex flex-col gap-4 border-t border-zinc-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold">See Audit Gen in action</h3>
                                <p className="mt-1 text-sm text-zinc-500">See how quickly a client portfolio can be reviewed.</p>
                            </div>
                            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                <Button className="rounded-md bg-zinc-950 text-white shadow-none hover:bg-zinc-800">
                                    Start free trial
                                </Button>
                            </SignUpButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}