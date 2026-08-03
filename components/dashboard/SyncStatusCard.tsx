'use client';

import React, { useEffect } from 'react';
import { Clock, ShieldCheck, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { format, isValid } from 'date-fns';

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
    onRunAudit: () => void;
    isOnCooldown: boolean;
    cooldownRemaining: number;
    isLocked: boolean;
}

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
    isLocked
}: Props) {
    const isButtonDisabled: boolean = isAuditing || isOnCooldown || isLocked;

    useEffect(() => {
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

    const rawDate = metrics?.lastSync ?? latestDiagnostics?.runAt;
    const formattedTime = safeFormatDate(rawDate, 'h:mm a', 'Never');
    const formattedDate = safeFormatDate(rawDate, 'MMM d, yyyy', 'No data available');

    return (
        <div
            className={cn(
                "bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[160px] flex flex-col justify-between",
                isLoading && "animate-pulse"
            )}
        >
            <div className="flex items-center gap-2 text-slate-600 mb-4">
                <Clock className="h-4 w-4" />
                <h3 className="text-sm font-medium">Sync Status</h3>
            </div>

            <div className="flex flex-col gap-1 mb-6">
                <span className="text-2xl font-semibold tracking-tight text-slate-900">
                    {isLocked ? "Subscription Required" : formattedTime}
                </span>
                <span className="text-xs text-slate-500">
                    {isLocked ? "Unlock features with an active subscription" : formattedDate}
                </span>
            </div>

            <Button
                onClick={() => {
                    if (!isButtonDisabled) {
                        onRunAudit();
                    }
                }}
                disabled={isButtonDisabled}
                className={cn(
                    "w-full h-10 rounded-lg text-sm font-medium transition-all shadow-none",
                    isLocked || isOnCooldown
                        ? "bg-slate-100 text-slate-500 hover:bg-slate-100 border border-slate-200"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
            >
                {isAuditing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Auditing...
                    </>
                ) : isLocked ? (
                    <>
                        <Lock className="mr-2 h-4 w-4" />
                        Locked
                    </>
                ) : isOnCooldown ? (
                    <>
                        <Clock className="mr-2 h-4 w-4" />
                        Wait {formatTime(cooldownRemaining)}
                    </>
                ) : (
                    <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Run Audit
                    </>
                )}
            </Button>
        </div>
    );
}