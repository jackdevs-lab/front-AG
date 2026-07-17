import React from 'react';
import Link from 'next/link';
import { 
    CheckCircle2, 
    ArrowRight, 
    BarChart3, 
    ShieldCheck, 
    Zap, 
    Database,
    Activity,
    Search
} from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <Link className="flex items-center justify-center" href="/">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-2">
                        <span className="text-primary-foreground font-bold text-sm">QH</span>
                    </div>
                    <span className="font-black text-xl tracking-tight text-slate-900">QB Health</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-bold text-slate-600 hover:text-primary transition-colors" href="#features">
                        Features
                    </Link>
                    <Link className="text-sm font-bold text-slate-600 hover:text-primary transition-colors" href="#how-it-works">
                        How It Works
                    </Link>
                    <SignUpButton mode="modal">
                        <button className="text-sm font-bold text-slate-900 hover:text-primary transition-colors">
                            Sign In
                        </button>
                    </SignUpButton>
                </nav>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-bold text-primary uppercase tracking-wider">
                                        Intelligent Bookkeeping
                                    </div>
                                    <h1 className="text-3xl font-black tracking-tighter sm:text-5xl xl:text-6xl/none text-slate-900">
                                        Stop Guessing Your <br />
                                        <span className="text-primary">Financial Health.</span>
                                    </h1>
                                    <p className="max-w-[600px] text-slate-500 md:text-xl font-medium">
                                        Connect your QuickBooks Online in seconds and run 50+ diagnostic rules to identify hygiene issues, workflow gaps, and reconcilliation errors automatically.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                        <Button size="lg" className="h-12 px-8 text-md font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2">
                                            Get Started Free <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </SignUpButton>
                                    <Button variant="outline" size="lg" className="h-12 px-8 text-md font-bold rounded-xl border-slate-200 hover:bg-slate-50 transition-all">
                                        Watch Demo
                                    </Button>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card required
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Intuit Certified Partner
                                    </div>
                                </div>
                            </div>
                            {/* Visual Preview */}
                            <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden aspect-[4/3] flex flex-col">
                                        {/* Mock UI */}
                                        <div className="h-10 border-b border-slate-50 flex items-center px-4 gap-2 bg-slate-50/50">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                            </div>
                                            <div className="h-4 w-32 bg-white rounded-md border border-slate-100 mx-auto"></div>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="h-3 w-24 bg-slate-100 rounded"></div>
                                                    <div className="h-8 w-16 bg-slate-900 rounded-lg"></div>
                                                </div>
                                                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-slate-100 animate-[spin_3s_linear_infinite]"></div>
                                            </div>
                                            <div className="space-y-3">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="h-12 w-full bg-slate-50 border border-slate-100 rounded-lg flex items-center px-4 justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-1 h-6 rounded-full ${i === 1 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                                            <div className="h-3 w-32 bg-slate-200 rounded"></div>
                                                        </div>
                                                        <div className="h-3 w-12 bg-slate-100 rounded"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black tracking-tighter sm:text-5xl text-slate-900">
                                    Everything you need to <br />
                                    <span className="text-primary">Keep Clean Books.</span>
                                </h2>
                                <p className="max-w-[900px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-medium">
                                    Our platform automates the tedious work of auditing your QuickBooks data, so you can focus on growing your business.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                            <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all text-center">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <Zap className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Auto-Sync</h3>
                                <p className="text-slate-500 font-medium">
                                    We pull your latest transactions directly from QuickBooks Online every hour.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all text-center">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <Search className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">50+ Rules</h3>
                                <p className="text-slate-500 font-medium">
                                    From unlinked payments to abnormal balances, we catch what human eyes miss.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all text-center">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <BarChart3 className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Health Score</h3>
                                <p className="text-slate-500 font-medium">
                                    Get a single score that quantifies the hygiene of your bookkeeping records.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
                    <div className="container px-4 md:px-6 mx-auto">
                        <h2 className="text-3xl font-black tracking-tighter text-center mb-12 text-slate-900">
                            How It Works
                        </h2>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                                    1
                                </div>
                                <h3 className="text-xl font-bold">Connect QBO</h3>
                                <p className="text-slate-500 font-medium">
                                    Securely authorize access to your QuickBooks Online company in one click.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                                    2
                                </div>
                                <h3 className="text-xl font-bold">Run Audit</h3>
                                <p className="text-slate-500 font-medium">
                                    Our engine scans your entire history for errors, duplicates, and missing links.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                                    3
                                </div>
                                <h3 className="text-xl font-bold">Fix & Improve</h3>
                                <p className="text-slate-500 font-medium">
                                    Review the specific exceptions and follow our guidance to clean up your books.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium">
                    © 2026 QuickBooks Health Monitor. All rights reserved.
                </p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4 text-slate-400 font-medium" href="#">
                        Terms of Service
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4 text-slate-400 font-medium" href="#">
                        Privacy
                    </Link>
                </nav>
            </footer>
        </div>
    );
}
