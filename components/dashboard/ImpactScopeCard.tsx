import React from 'react';
import { Users, TrendingDown, AlertTriangle } from 'lucide-react';
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
                "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden transition-all duration-200",
                isLoading && "animate-pulse select-none pointer-events-none",
                isError && "border-amber-200 bg-amber-50/10"
            )}
            aria-busy={isLoading}
            aria-live={isError ? "assertive" : "polite"}
            aria-label="Impact scope and exposure summary"
        >
            {/* Header section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "p-1.5 rounded-lg border",
                            isError ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-slate-50 border-slate-100 text-slate-500"
                        )}
                        aria-hidden="true"
                    >
                        {isError ? <AlertTriangle className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                    </div>
                    <span className={cn(
                        "text-xs font-black uppercase tracking-widest leading-none",
                        isError ? "text-amber-700" : "text-slate-500"
                    )}>
                        Impact Scope
                    </span>
                </div>

            {/* No teaser badge — locked users see no data at all */}

                {isError && (
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wider">
                        Disrupted
                    </span>
                )}
            </div>

            {/* Entity Count — hidden in locked state */}
            <div className="flex items-baseline gap-1.5">
                {isLoading ? (
                    <div className="h-10 w-24 bg-slate-200 rounded-lg my-0.5" />
                ) : metrics?.isTeaser ? (
                    <span className="text-4xl font-mono font-black text-slate-200 tracking-tighter">—</span>
                ) : (
                    <span className={cn(
                        "text-4xl font-mono font-black tracking-tighter tabular-nums",
                        isError ? "text-amber-600" : "text-slate-900"
                    )}>
                        {isError || hasNoData ? '—' : (metrics?.totalEntities ?? 0)}
                    </span>
                )}
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Affected Entities
                </span>
            </div>

            {/* Financial Exposure — hidden in locked state */}
            <div className="pt-2">
                {metrics?.isTeaser ? (
                    <div className="border border-slate-100 rounded-xl p-3 text-center space-y-0.5 bg-slate-50/50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subscription Required</p>
                        <p className="text-[10px] text-slate-400 font-medium">Exposure data is locked</p>
                    </div>
                ) : (
                <div className={cn(
                    "border rounded-xl p-3 flex items-center justify-between transition-colors",
                    isError ? "bg-amber-50/30 border-amber-100/70" : "bg-rose-50/50 border-rose-100"
                )}>
                    <div className="flex flex-col gap-1">
                        <span className={cn(
                            "text-xs font-bold uppercase tracking-wider",
                            isError ? "text-amber-600" : "text-rose-600"
                        )}>
                            Estimated Exposure
                        </span>
                        {isLoading ? (
                            <div className="h-6 w-32 bg-rose-200/60 rounded-md my-0.5" />
                        ) : (
                            <span className={cn(
                                "text-lg font-mono font-black leading-none",
                                isError ? "text-amber-600/80" : "text-rose-700"
                            )}>
                                {isError ? 'Unavailable' : hasNoData ? '—' : formatCurrency(metrics?.totalExposure)}
                            </span>
                        )}
                    </div>
                    <div
                        className={cn(
                            "p-1.5 rounded-lg text-rose-500",
                            isError ? "bg-amber-100/40 text-amber-500" : "bg-rose-100/50 text-rose-500"
                        )}
                        aria-hidden="true"
                    >
                        <TrendingDown className="h-5 w-5" />
                    </div>
                </div>
                )}
            </div>
        </article>
    );
}