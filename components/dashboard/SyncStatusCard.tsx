'use client';

import React, { useEffect, useState } from 'react';
import { Clock, ShieldCheck, Loader2, Lock, CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { format, isValid } from 'date-fns';
import { useConnectionStatus } from '@/lib/hooks/useConnections';
import { useQueryClient } from '@tanstack/react-query';

interface Metrics {
    lastSync?: Date | string | null;
    [key: string]: any;
}

interface LatestDiagnostics {
    runAt?: string | Date | null;
}

type SyncStatus = 'IDLE' | 'SYNCING' | 'ERROR';

interface Props {
    connectionId: string;
    connectionUpdatedAt: string | Date | null;
    metrics: Metrics | null;
    latestDiagnostics: LatestDiagnostics | null;
    isLoading: boolean;
    onRunAudit: (id: string, options?: { onError?: (error: any) => void, onSuccess?: () => void }) => void;
    isLocked: boolean;
}

function safeFormatDate(dateValue: any, formatPattern: string, fallback: string) {
    if (!dateValue) return fallback;
    const parsedDate = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (!isValid(parsedDate)) return fallback;
    return format(parsedDate, formatPattern);
}

const COOLDOWN_MS = 60 * 1000; // 1 minute

export function SyncStatusCard({
    connectionId,
    connectionUpdatedAt,
    metrics,
    latestDiagnostics,
    isLoading,
    onRunAudit,
    isLocked
}: Props) {
    const queryClient = useQueryClient();

    const [isStarting, setIsStarting] = useState(false);
    const [isAuditRunning, setIsAuditRunning] = useState(false);
    const [triggerTime, setTriggerTime] = useState<number | null>(null);
    const [uiMessage, setUiMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'warning' | 'error' | 'success'>('warning');
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const { data: statusData } = useConnectionStatus(connectionId, isAuditRunning);
    const currentStatusFromHook: SyncStatus = statusData?.syncStatus || 'IDLE';

    useEffect(() => {
        if (!connectionUpdatedAt) {
            setCooldownRemaining(0);
            return;
        }
        const calculateRemaining = () => {
            const lastUpdate = new Date(connectionUpdatedAt).getTime();
            const elapsed = Date.now() - lastUpdate;
            const remaining = Math.max(0, COOLDOWN_MS - elapsed);
            setCooldownRemaining(remaining);
        };
        calculateRemaining();
        const interval = setInterval(calculateRemaining, 1000);
        return () => clearInterval(interval);
    }, [connectionUpdatedAt]);

    const isOnCooldown = cooldownRemaining > 0;
    const isDisabled = isStarting || isOnCooldown || isAuditRunning || isLocked;

    useEffect(() => {
        const lastUpdateStr = connectionUpdatedAt;
        const lastUpdate = lastUpdateStr ? new Date(lastUpdateStr).getTime() : 0;

        if (currentStatusFromHook === 'SYNCING') {
            setIsAuditRunning(true);
        } else if (isAuditRunning) {
            if (currentStatusFromHook === 'ERROR') {
                setIsAuditRunning(false);
                setTriggerTime(null);
                setUiMessage('Audit failed. Please check diagnostics or try again.');
                setMessageType('error');
            } else if (currentStatusFromHook === 'IDLE' && triggerTime && lastUpdate >= triggerTime) {
                setIsAuditRunning(false);
                setTriggerTime(null);
                setUiMessage('Audit completed successfully!');
                setMessageType('success');
            }
        }
    }, [currentStatusFromHook, isAuditRunning, connectionUpdatedAt, triggerTime]);

    const handleRunAudit = () => {
        if (isOnCooldown) {
            setUiMessage(`Please wait ${formatTime(cooldownRemaining)} before auditing again.`);
            setMessageType('warning');
            return;
        }
        if (isDisabled) return;

        setUiMessage(null);
        setIsStarting(true);

        onRunAudit(connectionId, {
            onError: (error: any) => {
                setIsStarting(false);
                setIsAuditRunning(false);
                setTriggerTime(null);
                if (error?.response?.status === 429) {
                    setUiMessage(error.response.data?.message || 'Server is cooling down. Please wait.');
                    setMessageType('warning');
                } else {
                    setUiMessage('Audit failed to start. Please try again later.');
                    setMessageType('error');
                }
            },
            onSuccess: () => {
                setIsStarting(false);
                setIsAuditRunning(true);
                setTriggerTime(Date.now());
                setUiMessage('Audit triggered! Monitoring...');
                setMessageType('warning');

                queryClient.invalidateQueries({ queryKey: ['diagnostics', 'latest', connectionId] });
                queryClient.invalidateQueries({ queryKey: ['diagnostics', 'history', connectionId] });
            }
        });
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const rawDate = metrics?.lastSync ?? latestDiagnostics?.runAt;
    const formattedTime = safeFormatDate(rawDate, 'h:mm a', 'Never');
    const formattedDate = safeFormatDate(rawDate, 'MMM d, yyyy', 'No data available');

    const showSpinner = isStarting || isAuditRunning;
    const buttonText = isOnCooldown
        ? `Cooldown (${formatTime(cooldownRemaining)})`
        : showSpinner
            ? 'Auditing...'
            : 'Run Audit';

    return (
        <div className={cn("bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[160px] flex flex-col justify-between relative overflow-hidden", isLoading && "animate-pulse")}>
            <div className="flex items-center gap-2 text-slate-600 mb-4">
                <Clock className="h-4 w-4" />
                <h3 className="text-sm font-medium">Sync Status</h3>
            </div>

            <div className="flex flex-col gap-1 mb-4">
                <span className="text-2xl font-semibold tracking-tight text-slate-900">
                    {isLocked ? "Subscription Required" : formattedTime}
                </span>
                <span className="text-xs text-slate-500">
                    {isLocked ? "Unlock features with an active subscription" : formattedDate}
                </span>
            </div>

            {uiMessage && (
                <div className={cn(
                    "flex items-start gap-2 p-2 rounded-lg border text-[11px] font-medium mb-3 animate-in fade-in slide-in-from-top-2 duration-300",
                    messageType === 'warning' && "bg-amber-50 border-amber-200 text-amber-800",
                    messageType === 'error' && "bg-red-50 border-red-100 text-red-700",
                    messageType === 'success' && "bg-green-50 border-green-100 text-green-700"
                )}>
                    {messageType === 'warning' && <Clock className="h-3 w-3 shrink-0 mt-0.5" />}
                    {messageType === 'error' && <XCircle className="h-3 w-3 shrink-0 mt-0.5" />}
                    {messageType === 'success' && <CheckCircle className="h-3 w-3 shrink-0 mt-0.5" />}
                    <p className="flex-1 leading-tight">{uiMessage}</p>
                    <button onClick={() => setUiMessage(null)} className="shrink-0 hover:opacity-70 transition-opacity">
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}

            <div className="relative">
                <Button
                    onClick={handleRunAudit}
                    disabled={isDisabled}
                    className={cn(
                        "w-full h-10 rounded-lg text-sm font-medium transition-all shadow-none",
                        isDisabled && !isOnCooldown ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "",
                        isLocked || isOnCooldown ? "bg-slate-100 text-slate-500 hover:bg-slate-100 border border-slate-200" : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                >
                    {showSpinner ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : isLocked ? (
                        <Lock className="mr-2 h-4 w-4" />
                    ) : isOnCooldown ? (
                        <Clock className="mr-2 h-4 w-4" />
                    ) : (
                        <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    {buttonText}
                </Button>

                {isOnCooldown && (
                    <div aria-label="Cooldown active" className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-lg bg-amber-50/60 border-2 border-amber-200/70 cursor-not-allowed transition-all duration-300">
                        <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                        <span className="text-[11px] font-black text-amber-700 tabular-nums">
                            {formatTime(cooldownRemaining)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}