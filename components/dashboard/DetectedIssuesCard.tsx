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
                "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between",
                isLoading && "animate-pulse"
            )}
            aria-label="Detected issues"
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
                        className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-100"
                        aria-label="Teaser Mode"
                    >
                        <Lock className="h-2.5 w-2.5" />
                        Preview Mode
                    </span>
                )}
            </div>

            {/* Total Count - Always Visible */}
            <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-mono font-black text-slate-900 tracking-tighter tabular-nums">
                    {metrics?.totalIssues ?? 0}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Risks</span>
            </div>

            {/* Severity Breakdown - Always Visible */}
            <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-2.5">
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-tighter block mb-0.5">Critical</span>
                    <span className="text-sm font-mono font-black text-rose-700">{metrics?.critical ?? 0}</span>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2.5">
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter block mb-0.5">Warning</span>
                    <span className="text-sm font-mono font-black text-amber-700">{metrics?.warning ?? 0}</span>
                </div>
            </div>

            {/* Teaser Upgrade CTA */}
            {metrics?.isTeaser && selectedConnectionId && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Detailed findings locked</span>
                    <button
                        onClick={() => router.push(`/billing?connectionId=${encodeURIComponent(selectedConnectionId)}`)}
                        className="text-[10px] font-black uppercase tracking-widest text-[hsl(199,89%,48%)] hover:text-[hsl(199,89%,38%)] transition-colors"
                    >
                        Unlock Full Findings →
                    </button>
                </div>
            )}
        </div>
    );
}