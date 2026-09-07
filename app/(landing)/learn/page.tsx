import { SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

export const metadata = {
    title: 'How Audit Gen Works — Automated QuickBooks Bookkeeping Checks',
    description:
        'See how Audit Gen helps bookkeeping and accounting firms monitor QuickBooks Online clients, detect bookkeeping issues, review financial exposure, and resolve findings faster.',
};

const checks = [
    ['Banking', 'Reconciliation & bank activity', 'Identify unreconciled activity, unusual balances, and transactions that may need review before month-end close.'],
    ['Accounts Receivable', 'Invoices & customer activity', 'Surface old unpaid invoices, duplicate invoices, sales-credit issues, and other receivables that deserve attention.'],
    ['Accounts Payable', 'Bills & supplier activity', 'Find duplicate bills, old unpaid bills, purchase-credit issues, and supplier-related inconsistencies.'],
    ['Tax & Coding', 'Tax codes & account classification', 'Highlight unexpected accounts, missing tax treatment, and transactions that may have been classified incorrectly.'],
    ['Bookkeeping Hygiene', 'Data quality & integrity', 'Catch incomplete, inconsistent, or unusual bookkeeping patterns that can make a client file harder to trust.'],
    ['Review', 'Evidence for follow-up', 'Present each flagged issue with the information your team needs to investigate it in QuickBooks Online.'],
];

const workflow = [
    {
        n: '01', title: 'Connect', heading: 'Connect the QuickBooks company you want to review.',
        text: 'Authorize Audit Gen through Intuit. The integration is read-only, so Audit Gen can inspect bookkeeping data without writing, editing, or deleting records in the client’s books.',
        note: 'For bookkeepers: use Audit Gen as a review layer alongside the bookkeeping work you already perform in QuickBooks.',
        image: '/link.png', alt: 'Connecting Audit Gen to QuickBooks Online',
    },
    {
        n: '02', title: 'Analyze', heading: 'Run automated bookkeeping checks.',
        text: 'Audit Gen analyzes the company’s QuickBooks data against 30+ diagnostic checks across areas such as banking, receivables, payables, tax treatment, classification, and bookkeeping hygiene.',
        note: 'Health Score gives a quick view of overall condition. Issues provide a prioritized list of findings requiring review.',
        image: '/beta.png', alt: 'Audit Gen scanning a QuickBooks Online company',
    },
    {
        n: '03', title: 'Review', heading: 'Understand what was flagged and why.',
        text: 'Findings are presented as reviewable exceptions rather than just a list of warnings. See the issue, severity, affected record, and potential financial exposure before deciding what to investigate.',
        note: 'This gives a bookkeeper a consistent way to triage work across a growing client portfolio.',
        image: null, alt: '',
    },
    {
        n: '04', title: 'Resolve', heading: 'Jump to the source record and fix it in QuickBooks.',
        text: 'Audit Gen does not make the accounting decision for you. It gets your team to the relevant QuickBooks record faster so you can review it in context and make the appropriate correction.',
        note: 'Audit Gen finds the exception. Your team remains in control of the accounting decision.',
        image: '/deeplinks.png', alt: 'Opening a flagged record directly in QuickBooks Online',
    },
];

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-white text-zinc-950">
            <header className="sticky top-0 z-50 h-16 border-b border-zinc-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                        <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-zinc-950 text-xs font-bold text-white">AG</span>
                        Audit Gen
                    </Link>
                    <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-500 md:flex">
                        <Link href="/#product" className="hover:text-zinc-950">Product</Link>
                        <Link href="/how-it-works" className="border-b-2 border-zinc-950 py-5 text-zinc-950">How It Works</Link>
                        <Link href="/#checks" className="hover:text-zinc-950">Checks</Link>
                        <Link href="/#pricing" className="hover:text-zinc-950">Pricing</Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link href="/sign-in" className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-950 sm:block">Sign in</Link>
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                            <button className="border border-zinc-950 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">Get started</button>
                        </SignUpButton>
                    </div>
                </div>
            </header>

            <main>
                <section className="border-b border-zinc-200 bg-zinc-50">
                    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
                        <div className="max-w-4xl">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">QuickBooks bookkeeping quality control</p>
                            <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">A second set of eyes for every QuickBooks client.</h1>
                            <p className="mt-7 max-w-3xl text-lg leading-8 text-zinc-600 md:text-xl">
                                Audit Gen is built for bookkeepers and accounting firms that manage multiple QuickBooks Online files. It automatically checks client books for issues, shows what needs attention, and takes your team back to the source record in QuickBooks.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                    <button className="bg-zinc-950 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800">Run a free health check</button>
                                </SignUpButton>
                                <a href="#workflow" className="border border-zinc-300 bg-white px-6 py-3 text-center text-sm font-medium text-zinc-800 hover:border-zinc-500">See how it works</a>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-zinc-500">
                                <span>Read-only QuickBooks access</span><span>30+ automated checks</span><span>Built for bookkeeping teams</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-b border-zinc-200">
                    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Why Audit Gen</p>
                                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Bookkeeping gets harder as the client list grows.</h2>
                                <p className="mt-5 leading-7 text-zinc-600">A bookkeeper can know exactly how to fix a problem and still miss it when the same review has to be repeated across dozens of companies.</p>
                                <p className="mt-4 leading-7 text-zinc-600">Audit Gen turns recurring quality-control work into a repeatable process: connect the books, run the checks, prioritize findings, investigate the evidence, and resolve the underlying records.</p>
                            </div>
                            <div className="grid gap-px border border-zinc-200 bg-zinc-200 sm:grid-cols-2">
                                {[
                                    ['Monitor', 'See which client files need attention instead of opening every company one by one.'],
                                    ['Detect', 'Run the same diagnostic checks consistently across your QuickBooks portfolio.'],
                                    ['Prioritize', 'Use severity and potential financial exposure to decide what deserves attention first.'],
                                    ['Investigate', 'See the finding, supporting details, and a direct path back to QuickBooks.'],
                                ].map(([title, text], i) => (
                                    <div key={title} className="bg-white p-7">
                                        <div className="text-xs font-semibold text-zinc-400">0{i + 1}</div>
                                        <h3 className="mt-5 font-semibold">{title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="workflow" className="border-b border-zinc-200 bg-zinc-50">
                    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">The workflow</p>
                            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">From client file to actionable finding.</h2>
                            <p className="mt-5 leading-7 text-zinc-600">Audit Gen is designed around the way bookkeeping teams actually work: review the portfolio, find exceptions, investigate them, then make the correction in QuickBooks.</p>
                        </div>

                        <div className="mt-14 space-y-20">
                            {workflow.map((step, i) => (
                                <section key={step.n} className="grid items-center gap-10 lg:grid-cols-2">
                                    <div className={i % 2 ? 'order-1 lg:order-2' : ''}>
                                        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                            <span className="flex h-8 w-8 items-center justify-center bg-zinc-950 text-white">{step.n}</span>
                                            {step.title}
                                        </div>
                                        <h3 className="mt-6 text-2xl font-semibold tracking-tight">{step.heading}</h3>
                                        <p className="mt-4 leading-7 text-zinc-600">{step.text}</p>
                                        <div className="mt-6 border-l-2 border-zinc-300 pl-5 text-sm leading-6 text-zinc-600">{step.note}</div>
                                    </div>

                                    {step.image ? (
                                        <div className={`overflow-hidden border border-zinc-200 bg-white ${i % 2 ? 'order-2 lg:order-1' : ''}`}>
                                            <img src={step.image} alt={step.alt} className="aspect-video w-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="border border-zinc-200 bg-white p-5">
                                            <div className="border border-zinc-200">
                                                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Finding</p>
                                                        <h4 className="mt-1 font-semibold">Payment date before invoice</h4>
                                                    </div>
                                                    <span className="border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Warning</span>
                                                </div>
                                                <div className="grid gap-px bg-zinc-200 sm:grid-cols-3">
                                                    <div className="bg-white p-5"><p className="text-xs text-zinc-400">Potential exposure</p><p className="mt-1 text-lg font-semibold">$700</p></div>
                                                    <div className="bg-white p-5"><p className="text-xs text-zinc-400">Affected record</p><p className="mt-1 text-sm font-medium">Payment #2736</p></div>
                                                    <div className="bg-white p-5"><p className="text-xs text-zinc-400">Action</p><p className="mt-1 text-sm font-medium">Review in QBO</p></div>
                                                </div>
                                                <div className="border-t border-zinc-200 px-5 py-4 text-sm font-semibold">Open in QuickBooks →</div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="checks" className="border-b border-zinc-200">
                    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">What Audit Gen checks</p>
                                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">One review layer. 30+ bookkeeping checks.</h2>
                                <p className="mt-5 leading-7 text-zinc-600">Audit Gen is focused on finding exceptions that can be difficult to spot when a team is reviewing many client files manually.</p>
                                <p className="mt-4 leading-7 text-zinc-600">The diagnostic engine can be expanded over time; the goal is consistency—apply the same quality-control process to every QuickBooks company you review.</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {checks.map(([category, title, text]) => (
                                    <div key={title} className="border border-zinc-200 bg-white p-6">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{category}</p>
                                        <h3 className="mt-3 font-semibold">{title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-b border-zinc-200 bg-zinc-50">
                    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Built for firms</p>
                            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Review a portfolio without treating every client the same.</h2>
                            <p className="mt-5 leading-7 text-zinc-600">A bookkeeping firm may have clients with different transaction volumes, industries, and levels of complexity. Audit Gen gives the team a common diagnostic framework while letting them prioritize the files and findings that need attention.</p>
                        </div>
                        <div className="mt-12 overflow-hidden border border-zinc-200 bg-white">
                            <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr] border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                <span>Client</span><span>Health</span><span>Issues</span><span>Exposure</span>
                            </div>
                            {[
                                ['Anne’s Flower Store', '45 / 100', '77', '$166,250'],
                                ['Northstar Consulting', '82 / 100', '12', '$8,420'],
                                ['Harbor Design Co.', '94 / 100', '3', '$1,180'],
                            ].map(([client, health, issues, exposure]) => (
                                <div key={client} className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr] border-b border-zinc-100 px-5 py-4 text-sm last:border-0">
                                    <span className="font-medium">{client}</span><span className="text-zinc-600">{health}</span><span className="text-zinc-600">{issues}</span><span className="font-medium">{exposure}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-zinc-400">Example portfolio view. Values shown are illustrative.</p>
                    </div>
                </section>

                <section className="border-b border-zinc-200">
                    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                        <div className="grid gap-12 lg:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Security & control</p>
                                <h2 className="mt-4 text-3xl font-semibold tracking-tight">Read the books. Keep control of the books.</h2>
                                <p className="mt-5 leading-7 text-zinc-600">Audit Gen is designed as a review and diagnostic layer. Its purpose is to identify records that deserve attention—not to replace the bookkeeper or silently change accounting data.</p>
                            </div>
                            <div className="divide-y divide-zinc-200 border-y border-zinc-200">
                                {[
                                    ['Read-only Intuit integration', 'Audit Gen is designed to inspect QuickBooks data without modifying the underlying books.'],
                                    ['Direct source-record links', 'Open the relevant QuickBooks record from a finding to reduce the time spent searching manually.'],
                                    ['Human review stays central', 'A flagged transaction is an exception to investigate, not an automatic accounting adjustment.'],
                                ].map(([title, text]) => (
                                    <div key={title} className="py-6"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="bg-zinc-950 text-white">
                    <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8 lg:py-24">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">For bookkeepers & accounting firms</p>
                        <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">Give every QuickBooks file the same quality-control check.</h2>
                        <p className="mx-auto mt-5 max-w-2xl leading-7 text-zinc-300">Connect a company, run the health check, review the findings, and jump back into QuickBooks to resolve what needs attention.</p>
                        <div className="mt-8">
                            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                <button className="bg-white px-7 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200">Run a free health check</button>
                            </SignUpButton>
                        </div>
                        <p className="mt-5 text-xs text-zinc-500">Read-only access · QuickBooks Online · Designed for professional bookkeeping workflows</p>
                    </div>
                </section>
            </main>

            <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-8 text-center text-xs text-zinc-500">
                <p>&copy; {new Date().getFullYear()} Audit Gen. Designed for QuickBooks Online.</p>
            </footer>
        </div>
    );
}
