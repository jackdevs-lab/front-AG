'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Metrics {
    isTeaser: boolean;
    totalIssues: number;
    critical: number;
    warning: number;
}

interface Props {
    metrics: Metrics | null;
    isLoading: boolean;
    selectedConnectionId: string | null;
}

export function DetectedIssuesCard({ metrics, isLoading, selectedConnectionId }: Props) {
    const router = useRouter();

    return (
        <div
            className={cn(
                "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden",
                isLoading && "animate-pulse"
            )}
            aria-label={metrics?.isTeaser ? 'Detected issues — locked, subscribe to unlock' : 'Detected issues'}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">Detected Issues</span>
                </div>
                {metrics?.isTeaser && (
                    <span
                        className="text-[9px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1"
                        aria-label="Results locked — subscribe to unlock"
                    >
                        <Lock className="h-2.5 w-2.5" />
                        Locked
                    </span>
                )}
            </div>

            {metrics?.isTeaser ? (
                /* Locked state — no issue counts shown at all */
                <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
                    <div className="p-3 bg-slate-100 rounded-xl">
                        <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Subscription Required</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[160px] mx-auto">
                            Issue counts are hidden until you subscribe.
                        </p>
                    </div>
                    {selectedConnectionId && (
                        <button
                            onClick={() => router.push(`/billing?connectionId=${encodeURIComponent(selectedConnectionId)}`)}
                            className="text-[10px] font-black uppercase tracking-widest text-[hsl(199,89%,48%)] hover:text-[hsl(199,89%,38%)] transition-colors"
                            aria-label="Subscribe to unlock full issue findings"
                        >
                            Unlock Full Findings →
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Total count — only shown when subscribed */}
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-mono font-black text-slate-900 tracking-tighter tabular-nums">
                            {metrics?.totalIssues ?? 0}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Risks</span>
                    </div>

                    {/* Severity breakdown — only shown when subscribed */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-2.5">
                            <span className="text-[9px] font-black text-rose-600 uppercase tracking-tighter block mb-0.5">Critical</span>
                            <span className="text-sm font-mono font-black text-rose-700">{metrics?.critical ?? 0}</span>
                        </div>
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2.5">
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter block mb-0.5">Warning</span>
                            <span className="text-sm font-mono font-black text-amber-700">{metrics?.warning ?? 0}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
