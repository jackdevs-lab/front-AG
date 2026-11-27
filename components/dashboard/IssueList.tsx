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

/** Unified record shape — normalizes entities AND findings into one visual treatment */
interface DisplayRecord {
    key: string;
    id: string;
    type: string;
    amount?: number;
    date?: string;
    deepLink?: string;
    /** Legacy aggregated duplicate groups */
    legacyKey?: string;
    legacyCount?: number;
    legacyNames?: string[];
}

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

/**
 * Build a unified list of records for one issue.
 * Priority:
 *   1. `issue.entities` (backend sent them) → use directly
 *   2. `getRuleInsights(issue).findings` (structured, entityIds-derived) → convert
 *   3. `parseMarkdownFindings(issue.message)` (regex parser) → convert
 *   4. Nothing → empty list
 *
 * Result: one uniform shape; the renderer doesn't care where they came from.
 */
function buildDisplayRecords(issue: Issue): DisplayRecord[] {
    const entities: any[] = Array.isArray(issue.entities) ? issue.entities : [];

    if (entities.length > 0) {
        return entities.map((entity, idx) => {
            // Legacy aggregated shape: { type, key, count, names }
            const isLegacy = 'count' in entity || 'names' in entity || 'key' in entity;
            if (isLegacy) {
                return {
                    key: `legacy-${idx}`,
                    id: entity.key ?? `record-${idx}`,
                    type: entity.type ?? 'Record',
                    legacyKey: entity.key,
                    legacyCount: entity.count,
                    legacyNames: entity.names,
                };
            }
            // Modern shape: { id, type, amount, date, deepLink, url }
            return {
                key: `entity-${entity.id ?? idx}`,
                id: entity.id ?? `record-${idx}`,
                type: entity.type ?? 'Record',
                amount: typeof entity.amount === 'number' ? entity.amount : entity.exposureAmount,
                date: entity.date ?? entity.transactionDate,
                deepLink: entity.deepLink ?? entity.url,
            };
        });
    }

    // Fall back to structured insights
    const insights = getRuleInsights(issue);
    if (insights.isStructured && insights.findings.length > 0) {
        return insights.findings.map((f, idx) => ({
            key: `finding-${f.id ?? idx}`,
            id: f.id ?? `finding-${idx}`,
            type: f.type ?? 'Record',
            deepLink: f.urls?.[0],
        }));
    }

    // Fall back to markdown parser
    const parsed = parseMarkdownFindings(issue.message);
    if (parsed.findings.length > 0) {
        return parsed.findings.map((f, idx) => ({
            key: `parsed-${f.id ?? idx}`,
            id: f.id ?? `parsed-${idx}`,
            type: f.type ?? 'Record',
            deepLink: f.urls?.[0],
        }));
    }

    return [];
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
                    const records = buildDisplayRecords(issue);
                    const insights = getRuleInsights(issue);

                    return (
                        <div
                            key={issue.id}
                            className="py-6 first:pt-0 last:pb-0 group transition-colors"
                        >
                            <div className="flex items-start justify-between gap-6">
                                <div className="space-y-2 flex-1 min-w-0">
                                    {/* ─── Header ─── */}
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

                                    {/* ─── Summary (always shown if available) ─── */}
                                    {insights.isStructured && insights.summary && (
                                        <p className="text-xs text-zinc-600 mt-1 whitespace-pre-wrap">
                                            {insights.summary}
                                        </p>
                                    )}

                                    {/* ─── Metadata row ─── */}
                                    <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 pt-1">
                                        <span>
                                            {issue.entityCount || records.length} affected record(s)
                                        </span>
                                        {issue.createdAt && (
                                            <>
                                                <span>•</span>
                                                <span>{formatSafeDate(issue.createdAt)}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* ─── Unified records list — ONE card style, always ─── */}
                                    {records.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2">
                                            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                                                Affected Records Breakdown
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {records.map((record) => (
                                                    <div
                                                        key={record.key}
                                                        className="text-xs p-3 rounded-xl bg-zinc-50/60 border border-zinc-100 flex flex-col gap-1.5"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="font-medium text-zinc-800 truncate">
                                                                {record.legacyKey
                                                                    ? `${record.type}: ${record.legacyKey}`
                                                                    : `${record.type}: ${record.id}`}
                                                            </span>
                                                            {typeof record.legacyCount === 'number' && (
                                                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-200/60 text-zinc-700 shrink-0">
                                                                    {record.legacyCount} duplicates
                                                                </span>
                                                            )}
                                                            {typeof record.amount === 'number' && record.amount !== 0 && (
                                                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                                                                    {new Intl.NumberFormat('en-US', {
                                                                        style: 'currency',
                                                                        currency: issue.currency || 'USD',
                                                                    }).format(record.amount)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {record.legacyNames && record.legacyNames.length > 0 && (
                                                            <div className="text-[11px] text-zinc-500 italic">
                                                                {record.legacyNames.join(', ')}
                                                            </div>
                                                        )}
                                                        {record.date && record.date !== 'N/A' && (
                                                            <div className="text-[11px] text-zinc-500 font-mono">
                                                                {formatSafeDate(record.date, String(record.date))}
                                                            </div>
                                                        )}
                                                        {record.deepLink && record.deepLink !== '#' && (
                                                            <a
                                                                href={record.deepLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded hover:bg-slate-800 transition w-fit"
                                                            >
                                                                Open in QuickBooks
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── Recommendation (below records) ─── */}
                                    {insights.isStructured && insights.recommendation && (
                                        <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r">
                                            <p className="text-xs text-amber-800 font-medium">Recommended Action:</p>
                                            <p className="text-xs text-amber-700 mt-1">{insights.recommendation}</p>
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