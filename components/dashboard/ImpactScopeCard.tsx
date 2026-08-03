'use client';

import React from 'react';
import { Users, TrendingDown, AlertTriangle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Metrics {
    isTeaser: boolean;
    totalEntities: number;
    totalExposure?: string | number | null;
}

interface Props {
    metrics: Metrics | null;
    isLoading: boolean;
    error?: Error | string | null;
}

function formatCurrency(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '$0.00';

    let numericValue: number;

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return '$0.00';

        numericValue = Number(trimmed);
        if (Number.isNaN(numericValue)) {
            return value;
        }
    } else {
        numericValue = value;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(numericValue);
}

export function ImpactScopeCard({ metrics, isLoading, error }: Props) {
    const isError = !!error && !isLoading;
    const hasNoData = !metrics && !isLoading && !isError;

    return (
        <article
            className={cn(
                "bg-white border rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]",
                isLoading && "animate-pulse select-none pointer-events-none",
                isError ? "border-red-200" : "border-slate-200"
            )}
            aria-busy={isLoading}
            aria-label="Impact scope and exposure summary"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-600">
                    {isError ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <Users className="h-4 w-4" />}
                    <h3 className="text-sm font-medium">Impact Scope</h3>
                </div>
                {metrics?.isTeaser && (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Preview
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex flex-col">
                    {isLoading ? (
                        <div className="h-8 w-16 bg-slate-100 rounded mb-1" />
                    ) : (
                        <span className={cn(
                            "text-3xl font-semibold tracking-tight",
                            isError ? "text-red-600" : "text-slate-900"
                        )}>
                            {isError || hasNoData ? '—' : (metrics?.totalEntities ?? 0)}
                        </span>
                    )}
                    <span className="text-xs text-slate-500">Affected Entities</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 mb-0.5">Estimated Exposure</span>
                        {isLoading ? (
                            <div className="h-5 w-24 bg-slate-100 rounded" />
                        ) : (
                            <span className={cn(
                                "text-sm font-semibold",
                                isError ? "text-red-600" : "text-slate-900"
                            )}>
                                {isError ? 'Unavailable' : hasNoData ? '—' : formatCurrency(metrics?.totalExposure)}
                            </span>
                        )}
                    </div>
                    {!isError && !hasNoData && !isLoading && (
                        <TrendingDown className="h-4 w-4 text-slate-400" />
                    )}
                </div>
            </div>
        </article>
    );
}