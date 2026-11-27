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

// ✅ NEW: Aggregate shape for a rule — everything `AuditDrawer` needs
interface GroupedRule {
    ruleId: string;
    ruleName: string;
    severity: Severity;
    totalEntities: number;
    totalExposure: number;
    currency: string;
    /** Exposure bucketed by currency — avoids mixing USD + KES into one number */
    exposureByCurrency: Record<string, number>;
    /** Entities merged across all issues with this ruleId */
    mergedEntities: DiagnosticEntity[];
    /** entityIds fallback merged across all issues (for `generateEntityFindings`) */
    mergedEntityIds: string[];
    /** Longest/richest message across issues — used as drawer fallback text */
    representativeMessage: string;
    /** Highest-severity issue — used for severity badge */
    latestIssue: Issue;
}

export function IssuesTable({ issues = [], filterType, locked = false, connectionId }: IssuesTableProps) {
    return <UnlockedIssuesTable issues={issues} filterType={filterType} locked={locked} connectionId={connectionId} />;
}

function UnlockedIssuesTable({ issues, filterType, locked, connectionId }: { issues: Issue[]; filterType: string | null; locked?: boolean; connectionId?: string }) {
    // ✅ CHANGED: store the whole group, not just one issue
    const [selectedGroup, setSelectedGroup] = useState<GroupedRule | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);

    const filteredIssues = useMemo(() => {
        if (!filterType) return issues;
        return issues.filter(issue =>
            Array.isArray(issue.entities) &&
            issue.entities.some((e: DiagnosticEntity) => e.type === filterType)
        );
    }, [issues, filterType]);

    // ✅ UPDATED: merges entities/entityIds across the group, tracks exposure by currency
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
                };
            }

            const g = groups[issue.ruleId];

            // ✅ entityCount is always summed (works even when `entities` is missing)
            g.totalEntities += issue.entityCount ?? 0;

            // ✅ Bucket exposure per currency — never add USD + KES together
            const issueCurrency = issue.currency || g.currency || 'USD';
            const exposure = issue.exposureAmount || 0;
            if (exposure !== 0) {
                g.exposureByCurrency[issueCurrency] =
                    (g.exposureByCurrency[issueCurrency] || 0) + exposure;
            }

            // ✅ Merge entities across all issues in the group
            if (Array.isArray(issue.entities)) {
                g.mergedEntities.push(...issue.entities);
            }

            // ✅ Merge entityIds too (rule-registry's `generateEntityFindings`
            // supports this as a fallback when `entities` is empty)
            const issueEntityIds = (issue as any).entityIds;
            if (Array.isArray(issueEntityIds)) {
                g.mergedEntityIds.push(...issueEntityIds);
            }

            // ✅ Prefer the richest message — gives the drawer more to work with
            if ((issue.message?.length ?? 0) > (g.representativeMessage?.length ?? 0)) {
                g.representativeMessage = issue.message;
            }

            // ✅ Highest-severity issue wins for the badge
            const currentPriority = SEVERITY_PRIORITY[issue.severity] || 0;
            const groupPriority = SEVERITY_PRIORITY[g.severity] || 0;
            if (currentPriority > groupPriority) {
                g.severity = issue.severity;
                g.latestIssue = issue;
            }
        });

        // Finalize per group: derive primary currency + total exposure
        Object.values(groups).forEach(g => {
            const currencies = Object.keys(g.exposureByCurrency);
            if (currencies.length === 0) {
                g.totalExposure = 0;
                // keep existing `currency` (first issue's, or 'USD')
            } else if (currencies.length === 1) {
                g.currency = currencies[0];
                g.totalExposure = g.exposureByCurrency[g.currency];
            } else {
                // Mixed currencies within one rule group. Pick the largest bucket
                // as the displayed primary and preserve the full breakdown in
                // `exposureByCurrency` for callers that need exactness.
                // (Future: expose a breakdown in the UI — see Notes below.)
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

    // ✅ CHANGED: accept the whole group
    const handleRowClick = (group: GroupedRule) => {
        if (locked) {
            setShowPaywall(true);
        } else {
            setSelectedGroup(group);
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
                            <TableHead className="w-[40%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 pl-0">Diagnostic Rule</TableHead>
                            <TableHead className="w-[15%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4">Severity</TableHead>
                            <TableHead className="w-[15%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 text-right">Entities</TableHead>
                            <TableHead className="w-[20%] text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 text-right">Exposure</TableHead>
                            <TableHead className="w-[10%] text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400 py-4 pr-0"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupedIssues.map(([ruleId, group]) => {
                            // Surface mixed-currency situations to the tooltip
                            const currencyCount = Object.keys(group.exposureByCurrency).length;
                            const mixedCurrency = currencyCount > 1;

                            return (
                                <TableRow
                                    key={ruleId}
                                    className="group cursor-pointer hover:bg-zinc-50/50 transition-colors border-b border-zinc-100"
                                    onClick={() => handleRowClick(group)}
                                    tabIndex={0}
                                    role="button"
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
                                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {selectedGroup && !locked && (
                <AuditDrawer
                    isOpen={!!selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    ruleName={selectedGroup.ruleName}
                    category={selectedGroup.severity}
                    message={selectedGroup.representativeMessage}
                    ruleId={selectedGroup.ruleId}
                    entities={selectedGroup.mergedEntities}
                    entityCount={selectedGroup.totalEntities}
                    // ✅ NEW: rule-level aggregates now flow to the drawer
                    exposureAmount={selectedGroup.totalExposure}
                    currency={selectedGroup.currency}
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