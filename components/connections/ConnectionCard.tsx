'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Connection } from '@/types/connection';
import { formatDistanceToNow } from 'date-fns';
import { ShieldCheck, Trash2, AlertCircle, CheckCircle, Loader2, XCircle, Clock, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useConnectionStatus } from '@/lib/hooks/useConnections';
import { cn } from '@/lib/utils/cn';

type SyncStatus = 'IDLE' | 'SYNCING' | 'ERROR';

interface ConnectionCardProps {
    connection: Connection;
    onRunAudit: (id: string, options?: { onError?: (error: any) => void, onSuccess?: () => void }) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
}

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export function ConnectionCard({
    connection,
    onRunAudit,
    onDelete,
    onView
}: ConnectionCardProps) {
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [isStarting, setIsStarting] = useState(false);
    const [isAuditRunning, setIsAuditRunning] = useState(false);
    const [uiMessage, setUiMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'warning' | 'error' | 'success'>('warning');
    const [triggerTime, setTriggerTime] = useState<number | null>(null);

    const { data: statusData } = useConnectionStatus(connection.id, isAuditRunning);

    const currentStatusFromHook: SyncStatus = statusData?.syncStatus || connection.syncStatus;
    const errorMessage = statusData?.lastSyncMessage || connection.lastSyncMessage;
    const isError = currentStatusFromHook === 'ERROR';

    // --- DEBUGGING USE EFFECT ---
    useEffect(() => {
        const lastUpdateStr = connection.updatedAt;
        const lastUpdate = lastUpdateStr ? new Date(lastUpdateStr).getTime() : 0;

        console.log('[ConnectionCard Debug] Status Check:', {
            currentStatusFromHook,
            isAuditRunning,
            triggerTime,
            triggerTimeFormatted: triggerTime ? new Date(triggerTime).toISOString() : null,
            connectionUpdatedAt: lastUpdateStr,
            connectionUpdatedAtMs: lastUpdate,
            isTriggeredAndUpdated: triggerTime !== null && lastUpdate >= triggerTime
        });

        if (currentStatusFromHook === 'SYNCING') {
            console.log('[ConnectionCard Debug] -> Status is SYNCING. Keeping spinner ON.');
            setIsAuditRunning(true);
        } else if (isAuditRunning) {
            if (currentStatusFromHook === 'ERROR') {
                console.log('[ConnectionCard Debug] -> Status is ERROR. Stopping spinner.');
                setIsAuditRunning(false);
                setTriggerTime(null);
            } else if (currentStatusFromHook === 'IDLE' && triggerTime && lastUpdate >= triggerTime) {
                console.log('[ConnectionCard Debug] -> Status is IDLE and updatedAt >= triggerTime. Sync COMPLETE. Stopping spinner.');
                setIsAuditRunning(false);
                setTriggerTime(null);
                setUiMessage('Sync completed successfully!');
                setMessageType('success');
            } else if (currentStatusFromHook === 'IDLE') {
                console.log('[ConnectionCard Debug] -> Status is IDLE, but updatedAt is NOT >= triggerTime. Waiting for parent to pass updated connection prop...');
            }
        }
    }, [currentStatusFromHook, isAuditRunning, connection.updatedAt, triggerTime]);

    // Cooldown calculation based on connection.updatedAt
    useEffect(() => {
        if (!connection.updatedAt) {
            setCooldownRemaining(0);
            return;
        }

        const calculateRemaining = () => {
            const lastUpdate = new Date(connection.updatedAt).getTime();
            const elapsed = Date.now() - lastUpdate;
            const remaining = Math.max(0, COOLDOWN_MS - elapsed);
            setCooldownRemaining(remaining);
        };

        calculateRemaining();
        const interval = setInterval(calculateRemaining, 1000);

        return () => clearInterval(interval);
    }, [connection.updatedAt]);

    const isOnCooldown = cooldownRemaining > 0;
    const isDisabled = isStarting || isOnCooldown || isAuditRunning;

    const handleRunAudit = () => {
        console.log('[ConnectionCard Debug] handleRunAudit called');
        if (isOnCooldown) {
            setUiMessage(`Please wait ${formatTime(cooldownRemaining)} before syncing again.`);
            setMessageType('warning');
            return;
        }
        if (isDisabled) {
            console.log('[ConnectionCard Debug] handleRunAudit blocked: isDisabled is true');
            return;
        }

        setUiMessage(null);
        setIsStarting(true);

        onRunAudit(connection.id, {
            onError: (error: any) => {
                console.log('[ConnectionCard Debug] onRunAudit onError triggered:', error);
                setIsStarting(false);
                setIsAuditRunning(false);
                setTriggerTime(null);
                if (error?.response?.status === 429) {
                    const msg = error.response.data?.message || 'Server is cooling down. Please wait.';
                    setUiMessage(msg);
                    setMessageType('warning');
                } else {
                    setUiMessage('Sync failed to start. Please try again later.');
                    setMessageType('error');
                }
            },
            onSuccess: () => {
                console.log('[ConnectionCard Debug] onRunAudit onSuccess triggered! Setting isAuditRunning=true and capturing triggerTime.');
                setIsStarting(false);
                setIsAuditRunning(true);
                const now = Date.now();
                setTriggerTime(now);
                console.log('[ConnectionCard Debug] Captured triggerTime:', now, new Date(now).toISOString());
                setUiMessage('Sync triggered! Monitoring...');
                setMessageType('warning');
            }
        });
    };

    const getStatusBadge = (status: SyncStatus) => {
        switch (status) {
            case 'SYNCING':
                return <Badge className="bg-blue-500 hover:bg-blue-600 animate-pulse">Auditing</Badge>;
            case 'ERROR':
                return <Badge variant="destructive">Error</Badge>;
            case 'IDLE':
                return <Badge className="bg-[#2CA01C] hover:bg-[#228216]">Active</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getHealthIndicator = (lastSyncAt: Date | string | null) => {
        if (!lastSyncAt) return null;
        const date = new Date(lastSyncAt);
        const hoursSinceSync = (Date.now() - date.getTime()) / (1000 * 60 * 60);
        if (hoursSinceSync < 24) return <CheckCircle className="h-4 w-4 text-green-500" />;
        if (hoursSinceSync < 72) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const showSpinner = isStarting || isAuditRunning;
    const buttonText = isOnCooldown
        ? `Cooldown (${formatTime(cooldownRemaining)})`
        : showSpinner
            ? 'Auditing...'
            : 'Run Audit';

    return (
        <Card className="group relative overflow-hidden border-none bg-white/70 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${isError ? 'bg-red-500' : 'bg-[#2CA01C]'}`} />

            <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                <Image src="/image.png" alt="QuickBooks Logo" width={20} height={20} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                                {connection.companyName || 'QuickBooks Company'}
                            </CardTitle>
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                            ID: {connection.realmId.slice(0, 12)}...
                        </p>
                    </div>
                    {getStatusBadge(currentStatusFromHook)}
                </div>
            </CardHeader>

            <CardContent className="relative pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                        <div className="flex items-center gap-2">
                            {getHealthIndicator(connection.lastSyncAt)}
                            <span className="text-xs font-bold text-gray-700">Healthy</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Sync</p>
                        <span className="text-xs font-bold text-gray-700">
                            {connection.lastSyncAt
                                ? formatDistanceToNow(new Date(connection.lastSyncAt), { addSuffix: true })
                                : 'Never'
                            }
                        </span>
                    </div>
                </div>

                {isError && errorMessage && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-700 font-medium">{errorMessage}</p>
                    </div>
                )}

                {uiMessage && (
                    <div className={cn(
                        "flex items-start gap-2 p-3 rounded-xl border text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-300",
                        messageType === 'warning' && "bg-amber-50 border-amber-200 text-amber-800",
                        messageType === 'error' && "bg-red-50 border-red-100 text-red-700",
                        messageType === 'success' && "bg-green-50 border-green-100 text-green-700"
                    )}>
                        {messageType === 'warning' && <Clock className="h-4 w-4 shrink-0 mt-0.5" />}
                        {messageType === 'error' && <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                        {messageType === 'success' && <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                        <p className="flex-1">{uiMessage}</p>
                        <button onClick={() => setUiMessage(null)} className="shrink-0 hover:opacity-70 transition-opacity">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </CardContent>

            <CardFooter className="relative flex gap-2 pt-0 pb-6 px-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 font-bold text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                    onClick={() => onView(connection.id)}
                >
                    Details
                </Button>

                <div className="relative flex-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "w-full font-bold text-xs border-2 border-gray-200 hover:border-[#2CA01C]/30 hover:bg-[#2CA01C]/5 hover:text-[#2CA01C] rounded-xl transition-all",
                            isOnCooldown && "blur-sm opacity-50 cursor-not-allowed pointer-events-none"
                        )}
                        onClick={handleRunAudit}
                        disabled={isDisabled}
                    >
                        {showSpinner ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                        ) : (
                            <ShieldCheck className="h-3 w-3 mr-2" />
                        )}
                        {buttonText}
                    </Button>

                    {isOnCooldown && (
                        <div
                            aria-label="Cooldown active"
                            className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-xl bg-amber-50/60 border-2 border-amber-200/70 cursor-not-allowed transition-all duration-300"
                        >
                            <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                            <span className="text-[11px] font-black text-amber-700 tabular-nums">
                                {formatTime(cooldownRemaining)}
                            </span>
                        </div>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    onClick={() => onDelete(connection.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}