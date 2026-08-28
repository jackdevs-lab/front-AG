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
// LockedIssuesOverlay (CFO Style: Borderless, Whitespace-Driven, Premium Blur)
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
            className="relative bg-transparent overflow-hidden py-4"
            role="region"
            aria-label="Issue results locked — subscription required"
        >
            {/* Blurred placeholder layout reflecting clean financial statement aesthetics */}
            <div className="select-none pointer-events-none opacity-40 filter blur-[4px]" aria-hidden="true">
                <Table>
                    <TableHeader className="border-b border-zinc-200">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[50%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 pl-0">Diagnostic Rule</TableHead>
                            <TableHead className="w-[20%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4">Severity</TableHead>
                            <TableHead className="w-[20%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 text-right">Affected Entities</TableHead>
                            <TableHead className="w-[10%] text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 pr-0"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {PLACEHOLDER_ISSUES.map((row, i) => (
                            <TableRow key={i} className="border-b border-zinc-100/80">
                                <TableCell className="w-[50%] py-6 pl-0">
                                    <div className="h-4 w-56 rounded bg-zinc-200 animate-pulse" />
                                </TableCell>
                                <TableCell className="w-[20%]">
                                    <div className="h-4 w-20 rounded bg-zinc-200 animate-pulse" />
                                </TableCell>
                                <TableCell className="w-[20%] text-right">
                                    <div className="h-4 w-8 rounded bg-zinc-200 animate-pulse ml-auto" />
                                </TableCell>
                                <TableCell className="w-[10%] text-right pr-0">
                                    <div className="h-4 w-4 rounded bg-zinc-200 animate-pulse ml-auto" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Absolute Executive Lock Callout */}
            <div className="absolute inset-0 backdrop-blur-[2px] bg-white/60 flex flex-col items-center justify-center gap-5 z-10 px-4">
                <div className="p-3 bg-zinc-900 text-white rounded-2xl shadow-xl">
                    <Lock className="h-6 w-6" aria-hidden="true" />
                </div>

                <div className="space-y-1 max-w-md text-center">
                    <p className="text-base font-semibold text-zinc-900 tracking-tight">
                        Executive Findings Restricted
                    </p>
                    <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                        Upgrade your monitoring tier to uncover specific audit rules, view impacted entity records, and access remediation workflows.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2.5 w-full max-w-xs pt-1">
                    <SubscriptionButton
                        connectionId={connectionId}
                        text="Unlock Executive Report"
                        className="w-full h-10 text-xs bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl shadow-xs transition-all"
                    />
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Secured corporate billing via Paystack</span>
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
    connectionId?: string;
}

interface LockedIssuesTableProps {
    locked: true;
    connectionId: string;
    filterType?: string | null;
}

type Props = IssuesTableProps | LockedIssuesTableProps;

export function IssuesTable(props: Props) {
    if (props.locked === true) {
        return <LockedIssuesOverlay connectionId={props.connectionId!} />;
    }

    const { issues = [], filterType, connectionId } = props;
    return <UnlockedIssuesTable issues={issues} filterType={filterType} connectionId={connectionId} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// UnlockedIssuesTable — borderless, whitespace-heavy CFO aesthetic
// ─────────────────────────────────────────────────────────────────────────────
function UnlockedIssuesTable({ issues, filterType, connectionId }: { issues: Issue[]; filterType: string | null, connectionId?: string }) {
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

            const currentPriority = SEVERITY_PRIORITY[issue.severity] || 0;
            const groupPriority = SEVERITY_PRIORITY[groups[issue.ruleId].severity] || 0;

            if (currentPriority > groupPriority) {
                groups[issue.ruleId].severity = issue.severity;
                groups[issue.ruleId].latestIssue = issue;
            }
        });

        return Object.entries(groups).sort((a, b) => {
            const priorityA = SEVERITY_PRIORITY[a[1].severity] || 0;
            const priorityB = SEVERITY_PRIORITY[b[1].severity] || 0;
            return priorityB - priorityA;
        });
    }, [filteredIssues]);

    // Empty state - zero issues overall
    if (issues.length === 0) {
        return (
            <div className="py-24 text-center space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 text-zinc-400">
                    <FileSearch className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">Ledger Fully Optimized</h3>
                    <p className="text-xs text-zinc-500 font-normal max-w-xs mx-auto leading-relaxed">
                        No financial anomalies or exceptions detected across active diagnostic checks.
                    </p>
                </div>
            </div>
        );
    }

    // Empty state - filtered out
    if (filteredIssues.length === 0 && filterType) {
        return (
            <div className="py-24 text-center space-y-1">
                <p className="text-sm font-semibold text-zinc-900">No records found for &quot;{filterType}&quot;</p>
                <p className="text-xs text-zinc-500 font-normal">Select an alternate classification parameter or reset the view filters.</p>
            </div>
        );
    }

    return (
        <div
            className="bg-transparent"
            role="region"
            aria-label="Executive Diagnostic Issues Ledger"
        >
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-zinc-200">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[50%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 pl-0">Diagnostic Rule</TableHead>
                            <TableHead className="w-[20%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4">Severity</TableHead>
                            <TableHead className="w-[20%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 text-right">Affected Entities</TableHead>
                            <TableHead className="w-[10%] text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 pr-0"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupedIssues.map(([ruleId, group]) => (
                            <TableRow
                                key={ruleId}
                                className="group cursor-pointer hover:bg-zinc-50/50 transition-colors border-b border-zinc-100"
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
                                <TableCell className="w-[50%] py-5 pl-0">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors">{group.ruleName}</span>
                                        <span className="text-[10px] font-mono font-medium text-zinc-400">{ruleId}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="w-[20%] py-5">
                                    <div className="flex items-center gap-2">
                                        {group.severity === 'CRITICAL'
                                            ? <ShieldAlert className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
                                            : group.severity === 'WARNING'
                                                ? <AlertCircle className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                                                : <Info className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />}
                                        <span className={cn(
                                            "text-[11px] font-medium tracking-wide",
                                            group.severity === 'CRITICAL' ? "text-rose-600" :
                                                group.severity === 'WARNING' ? "text-amber-600" : "text-blue-600"
                                        )}>
                                            {group.severity}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="w-[20%] py-5 text-right font-mono text-xs font-semibold text-zinc-700">
                                    {group.totalEntities.toLocaleString()}
                                </TableCell>
                                <TableCell className="w-[10%] py-5 text-right pr-0">
                                    <div className="inline-flex items-center justify-center h-7 w-7 text-zinc-400 group-hover:text-zinc-900 transition-colors ml-auto">
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
                    connectionId={connectionId}
                />
            )}
        </div>
    );
}