'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { EntityFilterBar } from '@/components/dashboard/EntityFilterBar';
import { IssuesTable } from '@/components/dashboard/IssuesTable';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { DiagnosticRunResult, Issue } from '@/types/diagnostic';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface DiagnosticFindingsSectionProps {
    isLocked: boolean;
    isLoading: boolean;
    latestDiagnostics: DiagnosticRunResult | null;
    selectedConnectionId: string | null;
}

type FilterType = string | null;

const SKELETON_ITEMS = Array.from({ length: 5 }, (_, i) => `skeleton-${i}`);

export function DiagnosticFindingsSection({
    isLocked,
    isLoading,
    latestDiagnostics,
    selectedConnectionId,
}: DiagnosticFindingsSectionProps) {
    const [filterType, setFilterType] = useState<FilterType>(null);
    const debouncedFilterType = useDebounce(filterType, 300);

    const visibleIssues = useMemo<Issue[]>(() => {
        if (!isLocked && latestDiagnostics && !latestDiagnostics.locked) {
            return Array.isArray(latestDiagnostics.issues) ? latestDiagnostics.issues : [];
        }
        return [];
    }, [isLocked, latestDiagnostics]);

    const issueCountText = useMemo(() => {
        if (isLocked) {
            const diagAny = latestDiagnostics as any;
            const metaTotal = diagAny?.meta?.criticalCount !== undefined
                ? ((diagAny.meta.criticalCount || 0) + (diagAny.meta.warningCount || 0) + (diagAny.meta.infoCount || 0))
                : (diagAny?.issueCount || 0);

            if (metaTotal > 0) return `${metaTotal} anomalies detected across rules`;
            return 'Subscription required to view findings';
        }

        const displayCount = Array.isArray(visibleIssues) ? visibleIssues.length : 0;
        return `${displayCount} anomalies detected across rules`;
    }, [isLocked, visibleIssues, latestDiagnostics]);

    const handleTypeSelect = useCallback((type: FilterType) => {
        setFilterType(type);
    }, []);

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

    return (
        <section className="space-y-8" aria-labelledby="audit-findings-title">
            {/* Render filter bar only when unlocked and we have data */}
            {!isLocked && visibleIssues.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Filter by Entity Type
                        </h2>
                    </div>
                    <EntityFilterBar
                        issues={visibleIssues}
                        selectedType={filterType}
                        onTypeSelect={handleTypeSelect}
                    />
                </div>
            )}

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

                <ErrorBoundary fallback={
                    <div className="p-4 text-center text-rose-600 bg-rose-50/50 rounded-xl text-xs font-medium border border-rose-100">
                        Failed to load diagnostic findings. Please try again.
                    </div>
                }>
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
                            connectionId={selectedConnectionId || ""}
                            filterType={debouncedFilterType}
                        />
                    ) : (
                        <IssuesTable
                            issues={visibleIssues}
                            filterType={debouncedFilterType}
                        />
                    )}
                </ErrorBoundary>

                {/* Empty state handling */}
                {!isLoading && !isLocked && latestDiagnostics && visibleIssues.length === 0 && (
                    <div className="py-24 text-center space-y-1">
                        <p className="text-sm font-semibold text-zinc-900">No diagnostic issues found</p>
                        <p className="text-xs text-zinc-500 font-normal">All monitored financial parameters are clean.</p>
                    </div>
                )}
            </div>
        </section>
    );
}