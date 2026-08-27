'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useConnections } from '@/lib/hooks/useConnections';
import { useLatestDiagnostics } from '@/lib/hooks/useDiagnostics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DiagnosticSummary } from '@/components/dashboard/DiagnosticSummary';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Download,
    Calendar,
    ShieldCheck,
    Scale,
    Activity,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ArrowRight,
    Landmark,
    FileWarning,
    Receipt,
    Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

import { useActiveConnection } from '@/lib/contexts/ConnectionContext';

export default function ReportsPage() {
    const { connections, selectedConnectionId, activeConnection } = useActiveConnection();

    const {
        data: diagnostic,
        isLoading,
        refetch
    } = useLatestDiagnostics(selectedConnectionId || '');

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    // Handle Server-Side PDF Stream Export Request
    const handleDownloadPdf = async () => {
        if (!selectedConnectionId) return;

        try {
            setIsDownloading(true);
            setDownloadError(null);

            const response = await fetch(`/api/reports/pdf/${selectedConnectionId}`, {
                method: 'GET',
            });

            if (response.status === 402) {
                throw new Error('Active subscription required to download PDF audit reports.');
            }

            if (!response.ok) {
                throw new Error('Failed to generate PDF report. Please try again.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qb-health-report-${selectedConnectionId.slice(0, 8)}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setDownloadError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const categories = [
        { name: 'Hygiene & Data Quality', icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-blue-500' },
        { name: 'Balance & Ledger', icon: <Scale className="h-5 w-5" />, color: 'bg-indigo-500' },
        { name: 'Banking', icon: <Landmark className="h-5 w-5" />, color: 'bg-emerald-500' },
        { name: 'Workflow', icon: <Activity className="h-5 w-5" />, color: 'bg-purple-500' },
        { name: 'AR Rules', icon: <FileWarning className="h-5 w-5" />, color: 'bg-rose-500' },
        { name: 'AP Rules', icon: <Receipt className="h-5 w-5" />, color: 'bg-orange-500' },
    ];

    const getScoreForCategory = (category: string) => {
        if (!diagnostic || diagnostic.locked || !diagnostic.checks) return 100;
        const catChecks = diagnostic.checks.filter(c => c.category.toUpperCase() === category.toUpperCase());
        if (catChecks.length === 0) return 100;
        const passed = catChecks.filter(c => c.status === 'PASSED').length;
        return Math.round((passed / catChecks.length) * 100);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <FileText className="h-10 w-10 text-primary" />
                        Health Report
                    </h1>
                    <p className="text-muted-foreground text-lg mt-1">
                        Comprehensive diagnostic analysis of your QuickBooks data.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 font-bold"
                        onClick={handleDownloadPdf}
                        disabled={isDownloading || !selectedConnectionId}
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export PDF
                            </>
                        )}
                    </Button>
                    <Button className="gap-2 font-bold shadow-lg shadow-primary/20" onClick={() => refetch()}>
                        <Activity className="h-4 w-4" />
                        Refresh Data
                    </Button>
                </div>
            </div>

            {downloadError && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{downloadError}</span>
                </div>
            )}

            {/* Connection & Meta */}
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
                <div className="flex items-center gap-2 pr-4 border-r border-muted-foreground/20">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">
                        {diagnostic ? format(new Date(diagnostic.runAt), 'MMMM d, yyyy') : 'No data'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-muted-foreground tracking-widest leading-none">Status:</span>
                    <Badge variant={diagnostic && !diagnostic.locked && diagnostic.healthScore && diagnostic.healthScore >= 75 ? 'success' : 'warning'} className="rounded-full px-3 py-0.5 font-black text-[10px] uppercase">
                        {diagnostic ? (diagnostic.locked ? 'LOCKED' : diagnostic.scoreLabel || 'Syncing') : 'Syncing'}
                    </Badge>
                </div>
            </div>

            {diagnostic && !diagnostic.locked ? (
                <div className="grid gap-8">
                    {/* Summary Cards */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {categories.map(cat => (
                            <Card key={cat.name} className="overflow-hidden border-none shadow-xl bg-white group hover:shadow-2xl transition-all duration-300">
                                <div className={cn("h-1.5 w-full", cat.color)} />
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className={cn("p-2 rounded-xl text-white shadow-lg", cat.color)}>
                                            {cat.icon}
                                        </div>
                                        <span className="text-3xl font-black tracking-tight">
                                            {getScoreForCategory(cat.name)}%
                                        </span>
                                    </div>
                                    <CardTitle className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground mt-4">
                                        {cat.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-1000", cat.color)}
                                            style={{ width: `${getScoreForCategory(cat.name)}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Detailed Analysis Section */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Issues Breakdown */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="border-none shadow-2xl overflow-hidden">
                                <CardHeader className="bg-gray-900 text-white">
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-warning" />
                                        Issues Summary
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Findings requiring your attention.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-danger/5 border border-danger/10">
                                            <div className="flex items-center gap-3">
                                                <XCircle className="h-5 w-5 text-danger" />
                                                <span className="font-bold">Critical</span>
                                            </div>
                                            <Badge variant="destructive" className="font-black text-xs">
                                                {diagnostic.issues.filter(i => i.severity === 'CRITICAL').length}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/10">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle className="h-5 w-5 text-warning" />
                                                <span className="font-bold">Warnings</span>
                                            </div>
                                            <Badge className="bg-warning text-black font-black text-xs">
                                                {diagnostic.issues.filter(i => i.severity === 'WARNING').length}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/10">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-success" />
                                                <span className="font-bold">Passed Checks</span>
                                            </div>
                                            <span className="font-black">
                                                {diagnostic.checks.filter(c => c.status === 'PASSED').length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest">Expert Advice</p>
                                        <p className="text-sm text-primary/80 leading-relaxed italic">
                                            {diagnostic.healthScore > 80
                                                ? "Your financials look solid. Minor hygiene issues can be resolved manually in QuickBooks."
                                                : "Immediate action recommended. Focus on critical ledger imbalances to ensure reporting accuracy."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Full Diagnostics Table/List */}
                        <div className="lg:col-span-2 space-y-6">
                            <DiagnosticSummary checks={diagnostic.checks} issues={diagnostic.issues} />
                        </div>
                    </div>
                </div>
            ) : diagnostic && diagnostic.locked ? (
                <Card className="border-dashed border-2 p-20 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="p-4 rounded-full bg-muted/50">
                        <Lock className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tight">Report Locked</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Full diagnostic reports are available on premium plans. Upgrade to unlock deep insights.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            size="lg"
                            className="font-bold shadow-xl shadow-primary/20 gap-2"
                            asChild
                        >
                            <Link href={`/billing?connectionId=${selectedConnectionId}`}>
                                View Pricing <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card className="border-dashed border-2 p-20 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="p-4 rounded-full bg-muted/50">
                        <Activity className="h-10 w-10 text-muted-foreground animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tight">Ready for Deep Analysis</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            We haven't performed a diagnostic run for this connection yet.
                            Start a Deep Scan to uncover hidden insights in your QuickBooks data.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            size="lg"
                            className="font-bold shadow-xl shadow-primary/20 gap-2"
                            asChild
                        >
                            <Link href="/dashboard">
                                Go to Dashboard <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}