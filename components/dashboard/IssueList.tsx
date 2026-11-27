'use client';

import { Button } from '@/components/ui/button';
import { Issue } from '@/types/diagnostic';
import { AlertCircle, CheckCircle, ChevronRight, ShieldAlert, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { parseMarkdownFindings } from '@/lib/utils/dashboard-helpers';
import { getRuleInsights } from '@/lib/rules/rule-registry';

interface IssueListProps {
    issues: Issue[];
    onResolve?: (issueId: string) => void;
    onViewDetails?: (issue: Issue) => void;
    showActions?: boolean;
}

/**
 * Defensive date formatter. Handles ISO strings, Date objects, null, undefined,
 * garbage. Never throws. Returns `fallback` when the value can't be parsed.
 */
function formatSafeDate(value: unknown, fallback = '—'): string {
    if (!value) return fallback;
    try {
        const d = value instanceof Date ? value : new Date(String(value));
        if (Number.isNaN(d.getTime())) return fallback;
        return format(d, 'MMM d, yyyy');
    } catch {
        return fallback;
    }
}

export function IssueList({
    issues,
    onResolve,
    onViewDetails,
    showActions = true
}: IssueListProps) {
    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />;
            case 'WARNING':
                return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
            default:
                return <Info className="h-3.5 w-3.5 text-blue-500" />;
        }
    };

    if (issues.length === 0) {
        return (
            <div className="py-24 text-center space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">Company Health Optimized</h3>
                    <p className="text-xs text-zinc-500 font-normal max-w-xs mx-auto leading-relaxed">
                        All financial hygiene checks are currently passing cleanly.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-transparent space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Detected Exceptions ({issues.length})
                </h3>
            </div>

            <div className="divide-y divide-zinc-100">
                {issues.map((issue) => {
                    // ✅ Only treat entities as "rich" when the backend actually sent a non-empty array
                    const hasRichEntities =
                        Array.isArray(issue.entities) && issue.entities.length > 0;

                    return (
                        <div
                            key={issue.id}
                            className="py-6 first:pt-0 last:pb-0 group transition-colors"
                        >
                            <div className="flex items-start justify-between gap-6">
                                <div className="space-y-2 flex-1 min-w-0">
                                    {/* ─────────── Header ─────────── */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            {getSeverityIcon(issue.severity)}
                                            <span className={cn(
                                                "text-[11px] font-medium tracking-wide uppercase",
                                                issue.severity === 'CRITICAL' ? "text-rose-600" :
                                                    issue.severity === 'WARNING' ? "text-amber-600" : "text-blue-600"
                                            )}>
                                                {issue.severity}
                                            </span>
                                        </div>
                                        <span className="text-zinc-300">•</span>
                                        <h4 className="text-xs font-semibold text-zinc-900 tracking-tight">
                                            {issue.ruleName}
                                        </h4>
                                    </div>

                                    {/* ─────────── Body: summary + findings + recommendation ─────────── */}
                                    {(() => {
                                        const insights = getRuleInsights(issue);

                                        // Path 1: structured insights
                                        if (insights.isStructured) {
                                            return (
                                                <div className="space-y-3">
                                                    <p className="text-xs text-zinc-600 mt-1 whitespace-pre-wrap">
                                                        {insights.summary}
                                                    </p>

                                                    {/* Findings — HIDDEN when rich entities are present (avoid duplication) */}
                                                    {!hasRichEntities && insights.findings.length > 0 && (
                                                        <div className="space-y-2">
                                                            {insights.findings.map((finding, idx) => (
                                                                <div key={idx} className="p-3 bg-zinc-50/60 border border-zinc-100 rounded-xl">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div>
                                                                            <h5 className="text-xs font-bold text-zinc-800">{finding.type}</h5>
                                                                            <p className="text-xs text-zinc-600 mt-1 whitespace-pre-wrap">{finding.description}</p>
                                                                        </div>
                                                                    </div>
                                                                    {finding.urls.length > 0 && (
                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                            {finding.urls.map((url, urlIdx) => (
                                                                                <a key={urlIdx} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded hover:bg-slate-800 transition">
                                                                                    Open in QuickBooks
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {insights.recommendation && (
                                                        <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r">
                                                            <p className="text-xs text-amber-800 font-medium">Recommended Action:</p>
                                                            <p className="text-xs text-amber-700 mt-1">{insights.recommendation}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        // Path 2: parsed fallback — HIDDEN when rich entities are present
                                        if (!hasRichEntities) {
                                            const parsed = parseMarkdownFindings(issue.message);
                                            if (parsed.findings.length > 0) {
                                                return (
                                                    <div className="space-y-3">
                                                        {parsed.findings.map((finding, idx) => (
                                                            <div key={idx} className="p-3 bg-zinc-50/60 border border-zinc-100 rounded-xl">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div>
                                                                        <h5 className="text-xs font-bold text-zinc-800">{finding.type}</h5>
                                                                        <p className="text-xs text-zinc-600 mt-1 whitespace-pre-wrap">{finding.description}</p>
                                                                    </div>
                                                                </div>
                                                                {finding.urls.length > 0 && (
                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                        {finding.urls.map((url, urlIdx) => (
                                                                            <a key={urlIdx} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded hover:bg-slate-800 transition">
                                                                                Open in QuickBooks {finding.urls.length > 1 ? `(${urlIdx + 1})` : ''}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }

                                            // Path 3: raw message fallback
                                            return (
                                                <p className="text-xs text-zinc-500 font-normal leading-relaxed max-w-2xl whitespace-pre-wrap">
                                                    {issue.message}
                                                </p>
                                            );
                                        }

                                        // Rich entities present → no text fallback needed; entity section handles it
                                        return null;
                                    })()}

                                    {/* ─────────── Metadata row ─────────── */}
                                    <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 pt-1">
                                        <span>
                                            {issue.entityCount || (Array.isArray(issue.entities) ? issue.entities.length : 0)} affected record(s)
                                        </span>
                                        {/* ✅ createdAt only renders when present — no crash, no "—" */}
                                        {issue.createdAt && (
                                            <>
                                                <span>•</span>
                                                <span>{formatSafeDate(issue.createdAt)}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* ─────────── Entity breakdown — only if backend sent entities ─────────── */}
                                    {hasRichEntities && (
                                        <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2">
                                            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                                                Affected Records Breakdown
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {issue.entities!.map((entity: any, idx: number) => {
                                                    // Legacy aggregated shape: { type, key, count, names }
                                                    const isAggregated =
                                                        'count' in entity ||
                                                        'names' in entity ||
                                                        'key' in entity;

                                                    if (isAggregated) {
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="text-xs p-3 rounded-xl bg-zinc-50/60 border border-zinc-100 flex flex-col gap-1.5"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium text-zinc-800">
                                                                        {entity.type}: {entity.key}
                                                                    </span>
                                                                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 text-zinc-700">
                                                                        {entity.count} duplicates
                                                                    </span>
                                                                </div>
                                                                {entity.names && (
                                                                    <div className="text-[11px] text-zinc-500 italic">
                                                                        {entity.names.join(', ')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    // Modern shape: { id, type, amount, date, deepLink, url }
                                                    const amount = entity.amount ?? entity.exposureAmount;
                                                    const date = entity.date ?? entity.transactionDate;
                                                    const link = entity.deepLink ?? entity.url;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="text-xs p-3 rounded-xl bg-zinc-50/60 border border-zinc-100 flex flex-col gap-1.5"
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-medium text-zinc-800 truncate">
                                                                    {entity.type || 'Record'}: {entity.id}
                                                                </span>
                                                                {typeof amount === 'number' && amount !== 0 && (
                                                                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                                                                        {new Intl.NumberFormat('en-US', {
                                                                            style: 'currency',
                                                                            currency: issue.currency || 'USD',
                                                                        }).format(amount)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {date && date !== 'N/A' && (
                                                                <div className="text-[11px] text-zinc-500 font-mono">
                                                                    {formatSafeDate(date, String(date))}
                                                                </div>
                                                            )}
                                                            {link && link !== '#' && (
                                                                <a
                                                                    href={link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded hover:bg-slate-800 transition w-fit"
                                                                >
                                                                    Open in QuickBooks
                                                                </a>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {showActions && (
                                    <div className="flex items-center gap-2 shrink-0 pt-1">
                                        {onResolve && !issue.isResolved && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onResolve(issue.id)}
                                                className="h-8 text-xs font-medium border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-xl"
                                            >
                                                Resolve
                                            </Button>
                                        )}
                                        {onViewDetails && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onViewDetails(issue)}
                                                className="h-8 w-8 text-zinc-400 hover:text-zinc-900 rounded-xl transition-colors"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}