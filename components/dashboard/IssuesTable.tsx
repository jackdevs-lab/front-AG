'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Issue, Severity } from '@/types/diagnostic';
import { AuditDrawer } from '@/components/diagnostics/AuditDrawer';
import { SubscriptionButton } from '@/components/billing/SubscriptionButton';
import { api } from '@/lib/api/client';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { AlertCircle, ChevronRight, Info, ShieldAlert, FileSearch, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const SEVERITY_PRIORITY: Record<string, number> = {
    CRITICAL: 3, WARNING: 2, INFO: 1,
};

const RULES_STALE_MS = 5 * 60_000;      // 5 min — rule summary changes only on new run
const ISSUES_STALE_MS = 5 * 60_000;     // 5 min — drilldown never changes for a completed run

type RuleSummary = {
    ruleId: string;
    ruleName: string;
    severity: string;
    issueCount: number;
    entityCount: number;
};

interface UnlockedProps {
    runId: string | null;
    filterType: string | null;
}

interface LockedProps {
    locked: true;
    connectionId: string;
}

type Props = UnlockedProps | LockedProps;

/**
 * Never retry 429 (rate limit) or auth failures — retrying makes the
 * rate-limit death spiral worse. Retry other failures once.
 */
function shouldRetry(failureCount: number, error: any): boolean {
    const status = error?.response?.status ?? error?.status;
    if (status === 429 || status === 401 || status === 403) return false;
    return failureCount < 1;
}

/**
 * Tolerates response shapes from different `api` client configurations:
 *   - Raw Axios:      { data: { success, data: { rules } } }
 *   - Unwrapped once: { success, data: { rules } }
 *   - Unwrapped twice: { rules }
 */
function extractRules(response: any): RuleSummary[] {
    const body = response?.data ?? response;
    const payload = body?.data ?? body;
    return (payload?.rules ?? []) as RuleSummary[];
}

function extractIssuePage(response: any): { total: number; issues: any[] } {
    const body = response?.data ?? response;
    const payload = body?.data ?? body;
    return payload as { total: number; issues: any[] };
}

export function IssuesTable(props: Props) {
    if ((props as LockedProps).locked === true) {
        return <LockedIssuesOverlay connectionId={(props as LockedProps).connectionId} />;
    }
    const { runId, filterType } = props as UnlockedProps;
    return <UnlockedIssuesTable runId={runId} filterType={filterType} />;
}

function UnlockedIssuesTable({ runId }: { runId: string | null; filterType: string | null }) {
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['diagnostics', 'rules', runId],
        enabled: !!runId,
        queryFn: async () => {
            const res = await api.get(`/diagnostics/runs/${runId}/rules`);
            return extractRules(res);
        },
        staleTime: RULES_STALE_MS,
        retry: shouldRetry,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="py-24 text-center text-xs text-rose-600 font-medium">
                Failed to load rule findings.
                {error instanceof Error && (
                    <div className="text-[10px] text-zinc-400 mt-2 font-mono">
                        {error.message}
                    </div>
                )}
            </div>
        );
    }

    if (data.length === 0) {
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

    const rules = [...data].sort((a, b) =>
        (SEVERITY_PRIORITY[b.severity] ?? 0) - (SEVERITY_PRIORITY[a.severity] ?? 0)
    );

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
                        {rules.map((rule) => (
                            <TableRow
                                key={rule.ruleId}
                                className="group cursor-pointer hover:bg-zinc-50/50 transition-colors border-b border-zinc-100"
                                onClick={() => setSelectedRuleId(rule.ruleId)}
                                tabIndex={0}
                                role="button"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSelectedRuleId(rule.ruleId);
                                    }
                                }}
                            >
                                <TableCell className="w-[50%] py-5 pl-0">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors">{rule.ruleName}</span>
                                        <span className="text-[10px] font-mono font-medium text-zinc-400">
                                            {rule.ruleId} · {rule.issueCount.toLocaleString()} {rule.issueCount === 1 ? 'finding' : 'findings'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="w-[20%] py-5">
                                    <div className="flex items-center gap-2">
                                        {rule.severity === 'CRITICAL'
                                            ? <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                                            : rule.severity === 'WARNING'
                                                ? <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                                : <Info className="h-3.5 w-3.5 text-blue-500" />}
                                        <span className={cn(
                                            "text-[11px] font-medium tracking-wide",
                                            rule.severity === 'CRITICAL' ? "text-rose-600" :
                                                rule.severity === 'WARNING' ? "text-amber-600" : "text-blue-600"
                                        )}>
                                            {rule.severity}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="w-[20%] py-5 text-right font-mono text-xs font-semibold text-zinc-700">
                                    {rule.entityCount.toLocaleString()}
                                </TableCell>
                                <TableCell className="w-[10%] py-5 text-right pr-0">
                                    <div className="inline-flex items-center justify-center h-7 w-7 text-zinc-400 group-hover:text-zinc-900 transition-colors ml-auto">
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {selectedRuleId && (
                <RuleDrillDown
                    runId={runId!}
                    ruleId={selectedRuleId}
                    onClose={() => setSelectedRuleId(null)}
                />
            )}
        </div>
    );
}

function RuleDrillDown({ runId, ruleId, onClose }: { runId: string; ruleId: string; onClose: () => void }) {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['diagnostics', 'rule-issues', runId, ruleId],
        queryFn: async () => {
            const res = await api.get(`/diagnostics/runs/${runId}/issues`, {
                params: { ruleId, limit: 100 },
            });
            return extractIssuePage(res);
        },
        staleTime: ISSUES_STALE_MS,
        retry: shouldRetry,
    });

    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

    return (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
            <div
                className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold">{ruleId}</h3>
                        <p className="text-xs text-zinc-500">
                            {isLoading ? 'Loading…'
                                : isError ? `Error: ${(error as Error)?.message ?? 'unknown'}`
                                    : `${data?.total ?? 0} findings`}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 text-sm">Close</button>
                </div>
                <div className="p-6 space-y-2">
                    {data?.issues?.map((issue: any) => (
                        <div
                            key={issue.id}
                            className="p-3 border border-zinc-100 rounded-lg hover:bg-zinc-50"
                        >
                            <p className="text-xs font-medium text-zinc-900">{issue.message}</p>

                            {issue.entityIds?.length > 0 && (
                                <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                                    {issue.entityIds.join(', ')}
                                </p>
                            )}

                            <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-zinc-400 font-mono">
                                    {issue.severity}
                                </span>
                                {issue.deepLink && (
                                    <a
                                        href={issue.deepLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded hover:bg-slate-800 transition"
                                    >
                                        Open in QuickBooks
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
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
        </div>
    );
}

function LockedIssuesOverlay({ connectionId }: { connectionId: string }) {
    return (
        <div className="relative bg-transparent overflow-hidden py-4" role="region">
            <div className="select-none pointer-events-none opacity-40 filter blur-[4px]">
                <Table>
                    <TableHeader className="border-b border-zinc-200">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[50%] py-4 pl-0" />
                            <TableHead className="w-[20%] py-4" />
                            <TableHead className="w-[20%] py-4" />
                            <TableHead className="w-[10%] py-4" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[0, 1, 2, 3].map((i) => (
                            <TableRow key={i} className="border-b border-zinc-100/80">
                                <TableCell className="py-6 pl-0"><div className="h-4 w-56 rounded bg-zinc-200 animate-pulse" /></TableCell>
                                <TableCell><div className="h-4 w-20 rounded bg-zinc-200 animate-pulse" /></TableCell>
                                <TableCell className="text-right"><div className="h-4 w-8 rounded bg-zinc-200 animate-pulse ml-auto" /></TableCell>
                                <TableCell className="text-right pr-0"><div className="h-4 w-4 rounded bg-zinc-200 animate-pulse ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="absolute inset-0 backdrop-blur-[2px] bg-white/60 flex flex-col items-center justify-center gap-5 z-10 px-4">
                <div className="p-3 bg-zinc-900 text-white rounded-2xl shadow-xl">
                    <Lock className="h-6 w-6" />
                </div>
                <div className="space-y-1 max-w-md text-center">
                    <p className="text-base font-semibold text-zinc-900 tracking-tight">Executive Findings Restricted</p>
                    <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                        Upgrade your monitoring tier to uncover specific audit rules, view impacted entity records, and access remediation workflows.
                    </p>
                </div>
                <div className="flex flex-col items-center gap-2.5 w-full max-w-xs pt-1">
                    <SubscriptionButton connectionId={connectionId} text="Unlock Executive Report" className="w-full h-10 text-xs bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl" />
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Secured corporate billing via Paystack</span>
                    </div>
                </div>
            </div>
        </div>
    );
}