'use client';

import React, { useEffect } from 'react';
import { Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';

interface Metrics {
    lastSync: Date;
}

interface LatestDiagnostics {
    runAt: string | Date;
}

interface Props {
    metrics: Metrics | null;
    latestDiagnostics: LatestDiagnostics | null;
    isLoading: boolean;
    isAuditing: boolean;
    onRunAudit: () => void;
    isOnCooldown: boolean;
    cooldownRemaining: number;
}

export function SyncStatusCard({
    metrics,
    latestDiagnostics,
    isLoading,
    isAuditing,
    onRunAudit,
    isOnCooldown,
    cooldownRemaining
}: Props) {
    // DEBUG: This will prove exactly when the parent component changes isAuditing
    useEffect(() => {
        console.log('🔄 [SyncStatusCard] isAuditing changed to:', isAuditing);
        if (!isAuditing) {
            console.warn('⚠️ [SyncStatusCard] Parent turned off isAuditing! Check the parent component.');
        }
    }, [isAuditing]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className={cn(
                "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden",
                isLoading && "animate-pulse"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">Sync Status</span>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                    {metrics
                        ? format(metrics.lastSync, 'h:mm a')
                        : (latestDiagnostics ? format(new Date(latestDiagnostics.runAt), 'h:mm a') : 'Never')
                    }
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {metrics
                        ? format(metrics.lastSync, 'MMM d, yyyy')
                        : (latestDiagnostics ? format(new Date(latestDiagnostics.runAt), 'MMM d, yyyy') : 'No data available')
                    }
                </span>
            </div>
            <div className="pt-2 flex items-center gap-2">
                <Button
                    onClick={() => {
                        console.log('👆 [SyncStatusCard] Run Audit button clicked!');
                        onRunAudit();
                    }}
                    disabled={isAuditing || isOnCooldown}
                    className={cn(
                        "w-full bg-[hsl(199,89%,48%)] hover:bg-[hsl(199,89%,58%)] text-white font-black rounded-xl h-10 text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-100",
                        isOnCooldown && "blur-sm opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                >
                    {isAuditing ? (
                        <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Auditing...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                            Run Audit
                        </>
                    )}
                </Button>
                {isOnCooldown && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-amber-50/60 border-2 border-amber-200/70 cursor-not-allowed transition-all duration-300">
                        <Clock className="h-3 w-3 text-amber-600 mr-1.5" />
                        <span className="text-[11px] font-black text-amber-700 tabular-nums">
                            {formatTime(cooldownRemaining)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}