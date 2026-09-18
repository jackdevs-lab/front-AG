'use client';

import { useMemo, useEffect } from 'react';
import { IssuesTable } from '@/components/dashboard/IssuesTable';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { DiagnosticRunResult } from '@/types/diagnostic';

interface DiagnosticFindingsSectionProps {
    isLocked: boolean;
    isLoading: boolean;
    latestDiagnostics: DiagnosticRunResult | null;
    selectedConnectionId: string | null;
}

const SKELETON_ITEMS = Array.from({ length: 5 }, (_, i) => `skeleton-${i}`);

export function DiagnosticFindingsSection({
    isLocked,
    isLoading,
    latestDiagnostics,
    selectedConnectionId,
}: DiagnosticFindingsSectionProps) {
    const issueCountText = useMemo(() => {
        const diagAny = latestDiagnostics as any;

        if (isLocked) {
            const metaTotal =
                (diagAny?.criticalCount ?? 0) +
                (diagAny?.warningCount ?? 0) +
                (diagAny?.infoCount ?? 0) ||
                (diagAny?.issueCount ?? 0);

            if (metaTotal > 0) return `${metaTotal.toLocaleString()} anomalies detected across rules`;
            return 'Subscription required to view findings';
        }

        const total = diagAny?.issueCount ?? diagAny?.totalIssues ?? 0;
        return `${total.toLocaleString()} anomalies detected across rules`;
    }, [isLocked, latestDiagnostics]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            if (typeof isLocked !== 'boolean') {
                console.error('DiagnosticFindingsSection: isLocked must be a boolean');
            }
            if (typeof isLoading !== 'boolean') {
                console.error('DiagnosticFindingsSection: isLoading must be a boolean');
            }
        }
    }, [isLocked, isLoading]);

    const runId =
        latestDiagnostics && 'id' in latestDiagnostics
            ? (latestDiagnostics.id as string)
            : null;
    return (
        <section className="space-y-8" aria-labelledby="audit-findings-title">
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <h2
                        id="audit-findings-title"
                        className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
                    >
                        Diagnostic Audit Ledger
                    </h2>
                    <span className="text-xs font-mono font-medium text-zinc-400" aria-live="polite">
                        {issueCountText}
                    </span>
                </div>

                <ErrorBoundary
                    fallback={
                        <div className="p-4 text-center text-rose-600 bg-rose-50/50 rounded-xl text-xs font-medium border border-rose-100">
                            Failed to load diagnostic findings. Please try again.
                        </div>
                    }
                >
                    {isLoading && !latestDiagnostics ? (
                        <div
                            className="space-y-3 py-2"
                            aria-busy="true"
                            aria-label="Loading diagnostic results"
                        >
                            {SKELETON_ITEMS.map((key) => (
                                <div
                                    key={key}
                                    className="h-16 w-full bg-transparent border-b border-zinc-100 animate-pulse flex items-center justify-between px-2"
                                >
                                    <div className="space-y-2">
                                        <div className="h-3 w-48 bg-zinc-200 rounded" />
                                        <div className="h-2.5 w-24 bg-zinc-100 rounded" />
                                    </div>
                                    <div className="h-3 w-16 bg-zinc-200 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : isLocked ? (
                        <IssuesTable
                            locked={true}
                            connectionId={selectedConnectionId || ''}
                        />
                    ) : runId ? (
                        <IssuesTable runId={runId} filterType={null} />
                    ) : (
                        <div className="py-24 text-center space-y-1">
                            <p className="text-sm font-semibold text-zinc-900">No diagnostic run yet</p>
                            <p className="text-xs text-zinc-500 font-normal">
                                Run an audit to populate findings.
                            </p>
                        </div>
                    )}
                </ErrorBoundary>
            </div>
        </section>
    );
}