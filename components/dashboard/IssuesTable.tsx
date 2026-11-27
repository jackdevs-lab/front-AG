'use client';

import React, { useState, useMemo } from 'react';
import { Issue, Severity, DiagnosticEntity } from '@/types/diagnostic';
import { IssueList } from '@/components/dashboard/IssueList';   // ✅ NEW
import { SubscriptionButton } from '@/components/billing/SubscriptionButton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { AlertCircle, ChevronDown, ChevronRight, Info, ShieldAlert, FileSearch, Lock } from 'lucide-react';
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

interface GroupedRule {
    ruleId: string;
    ruleName: string;
    severity: Severity;
    totalEntities: number;
    totalExposure: number;
    currency: string;
    exposureByCurrency: Record<string, number>;
    mergedEntities: DiagnosticEntity[];
    mergedEntityIds: string[];
    representativeMessage: string;
    latestIssue: Issue;
    allIssues: Issue[];   // ✅ NEW — passed to <IssueList>
}

export function IssuesTable({ issues = [], filterType, locked = false, connectionId }: IssuesTableProps) {
    return <UnlockedIssuesTable issues={issues} filterType={filterType} locked={locked} connectionId={connectionId} />;
}

function UnlockedIssuesTable({ issues, filterType, locked, connectionId }: { issues: Issue[]; filterType: string | null; locked?: boolean; connectionId?: string }) {
    // ✅ CHANGED: track which rule is expanded, not a selected group
    const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);

    const filteredIssues = useMemo(() => {
        if (!filterType) return issues;
        return issues.filter(issue =>
            Array.isArray(issue.entities) &&
            issue.entities.some((e: DiagnosticEntity) => e.type === filterType)
        );
    }, [issues, filterType]);

    const groupedIssues = useMemo<Array<[string, GroupedRule]>>(() => {
        const groups: Record<string, GroupedRule> = {};

        filteredIssues.forEach(issue => {
            if (!groups[issue.ruleId]) {
                groups[issue.ruleId] = {
                    ruleId: issue.ruleId,
                    ruleName: issue.ruleName,
                    severity: issue.severity,
                    totalEntities: 0,
                    totalExposure: 0,
                    currency: issue.currency || 'USD',
                    exposureByCurrency: {},
                    mergedEntities: [],
                    mergedEntityIds: [],
                    representativeMessage: issue.message || '',
                    latestIssue: issue,
                    allIssues: [],   // ✅ NEW
                };
            }

            const g = groups[issue.ruleId];

            g.allIssues.push(issue);   // ✅ NEW — raw issue list for <IssueList>
            g.totalEntities += issue.entityCount ?? 0;

            const issueCurrency = issue.currency || g.currency || 'USD';
            const exposure = issue.exposureAmount || 0;
            if (exposure !== 0) {
                g.exposureByCurrency[issueCurrency] =
                    (g.exposureByCurrency[issueCurrency] || 0) + exposure;
            }

            if (Array.isArray(issue.entities)) {
                g.mergedEntities.push(...issue.entities);
            }

            const issueEntityIds = (issue as any).entityIds;
            if (Array.isArray(issueEntityIds)) {
                g.mergedEntityIds.push(...issueEntityIds);
            }

            if ((issue.message?.length ?? 0) > (g.representativeMessage?.length ?? 0)) {
                g.representativeMessage = issue.message;
            }

            const currentPriority = SEVERITY_PRIORITY[issue.severity] || 0;
            const groupPriority = SEVERITY_PRIORITY[g.severity] || 0;
            if (currentPriority > groupPriority) {
                g.severity = issue.severity;
                g.latestIssue = issue;
            }
        });

        Object.values(groups).forEach(g => {
            const currencies = Object.keys(g.exposureByCurrency);
            if (currencies.length === 0) {
                g.totalExposure = 0;
            } else if (currencies.length === 1) {
                g.currency = currencies[0];
                g.totalExposure = g.exposureByCurrency[g.currency];
            } else {
                const primary = currencies.sort(
                    (a, b) => g.exposureByCurrency[b] - g.exposureByCurrency[a]
                )[0];
                g.currency = primary;
                g.totalExposure = g.exposureByCurrency[primary];
            }
        });

        return Object.entries(groups).sort((a, b) => {
            const priorityA = SEVERITY_PRIORITY[a[1].severity] || 0;
            const priorityB = SEVERITY_PRIORITY[b[1].severity] || 0;
            return priorityB - priorityA;
        });
    }, [filteredIssues]);

    const handleRowClick = (group: GroupedRule) => {
        if (locked) {
            setShowPaywall(true);
            return;
        }
        // ✅ CHANGED: toggle inline expansion
        setExpandedRuleId(prev => (prev === group.ruleId ? null : group.ruleId));
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
                            <TableHead className="w-[40%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 pl-0">Diagnostic Rule</TableHead>
                            <TableHead className="w-[15%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4">Severity</TableHead>
                            <TableHead className="w-[15%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 text-right">Entities</TableHead>
                            <TableHead className="w-[20%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 text-right">Exposure</TableHead>
                            <TableHead className="w-[10%] text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 pr-0"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupedIssues.map(([ruleId, group]) => {
                            const currencyCount = Object.keys(group.exposureByCurrency).length;
                            const mixedCurrency = currencyCount > 1;
                            const isExpanded = expandedRuleId === ruleId;

                            return (
                                <React.Fragment key={ruleId}>
                                    <TableRow
                                        className={cn(
                                            "group cursor-pointer hover:bg-zinc-50/50 transition-colors border-b border-zinc-100",
                                            isExpanded && "bg-zinc-50/70 border-b-0"
                                        )}
                                        onClick={() => handleRowClick(group)}
                                        tabIndex={0}
                                        role="button"
                                        aria-expanded={isExpanded}
                                        aria-label={`View issue details for ${group.ruleName}`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleRowClick(group);
                                            }
                                        }}
                                    >
                                        <TableCell className="w-[40%] py-5 pl-0">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors">{group.ruleName}</span>
                                                <span className="text-[10px] font-mono font-medium text-zinc-400">{ruleId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[15%] py-5">
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
                                        <TableCell className="w-[15%] py-5 text-right font-mono text-xs font-semibold text-zinc-700">
                                            {group.totalEntities.toLocaleString()}
                                        </TableCell>
                                        <TableCell
                                            className="w-[20%] py-5 text-right font-mono text-xs font-semibold text-rose-600"
                                            title={mixedCurrency
                                                ? `Mixed currencies — showing ${group.currency} portion only`
                                                : undefined}
                                        >
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: group.currency || 'USD'
                                            }).format(group.totalExposure)}
                                            {mixedCurrency && (
                                                <span className="ml-1 text-[9px] text-zinc-400 font-normal">*</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="w-[10%] py-5 text-right pr-0">
                                            <div className="inline-flex items-center justify-center h-7 w-7 text-zinc-400 group-hover:text-zinc-900 transition-colors ml-auto">
                                                {isExpanded
                                                    ? <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                                    : <ChevronRight className="h-4 w-4" aria-hidden="true" />}
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* ✅ NEW: Inline IssueList expansion */}
                                    {isExpanded && !locked && (
                                        <TableRow className="hover:bg-transparent border-b border-zinc-100">
                                            <TableCell colSpan={5} className="p-0">
                                                <div className="px-2 py-6 bg-zinc-50/50 border-t border-zinc-100">
                                                    <IssueList
                                                        issues={group.allIssues}
                                                        showActions={false}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {showPaywall && locked && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-150"
                    onClick={() => setShowPaywall(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="paywall-title"
                >
                    <div
                        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top gradient banner with icon */}
                        <div className="relative px-6 pt-8 pb-6 text-center bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100">
                            <button
                                onClick={() => setShowPaywall(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                                aria-label="Close"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>




                            <p className="text-xs text-zinc-500 font-normal mt-2 max-w-xs mx-auto leading-relaxed">
                                See every affected record, exact exposure amounts, and open any entry directly in QuickBooks — all from one workspace.
                            </p>
                        </div>

                        {/* Feature list */}
                        <div className="px-6 py-5 space-y-3">
                            {[
                                { title: 'Individual entity findings', desc: 'Every duplicate, orphan, or anomaly listed with ID and amount' },
                                { title: 'Direct QuickBooks deep links', desc: 'One click from investigation to the actual QBO record' },
                                { title: 'Exact exposure amounts', desc: 'Per-entity and per-rule totals in your ledger currency' },
                                { title: 'Remediation workflows', desc: 'Resolve issues without leaving the dashboard' },
                            ].map((feature) => (
                                <div key={feature.title} className="flex items-start gap-3">
                                    <div className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                        <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-zinc-900 leading-tight">
                                            {feature.title}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="px-6 pb-6 pt-2 space-y-3">
                            {connectionId && (
                                <SubscriptionButton
                                    connectionId={connectionId}
                                    text="Upgrade Plan"
                                    className="w-full h-11 text-sm bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98]"
                                />
                            )}
                            <button
                                onClick={() => setShowPaywall(false)}
                                className="w-full text-[11px] text-zinc-400 hover:text-zinc-700 font-medium transition-colors py-1"
                            >
                                Maybe later
                            </button>
                            <p className="text-center text-[10px] text-zinc-400 pt-1">
                                Cancel anytime · No setup fees
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}