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
            return 'Subscription required to view findings';
        }

        const displayCount = Array.isArray(visibleIssues) ? visibleIssues.length : 0;
        return `${displayCount} issues detected across all rules`;
    }, [isLocked, visibleIssues]);

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
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase leading-none">
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
                <div className="flex items-center justify-between px-1">
                    <h2
                        id="audit-findings-title"
                        className="text-xs font-black tracking-widest text-slate-400 uppercase leading-none"
                    >
                        Diagnostic Audit Findings
                    </h2>
                    <span className="text-xs font-bold text-slate-400" aria-live="polite">
                        {issueCountText}
                    </span>
                </div>

                <ErrorBoundary fallback={
                    <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
                        Failed to load diagnostic findings. Please try again.
                    </div>
                }>
                    {isLoading && !latestDiagnostics ? (
                        <div
                            className="space-y-3"
                            aria-busy="true"
                            aria-label="Loading diagnostic results"
                        >
                            {SKELETON_ITEMS.map((key) => (
                                <div
                                    key={key}
                                    className="h-16 w-full bg-white border border-slate-100 rounded-2xl animate-pulse"
                                />
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
                    <div className="text-center py-8 text-slate-500">
                        No diagnostic issues found in your data.
                    </div>
                )}
            </div>
        </section>
    );
}