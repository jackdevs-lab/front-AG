'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    ChevronRight,
    Filter,
    Eye,
    EyeOff,
    ChevronDown,
    AlertCircle,
    Lock,
    ShieldCheck
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { AuditDrawer } from '@/components/diagnostics/AuditDrawer';
import { SubscriptionButton } from '@/components/billing/SubscriptionButton';
import { cn } from '@/lib/utils/cn';
import { DiagnosticCheck, Issue, LockedDiagnosticRun } from '@/types/diagnostic';
import { format } from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
// LockedRulesOverlay
//
// Rendered instead of actual rule data when subscriptionStatus !== 'ACTIVE'.
// Shows a blurred placeholder table so users understand the shape of what
// they're missing, plus a clear upgrade CTA.
// ─────────────────────────────────────────────────────────────────────────────
const PLACEHOLDER_ROWS = [
    { name: 'Duplicate Invoices', category: 'AR', status: 'FAILED' },
    { name: 'Unreconciled Transactions', category: 'Banking', status: 'FAILED' },
    { name: 'Orphaned Bill Payments', category: 'AP', status: 'WARNING' },
    { name: 'Vendor Duplicates', category: 'Hygiene', status: 'WARNING' },
    { name: 'High Journal Entry Volume', category: 'Hygiene', status: 'PASSED' },
    { name: 'Unapplied Customer Credits', category: 'AR', status: 'PASSED' },
];

function LockedRulesOverlay({ connectionId }: { connectionId: string }) {
    return (
        <div className="relative" role="region" aria-label="Locked diagnostic results">
            {/* Blurred placeholder table */}
            <div className="select-none pointer-events-none" aria-hidden="true">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-2 h-10">Diagnostic Rule</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-2 h-10">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-2 h-10 text-right">Exceptions</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-2 h-10 text-right">Last Execution</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {PLACEHOLDER_ROWS.map((row, i) => (
                            <TableRow key={i} className="border-slate-100">
                                <TableCell className="py-3 pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-1 h-8 rounded-full",
                                            row.status === 'FAILED' ? 'bg-red-400' :
                                                row.status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-400'
                                        )} />
                                        <div className="flex flex-col gap-1">
                                            <div className="h-3 w-40 rounded bg-slate-200 animate-pulse" />
                                            <div className="h-2 w-20 rounded bg-slate-100 animate-pulse" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={cn(
                                        "inline-flex px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tight",
                                        row.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-100' :
                                            row.status === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    )}>
                                        {row.status === 'FAILED' ? 'Critical' : row.status === 'WARNING' ? 'Warning' : 'Passed'}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="h-3 w-6 rounded bg-slate-200 animate-pulse ml-auto" />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="h-3 w-12 rounded bg-slate-200 animate-pulse ml-auto" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Lock overlay */}
            <div
                className="absolute inset-0 backdrop-blur-[3px] bg-white/70 flex flex-col items-center justify-center gap-6 rounded-xl"
            >
                <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-slate-900/10 rounded-2xl blur-xl" />
                        <div className="relative p-4 bg-slate-900 rounded-2xl shadow-2xl">
                            <Lock className="h-7 w-7 text-white" aria-hidden="true" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-lg font-black text-slate-900 tracking-tight">
                            Diagnostics Locked
                        </p>
                        <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                            Your audit ran successfully. Subscribe to unlock full rule-by-rule findings, severity breakdowns, and affected entity counts.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 w-full">
                        <SubscriptionButton
                            connectionId={connectionId}
                            text="Unlock Full Diagnostics"
                            className="w-full h-10 text-[11px]"
                        />
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <ShieldCheck className="h-3 w-3" />
                            Secured payment via Paystack
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// RulesTable — main export
//
// Accepts either:
//   - Full data (checks + issues) when the connection is subscribed
//   - A locked prop (+ connectionId) to render the blurred placeholder
// ─────────────────────────────────────────────────────────────────────────────

interface RulesTableProps {
    checks: DiagnosticCheck[];
    issues: Issue[];
}

interface LockedRulesTableProps {
    locked: true;
    connectionId: string;
    runAt?: Date;
}

type Props = RulesTableProps | LockedRulesTableProps;

function isLocked(props: Props): props is LockedRulesTableProps {
    return 'locked' in props && props.locked === true;
}

export function RulesTable(props: Props) {
    // ── Locked state — render overlay without exposing any real data ──────
    if (isLocked(props)) {
        return (
            <div
                className="bg-white border border-slate-100 rounded-xl overflow-hidden relative"
                role="region"
                aria-label="Locked diagnostic audit rules"
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-50 bg-slate-50/20">
                    <div className="flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            Audit Rules
                        </span>
                    </div>
                    {props.runAt && (
                        <span className="text-[10px] text-slate-400 font-mono">
                            Run: {format(new Date(props.runAt), 'MMM d, h:mm a')}
                        </span>
                    )}
                </div>
                {/* 
                  LockedRulesOverlay (which holds the blurred table and backdrop block) 
                  renders strictly over the detailed row data area, keeping structure intact 
                */}
                <LockedRulesOverlay connectionId={props.connectionId} />
            </div>
        );
    }

    // ── Unlocked state — full render ─────────────────────────────────────
    const { checks, issues } = props;
    return <UnlockedRulesTable checks={checks} issues={issues} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// UnlockedRulesTable — full render (subscription ACTIVE)
// ─────────────────────────────────────────────────────────────────────────────
function UnlockedRulesTable({ checks, issues }: RulesTableProps) {
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    // Focus Mode: Hide passed rules, persisted to localStorage
    const [focusMode, setFocusMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('qb-health-rules-focus-mode') === 'true';
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('qb-health-rules-focus-mode', String(focusMode));
    }, [focusMode]);

    const filteredChecks = useMemo(() => {
        let result = [...checks];
        if (focusMode) result = result.filter(c => c.status !== 'PASSED');
        if (statusFilter) result = result.filter(c => c.status === statusFilter);
        if (categoryFilter && categoryFilter !== 'all') result = result.filter(c => c.category === categoryFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.ruleName.toLowerCase().includes(q) ||
                c.ruleId.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q)
            );
        }
        return result.sort((a, b) => {
            if (a.status === 'FAILED' && b.status !== 'FAILED') return -1;
            if (a.status !== 'FAILED' && b.status === 'FAILED') return 1;
            return a.category.localeCompare(b.category) || a.ruleName.localeCompare(b.ruleName);
        });
    }, [checks, focusMode, statusFilter, categoryFilter, searchQuery]);

    const groupedChecks = useMemo(() => {
        return filteredChecks.reduce((acc, check) => {
            if (!acc[check.category]) acc[check.category] = [];
            acc[check.category].push(check);
            return acc;
        }, {} as Record<string, DiagnosticCheck[]>);
    }, [filteredChecks]);

    const categories = useMemo(() => {
        const unique = Array.from(new Set(checks.map(c => c.category)));
        return ['all', ...unique.sort()];
    }, [checks]);

    const selectedCheck = (checks || []).find(c => c.ruleId === selectedRuleId);
    const selectedIssues = (issues || []).filter(i => i.ruleId === selectedRuleId);
    const totalHidden = focusMode ? checks.filter(c => c.status === 'PASSED').length : 0;
    const totalVisible = filteredChecks.length;

    const statusConfig = {
        FAILED: { bg: 'bg-red-50/50', text: 'text-[#991b1b]', border: 'border-red-100/50', label: 'Critical', indicator: 'bg-red-500' },
        WARNING: { bg: 'bg-amber-50/50', text: 'text-[#b45309]', border: 'border-amber-100/50', label: 'Warning', indicator: 'bg-amber-500' },
        PASSED: { bg: 'bg-emerald-50/50', text: 'text-[#065f46]', border: 'border-emerald-100/50', label: 'Passed', indicator: 'bg-emerald-500' }
    };

    const toggleFilter = (status: string) => {
        setStatusFilter(prev => prev === status ? null : status);
        setCategoryFilter(null);
    };

    return (
        <div
            className="bg-white border border-slate-100 rounded-xl overflow-hidden"
            role="region"
            aria-labelledby="rules-table-heading"
        >
            <h2 id="rules-table-heading" className="sr-only">Audit Rules Table</h2>

            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border-b border-slate-50 bg-slate-50/20">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        {(['FAILED', 'WARNING', 'PASSED'] as const).map(status => {
                            const config = statusConfig[status];
                            const count = checks.filter(c => c.status === status).length;
                            const isActive = statusFilter === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => toggleFilter(status)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border transition-all",
                                        isActive
                                            ? `${config.bg} ${config.border} ${config.text} shadow-sm`
                                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                    )}
                                    aria-pressed={isActive}
                                >
                                    {config.label} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {statusFilter && (
                        <button
                            onClick={() => setStatusFilter(null)}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline underline-offset-2"
                        >
                            Clear
                        </button>
                    )}

                    <div className="h-6 w-px bg-slate-200 mx-1" aria-hidden="true" />
                    <Button
                        variant={focusMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFocusMode(prev => !prev)}
                        className={cn(
                            "h-7 text-[10px] font-bold uppercase tracking-wide gap-1.5",
                            focusMode ? "bg-slate-900 hover:bg-slate-800 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                        aria-pressed={focusMode}
                        aria-label={focusMode ? "Show all rules" : "Hide passed rules (Focus Mode)"}
                    >
                        {focusMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        Focus
                    </Button>
                    {totalHidden > 0 && focusMode && (
                        <span className="text-[10px] text-slate-400 font-medium">({totalHidden} hidden)</span>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select
                        value={categoryFilter || 'all'}
                        onValueChange={(val: string) => setCategoryFilter(val === 'all' ? null : val)}
                    >
                        <SelectTrigger className="w-[140px] h-8 bg-white border-slate-200 rounded-lg text-[12px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.filter(c => c !== 'all').map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="relative w-full sm:w-48">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search rules..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-8 bg-white border-slate-200 rounded-lg text-[12px]"
                            aria-label="Search audit rules"
                        />
                    </div>
                </div>
            </div>

            {totalVisible < checks.length && (
                <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                    <Filter className="h-3 w-3" />
                    Showing {totalVisible} of {checks.length} rules
                    {focusMode && <span className="text-amber-600 font-medium">• Focus Mode active</span>}
                </div>
            )}

            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-2 h-10">Diagnostic Rule</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-2 h-10">Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-2 h-10 text-right">Exceptions</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-2 h-10 text-right">Last Execution</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.keys(groupedChecks).length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center">
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                    <AlertCircle className="h-5 w-5 opacity-50" />
                                    <span className="text-sm font-medium">No rules match your filters</span>
                                    {(statusFilter || categoryFilter || searchQuery || focusMode) && (
                                        <button
                                            onClick={() => { setStatusFilter(null); setCategoryFilter(null); setSearchQuery(''); setFocusMode(false); }}
                                            className="text-[11px] text-primary hover:underline font-medium"
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        <Accordion type="single" collapsible defaultValue={Object.keys(groupedChecks)[0]} className="w-full">
                            {Object.entries(groupedChecks).map(([category, categoryChecks]) => {
                                const failedCount = categoryChecks.filter(c => c.status === 'FAILED').length;
                                const warningCount = categoryChecks.filter(c => c.status === 'WARNING').length;
                                return (
                                    <AccordionItem key={category} value={category} className="border-b border-slate-100 last:border-0">
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                                            <div className="flex items-center gap-3 w-full">
                                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">{category}</span>
                                                <div className="flex items-center gap-1.5">
                                                    {failedCount > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{failedCount} critical</span>}
                                                    {warningCount > 0 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{warningCount} warning</span>}
                                                    <span className="text-[10px] text-slate-400">({categoryChecks.length})</span>
                                                </div>
                                                <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-data-[state=open]:rotate-180 transition-transform" />
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-0 pb-1">
                                            <Table className="border-0">
                                                <TableBody>
                                                    {categoryChecks.map((check) => {
                                                        const config = statusConfig[check.status as keyof typeof statusConfig] || statusConfig.PASSED;
                                                        const issueCount = (issues || []).filter(i => i.ruleId === check.ruleId).reduce((sum, i) => sum + (i.entityCount || 0), 0);
                                                        return (
                                                            <TableRow
                                                                key={check.ruleId}
                                                                className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                                                                onClick={() => setSelectedRuleId(check.ruleId)}
                                                                tabIndex={0}
                                                                onKeyDown={(e) => e.key === 'Enter' && setSelectedRuleId(check.ruleId)}
                                                            >
                                                                <TableCell className="py-2.5 pl-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={cn("w-1 h-8 rounded-full", config.indicator)} />
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[13px] font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{check.ruleName}</span>
                                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{check.ruleId}</span>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-2.5">
                                                                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tight", config.bg, config.text, config.border)}>
                                                                        {config.label}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="py-2.5 text-right font-mono text-[12px] font-bold text-slate-600">
                                                                    {issueCount > 0 ? (
                                                                        <span className={cn(check.status === 'FAILED' ? "text-red-600" : "text-amber-600")}>{issueCount.toLocaleString()}</span>
                                                                    ) : (
                                                                        <span className="text-slate-300">0</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="py-2.5 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <span className="text-[10px] font-mono font-bold text-slate-400">{format(new Date(check.createdAt), 'MMM d')}</span>
                                                                        <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-slate-600 transition-colors" />
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}
                </TableBody>
            </Table>

            <AuditDrawer
                isOpen={!!selectedRuleId}
                onClose={() => setSelectedRuleId(null)}
                ruleName={selectedCheck?.ruleName}
                category={selectedCheck?.category}
                message={selectedIssues[0]?.message || selectedCheck?.message || ''}
            />
        </div>
    );
}