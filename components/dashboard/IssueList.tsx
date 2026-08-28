'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Issue } from '@/types/diagnostic';
import { AlertCircle, CheckCircle, ChevronRight, ShieldAlert, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { ParsedMarkdownResult, parseMarkdownFindings } from '@/lib/utils/dashboard-helpers';

interface IssueListProps {
    issues: Issue[];
    onResolve?: (issueId: string) => void;
    onViewDetails?: (issue: Issue) => void;
    showActions?: boolean;
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
                {issues.map((issue) => (
                    <div
                        key={issue.id}
                        className="py-6 first:pt-0 last:pb-0 group transition-colors"
                    >
                        <div className="flex items-start justify-between gap-6">
                            <div className="space-y-2 flex-1 min-w-0">
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

                                {(() => {
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
                                                                    <a
                                                                        key={urlIdx}
                                                                        href={url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded hover:bg-slate-800 transition"
                                                                    >
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
                                    // Fallback to raw message if parser returns nothing
                                    return (
                                        <p className="text-xs text-zinc-500 font-normal leading-relaxed max-w-2xl">
                                            {issue.message}
                                        </p>
                                    );
                                })()}

                                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 pt-1">
                                    <span>{issue.entityCount || (Array.isArray(issue.entities) ? issue.entities.length : 0)} affected record(s)</span>
                                    <span>•</span>
                                    <span>{format(new Date(issue.createdAt), 'MMM d, yyyy')}</span>
                                </div>

                                {/* Detailed Entities Display */}
                                {issue.entities && Array.isArray(issue.entities) && issue.entities.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2">
                                        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                                            Affected Records Breakdown
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {issue.entities.map((entity: any, idx: number) => (
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
                                            ))}
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
                ))}
            </div>
        </div>
    );
}