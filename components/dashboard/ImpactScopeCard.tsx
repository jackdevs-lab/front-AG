'use client';

import React from 'react';
import { Users, TrendingDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Metrics {
    isTeaser: boolean;
    totalEntities: number;
    totalExposure?: string | number | null;
    currency?: string;
    // ✅ NEW: exposed by the updated `useDiagnosticMetrics`
    exposureByCurrency?: Record<string, number>;
}

interface Props {
    metrics: Metrics | null;
    isLoading: boolean;
    error?: Error | string | null;
}

/**
 * Format a currency value.
 *
 * - Already-formatted strings (e.g. "$1,234.56", "KES 1,234.56") are returned as-is.
 * - Numeric values are formatted with the supplied ISO-4217 currency code.
 * - If the code is empty/invalid, we render a plain decimal number — no
 *   fabricated "USD" symbol — so the UI never lies about currency.
 * - `undefined` keeps the historical USD default (backward compatibility for
 *   call sites that haven't been migrated yet).
 */
function formatCurrency(
    value: string | number | null | undefined,
    currency?: string
): string {
    if (value === null || value === undefined) return '—';

    // Already-formatted string — return verbatim
    if (typeof value === 'string' && /[^\d.,\s-]/.test(value)) {
        return value;
    }

    const numericValue = typeof value === 'string'
        ? Number(value.replace(/[^0-9.-]/g, ''))
        : value;

    if (Number.isNaN(numericValue)) return '—';

    // `undefined` → legacy USD default.  Explicit '' → "currency unknown".
    const fallbackCode = currency === undefined ? 'USD' : currency;
    const code = (fallbackCode ?? '').trim().toUpperCase();
    const isIso = /^[A-Z]{3}$/.test(code);

    if (!isIso) {
        // Unknown currency — show plain decimal, no symbol
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericValue);
    }

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 2,
        }).format(numericValue);
    } catch {
        // Defensive fallback — Intl rejected the code we thought was valid
        return `${code} ${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericValue)}`;
    }
}

export function ImpactScopeCard({ metrics, isLoading, error }: Props) {
    const isError = !!error && !isLoading;
    const hasNoData = !metrics && !isLoading && !isError;

    // ✅ NEW: surface mixed-currency situations instead of silently showing
    //         only the largest bucket as if it were the whole total.
    const nonZeroBuckets = metrics?.exposureByCurrency
        ? Object.keys(metrics.exposureByCurrency).filter(
            (k) => metrics.exposureByCurrency![k] !== 0
        )
        : [];
    const isMixedCurrency = nonZeroBuckets.length > 1;

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
                    {isError
                        ? <AlertTriangle className="h-4 w-4 text-red-500" />
                        : <Users className="h-4 w-4" />}
                    <h3 className="text-sm font-medium">Impact Scope</h3>
                </div>
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
                            {isError || hasNoData ? '—' : (metrics?.totalEntities ?? 0).toLocaleString()}
                        </span>
                    )}
                    <span className="text-xs text-slate-500">Affected Entities</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 mb-0.5">
                            Estimated Exposure
                            {isMixedCurrency && !isLoading && !isError && !hasNoData && (
                                <span
                                    className="ml-1 text-slate-400"
                                    title="Mixed currencies — value shown is the largest bucket only. Per-currency breakdown available in the ledger."
                                >
                                    (partial)
                                </span>
                            )}
                        </span>
                        {isLoading ? (
                            <div className="h-5 w-24 bg-slate-100 rounded" />
                        ) : (
                            <span className={cn(
                                "text-sm font-semibold",
                                isError ? "text-red-600" : "text-slate-900"
                            )}>
                                {isError
                                    ? 'Unavailable'
                                    : hasNoData
                                        ? '—'
                                        : formatCurrency(metrics?.totalExposure, metrics?.currency)}
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