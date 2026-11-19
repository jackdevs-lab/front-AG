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
import { AlertCircle, ChevronRight, Info, ShieldAlert, FileSearch, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const SEVERITY_PRIORITY: Record<string, number> = {
    CRITICAL: 3,
    WARNING: 2,
    INFO: 1
};

interface IssuesTableProps {
    issues: Issue[];
    filterType: string | null;
    locked?: boolean;
    connectionId?: string;
}

export function IssuesTable({ issues = [], filterType, locked = false, connectionId }: IssuesTableProps) {
    return <UnlockedIssuesTable issues={issues} filterType={filterType} locked={locked} connectionId={connectionId} />;
}

function UnlockedIssuesTable({ issues, filterType, locked, connectionId }: { issues: Issue[]; filterType: string | null; locked?: boolean; connectionId?: string }) {
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);

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

    // CLICK INTERCEPTION: locked -> paywall, unlocked -> drawer
    const handleRowClick = (issue: Issue) => {
        if (locked) {
            setShowPaywall(true);
        } else {
            setSelectedIssue(issue);
        }
    };

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

    if (filteredIssues.length === 0 && filterType) {
        return (
            <div className="py-24 text-center space-y-1">
                <p className="text-sm font-semibold text-zinc-900">No records found for &quot;{filterType}&quot;</p>
                <p className="text-xs text-zinc-500 font-normal">Select an alternate classification parameter or reset the view filters.</p>
            </div>
        );
    }

    return (
        <div className="bg-transparent" role="region" aria-label="Executive Diagnostic Issues Ledger">
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
                                onClick={() => handleRowClick(group.latestIssue)}
                                tabIndex={0}
                                role="button"
                                aria-label={`View issue details for ${group.ruleName}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleRowClick(group.latestIssue);
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

            {selectedIssue && !locked && (
                <AuditDrawer
                    isOpen={!!selectedIssue}
                    onClose={() => setSelectedIssue(null)}
                    ruleName={selectedIssue.ruleName}
                    category={selectedIssue.severity}
                    message={selectedIssue.message}
                />
            )}

            {showPaywall && locked && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPaywall(false)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 space-y-5 text-center border border-zinc-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="inline-flex p-3 bg-zinc-900 text-white rounded-2xl shadow-xl">
                            <Lock className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-zinc-900 tracking-tight">
                                Detailed Findings Restricted
                            </h3>
                            <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                                Upgrade your monitoring tier to view impacted entity records, exact exposure amounts, and access remediation workflows.
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-3 pt-1">
                            {connectionId && (
                                <SubscriptionButton
                                    connectionId={connectionId}
                                    text="Unlock Executive Report"
                                    className="w-full h-10 text-xs bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl shadow-xs transition-all"
                                />
                            )}
                            <button
                                onClick={() => setShowPaywall(false)}
                                className="text-[11px] text-zinc-400 hover:text-zinc-600 font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}