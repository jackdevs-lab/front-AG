// apps/web/components/dashboard/SyncStatusCard.tsx
'use client';
import React, { useEffect } from 'react';
import { Clock, ShieldCheck, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { format, isValid } from 'date-fns';

// Define types for props
interface Metrics {
    lastSync?: Date | string | null;
}

interface LatestDiagnostics {
    runAt?: string | Date | null;
}

interface Props {
    metrics: Metrics | null;
    latestDiagnostics: LatestDiagnostics | null;
    isLoading: boolean;
    isAuditing: boolean;
    onRunAudit: () => void; // Function to trigger the audit
    isOnCooldown: boolean;
    cooldownRemaining: number;
    isLocked: boolean; // NEW PROP: Passed from parent based on subscription status
}

// Safe formatting helper to prevent UI crashes
function safeFormatDate(dateValue: any, formatPattern: string, fallback: string) {
    if (!dateValue) return fallback;
    const parsedDate = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (!isValid(parsedDate)) return fallback;
    return format(parsedDate, formatPattern);
}

export function SyncStatusCard({
    metrics,
    latestDiagnostics,
    isLoading,
    isAuditing,
    onRunAudit,
    isOnCooldown,
    cooldownRemaining,
    isLocked // Receive the isLocked prop
}: Props) {
    const isButtonDisabled: boolean = isAuditing || isOnCooldown || isLocked;

    useEffect(() => {
        console.log(' [SyncStatusCard] isAuditing changed to:', isAuditing);
        if (!isAuditing) {
            console.warn(' [SyncStatusCard] Parent turned off isAuditing! Check the parent component.');
        }
    }, [isAuditing]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Determine raw date target safely
    const rawDate = metrics?.lastSync ?? latestDiagnostics?.runAt;
    const formattedTime = safeFormatDate(rawDate, 'h:mm a', 'Never');
    const formattedDate = safeFormatDate(rawDate, 'MMM d, yyyy', 'No data available');

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
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">
                        Sync Status
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                    {isLocked ? "Subscription Required" : formattedTime}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isLocked ? "Unlock full features with an active subscription" : formattedDate}
                </span>
            </div>

            <div className="pt-2 flex items-center gap-2">
                <Button
                    onClick={() => {
                        console.log(' [SyncStatusCard] Run Audit button clicked!');
                        if (!isButtonDisabled) {
                            onRunAudit();
                        }
                    }}
                    disabled={isButtonDisabled}
                    className={cn(
                        "w-full h-10 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                        isLocked
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                            : isOnCooldown
                                // Changed cooldown button style to look clean and standard instead of loud yellow
                                ? "bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed"
                                : "bg-[hsl(199,89%,48%)] hover:bg-[hsl(199,89%,58%)] text-white shadow-blue-100"
                    )}
                >
                    {isAuditing ? (
                        <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Auditing...
                        </>
                    ) : isLocked ? (
                        <>
                            <Lock className="mr-2 h-3.5 w-3.5" />
                            Subscription Required
                        </>
                    ) : isOnCooldown ? (
                        <>
                            <Clock className="mr-2 h-3.5 w-3.5" />
                            Wait {formatTime(cooldownRemaining)}
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                            Run Audit
                        </>
                    )}
                </Button>
                {/* The absolute yellow overlay div has been completely removed */}
            </div>
        </div>
    );
}