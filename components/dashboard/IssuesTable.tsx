'use client';

import React, { useState, useMemo } from 'react';
import { Issue, Severity, DiagnosticEntity } from '@/types/diagnostic';
import { AuditDrawer } from '@/components/diagnostics/AuditDrawer';
import { SubscriptionButton } from '@/components/billing/SubscriptionButton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronRight, Info, ShieldAlert, FileSearch, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_PRIORITY: Record<string, number> = {
    CRITICAL: 3,
    WARNING: 2,
    INFO: 1
};

// ─────────────────────────────────────────────────────────────────────────────
// LockedIssuesOverlay
//
// Rendered instead of actual issue data when subscriptionStatus !== 'ACTIVE'.
// Shows a blurred placeholder table so users understand the shape of what
// they're missing, plus a clear upgrade CTA.
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_ISSUES = [
    { rule: 'Duplicate Invoices', severity: 'CRITICAL', entities: 14 },
    { rule: 'Unreconciled Transactions', severity: 'CRITICAL', entities: 42 },
    { rule: 'Orphaned Bill Payments', severity: 'WARNING', entities: 3 },
    { rule: 'Vendor Duplicates', severity: 'WARNING', entities: 8 },
];

function LockedIssuesOverlay({ connectionId }: { connectionId: string }) {
    return (
        <div
            className="relative bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
            role="region"
            aria-label="Issue results locked — subscription required"
        >
            {/* Blurred placeholder table to tease structure */}
            <div className="select-none pointer-events-none" aria-hidden="true">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="w-[45%] text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 pl-6">Diagnostic Rule</TableHead>
                            <TableHead className="w-[20%] text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Severity</TableHead>
                            <TableHead className="w-[20%] text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Affected Entities</TableHead>
                            <TableHead className="w-[15%] text-right text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 pr-6">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {PLACEHOLDER_ISSUES.map((row, i) => (
                            <TableRow key={i} className="border-slate-100">
                                <TableCell className="w-[45%] py-5 pl-6">
                                    <div className="flex flex-col gap-2">
                                        <div className="h-3 w-48 rounded bg-slate-200 animate-pulse" />
                                        <div className="h-2 w-24 rounded bg-slate-100 animate-pulse" />
                                    </div>
                                </TableCell>
                                <TableCell className="w-[20%]">
                                    <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
                                </TableCell>
                                <TableCell className="w-[20%]">
                                    <div className="h-5 w-8 rounded bg-slate-100 animate-pulse" />
                                </TableCell>
                                <TableCell className="w-[15%] text-right pr-6">
                                    <div className="inline-flex h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Absolute Lock Overlay */}
            <div className="absolute inset-0 backdrop-blur-[3px] bg-white/70 flex flex-col items-center justify-center gap-6 z-10">
                <div className="relative">
                    <div className="absolute inset-0 bg-slate-900/10 rounded-2xl blur-xl" />
                    <div className="relative p-4 bg-slate-900 rounded-2xl shadow-2xl">
                        <Lock className="h-7 w-7 text-white" aria-hidden="true" />
                    </div>
                </div>

                <div className="space-y-1.5 max-w-sm text-center">
                    <p className="text-lg font-black text-slate-900 tracking-tight">
                        Issues Locked
                    </p>
                    <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                        Subscribe to see which rules triggered, which transactions are affected, and how to fix them.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                    <SubscriptionButton
                        connectionId={connectionId}
                        text="Unlock Issue Findings"
                        className="w-full h-10 text-[11px]"
                    />
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <ShieldCheck className="h-3 w-3" />
                        Secured payment via Paystack
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// IssuesTable — main export
// ─────────────────────────────────────────────────────────────────────────────

interface IssuesTableProps {
    issues: Issue[];
    filterType: string | null;
    locked?: false;
}

interface LockedIssuesTableProps {
    locked: true;
    connectionId: string;
    filterType?: string | null;
}

type Props = IssuesTableProps | LockedIssuesTableProps;

export function IssuesTable(props: Props) {
    if (props.locked === true) {
        return <LockedIssuesOverlay connectionId={props.connectionId} />;
    }

    const { issues = [], filterType } = props;
    return <UnlockedIssuesTable issues={issues} filterType={filterType} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// UnlockedIssuesTable — full render (subscription ACTIVE)
// ─────────────────────────────────────────────────────────────────────────────
function UnlockedIssuesTable({ issues, filterType }: { issues: Issue[]; filterType: string | null }) {
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

    const filteredIssues = useMemo(() => {
        if (!filterType) return issues;
        return issues.filter(issue =>
            Array.isArray(issue.entities) &&
            issue.entities.some((e: DiagnosticEntity) => e.type === filterType)
        );
    }, [issues, filterType]);

    const groupedIssues = useMemo(() => {
        const groups: Record<string, {
            ruleName: string;
            severity: Severity;
            totalEntities: number;
            latestIssue: Issue;
        }> = {};

        filteredIssues.forEach(issue => {
            if (!groups[issue.ruleId]) {
                groups[issue.ruleId] = {
                    ruleName: issue.ruleName,
                    severity: issue.severity,
                    totalEntities: 0,
                    latestIssue: issue
                };
            }

            groups[issue.ruleId].totalEntities += issue.entityCount;

            // Upgrade group severity if the current issue is higher priority
            const currentPriority = SEVERITY_PRIORITY[issue.severity] || 0;
            const groupPriority = SEVERITY_PRIORITY[groups[issue.ruleId].severity] || 0;

            if (currentPriority > groupPriority) {
                groups[issue.ruleId].severity = issue.severity;
                groups[issue.ruleId].latestIssue = issue;
            }
        });

        // Sort by highest severity first
        return Object.entries(groups).sort((a, b) => {
            const priorityA = SEVERITY_PRIORITY[a[1].severity] || 0;
            const priorityB = SEVERITY_PRIORITY[b[1].severity] || 0;
            return priorityB - priorityA;
        });
    }, [filteredIssues]);

    // Empty state - zero issues overall
    if (issues.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 border border-slate-100">
                    <FileSearch className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">No Issues Found</h3>
                    <p className="text-sm text-slate-400 font-medium max-w-[280px] mx-auto leading-relaxed">
                        Your ledger looks healthy! Run another audit to confirm everything is still in order.
                    </p>
                </div>
            </div>
        );
    }

    // Empty state - filtered out
    if (filteredIssues.length === 0 && filterType) {
        return (
            <div className="py-20 text-center">
                <p className="text-sm font-black text-slate-900">No issues for &quot;{filterType}&quot;</p>
                <p className="text-xs text-slate-400 mt-1">Try selecting a different entity type or clear filters.</p>
            </div>
        );
    }

    return (
        <div
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
            role="region"
            aria-label="Diagnostic Issues Table"
        >
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="w-[45%] text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 pl-6">Diagnostic Rule</TableHead>
                            <TableHead className="w-[20%] text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Severity</TableHead>
                            <TableHead className="w-[20%] text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Affected Entities</TableHead>
                            <TableHead className="w-[15%] text-right text-[10px] font-black uppercase tracking-widest text-slate-400 py-4 pr-6">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupedIssues.map(([ruleId, group]) => (
                            <TableRow
                                key={ruleId}
                                className="group cursor-pointer hover:bg-slate-50/80 transition-colors border-slate-100"
                                onClick={() => setSelectedIssue(group.latestIssue)}
                                tabIndex={0}
                                role="button"
                                aria-label={`View issue details for ${group.ruleName}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedIssue(group.latestIssue);
                                    }
                                }}
                            >
                                <TableCell className="w-[45%] py-5 pl-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{group.ruleName}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{ruleId}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="w-[20%]">
                                    <div className="flex items-center gap-2">
                                        {group.severity === 'CRITICAL'
                                            ? <ShieldAlert className="h-4 w-4 text-rose-500" aria-hidden="true" />
                                            : group.severity === 'WARNING'
                                                ? <AlertCircle className="h-4 w-4 text-amber-500" aria-hidden="true" />
                                                : <Info className="h-4 w-4 text-blue-500" aria-hidden="true" />}
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            group.severity === 'CRITICAL' ? "text-rose-600" :
                                                group.severity === 'WARNING' ? "text-amber-600" : "text-blue-600"
                                        )}>
                                            {group.severity}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="w-[20%]">
                                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-mono font-black text-[11px] px-2.5 py-0.5 rounded-lg">
                                        {group.totalEntities.toLocaleString()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="w-[15%] text-right pr-6">
                                    <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all ml-auto">
                                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {selectedIssue && (
                <AuditDrawer
                    isOpen={!!selectedIssue}
                    onClose={() => setSelectedIssue(null)}
                    ruleName={selectedIssue.ruleName}
                    category={selectedIssue.severity}
                    message={selectedIssue.message}
                />
            )}
        </div>
    );
}