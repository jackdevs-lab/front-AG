'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';
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
                "bg-white border border-zinc-200 rounded-2xl p-6 min-h-[160px] flex flex-col justify-between",
                isLoading && "animate-pulse"
            )}
            aria-label="Detected issues"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-500">
                    <ShieldAlert className="h-4 w-4" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider">Detected Issues</h3>
                </div>
                {metrics?.isTeaser && (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-100">
                        <Lock className="h-3 w-3" />
                        Preview
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex flex-col">
                    <span className="text-3xl font-semibold tracking-tight text-zinc-900 font-mono">
                        {metrics?.totalIssues ?? 0}
                    </span>
                    <span className="text-xs text-zinc-400 font-normal">Active Risks</span>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-zinc-100">
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-400 mb-0.5 flex items-center gap-1.5 font-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Critical
                        </span>
                        <span className="text-sm font-semibold text-zinc-900 font-mono">{metrics?.critical ?? 0}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-400 mb-0.5 flex items-center gap-1.5 font-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Warning
                        </span>
                        <span className="text-sm font-semibold text-zinc-900 font-mono">{metrics?.warning ?? 0}</span>
                    </div>
                </div>
            </div>

            {metrics?.isTeaser && selectedConnectionId && (
                <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Detailed findings locked</span>
                    <button
                        onClick={() => router.push(`/billing?connectionId=${encodeURIComponent(selectedConnectionId)}`)}
                        className="text-xs font-semibold text-zinc-900 hover:text-zinc-700 transition-colors flex items-center gap-1"
                    >
                        Unlock Full Findings <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            )}
        </div>
    );
}