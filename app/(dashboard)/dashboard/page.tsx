'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { DiagnosticFindingsSection } from '@/components/dashboard/DiagnosticFindingsSection';
import { useConnections, useSuspenseConnections, useConnectionStatus } from '@/lib/hooks/useConnections';
import {
    useLatestDiagnostics,
    useDiagnosticHistory,
    useDiagnosticStream,
    useInvalidateAfterPayment
} from '@/lib/hooks/useDiagnostics';
import { useActiveConnection } from '@/lib/contexts/ConnectionContext';
import { ConnectQuickBooks } from '@/components/connections/ConnectQuickBooks';
import { AlertCircle } from 'lucide-react';
import { calculateTrend } from '@/lib/utils/dashboard-helpers';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { useDiagnosticMetrics } from '@/lib/hooks/useDiagnosticMetrics';
import { DetectedIssuesCard } from '@/components/dashboard/DetectedIssuesCard';
import { ImpactScopeCard } from '@/components/dashboard/ImpactScopeCard';
import { SyncStatusCard } from '@/components/dashboard/SyncStatusCard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardErrorFallback } from './DashboardErrorFallback';
import { PaymentVerificationModal } from '@/components/billing/PaymentVerificationModal';

export default function DashboardPage() {
    return (
        <ErrorBoundary fallback={<DashboardErrorFallback />}>
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardInner />
            </Suspense>
        </ErrorBoundary>
    );
}

function DashboardInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refetch } = useConnections();
    const queryClient = useQueryClient();
    const { selectedConnectionId, setSelectedConnectionId } = useActiveConnection();
    const { connections } = useSuspenseConnections();
    const [error, setError] = useState<string | null>(null);

    const hasPaymentParams =
        searchParams.has('reference') ||
        searchParams.has('payment') ||
        searchParams.has('trxref');

    useEffect(() => {
        let cancelled = false;

        async function verifyOnMount() {
            try {
                await api.post('/connections/verify-and-sync', {});
                if (cancelled) return;
                await refetch();
            } catch (err) {
                console.error('Connection verification failed:', err);
            }
        }

        verifyOnMount();

        return () => {
            cancelled = true;
        };
    }, [refetch]);

    useEffect(() => {
        if (connections.length === 0) {
            if (selectedConnectionId) setSelectedConnectionId(null);
            return;
        }

        const exists = connections.some((c) => c.id === selectedConnectionId);
        if (!exists) {
            setSelectedConnectionId(connections[0].id);
        }
    }, [connections, selectedConnectionId, setSelectedConnectionId]);

    if (connections.length === 0) {
        return <NoConnectionsView onConnected={refetch} />;
    }

    return (
        <>
            {hasPaymentParams && selectedConnectionId && (
                <PaymentVerificationModal connectionId={selectedConnectionId} />
            )}

            <DashboardContent
                router={router}
                error={error}
                setError={setError}
            />
        </>
    );
}

function NoConnectionsView({ onConnected }: { onConnected: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Connect to Get Started</h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                    Link your QuickBooks Online account to begin on-demand ledger health monitoring and risk detection.
                </p>
            </div>

            <ConnectQuickBooks onConnected={onConnected} />
        </div>
    );
}

function DashboardContent({ router, error, setError }: any) {
    const queryClient = useQueryClient();
    const { activeConnection, selectedConnectionId } = useActiveConnection();

    const {
        data: latestDiagnostics,
        isLoading: isLoadingLatest,
        error: latestError
    } = useLatestDiagnostics(selectedConnectionId || '');

    const {
        data: history,
        isLoading: isLoadingHistory,
        error: historyError
    } = useDiagnosticHistory(selectedConnectionId || '');

    useDiagnosticStream(selectedConnectionId || null);

    const { runAudit, auditError, isTriggeringAudit } = useConnections();
    const [isExpectingSync, setIsExpectingSync] = useState(false);
    const preTriggerRunAtRef = useRef<string | null>(null);

    // ✅ 1. Use the dedicated status hook instead of manual setInterval
    const { data: connectionStatus } = useConnectionStatus(selectedConnectionId || '', isExpectingSync);

    const currentRunAt = latestDiagnostics?.runAt ? String(latestDiagnostics.runAt) : null;
    const hasNewResults = currentRunAt !== null && currentRunAt !== preTriggerRunAtRef.current;
    const isAuditing = isTriggeringAudit || (isExpectingSync && !hasNewResults);

    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    useEffect(() => {
        if (!activeConnection?.updatedAt) {
            setCooldownRemaining(0);
            return;
        }
        const calculateRemaining = () => {
            const lastUpdate = new Date(activeConnection.updatedAt).getTime();
            const elapsed = Date.now() - lastUpdate;
            const remaining = Math.max(0, 60 * 1000 - elapsed);
            setCooldownRemaining(remaining);
        };
        calculateRemaining();
        const interval = setInterval(calculateRemaining, 1000);
        return () => clearInterval(interval);
    }, [activeConnection?.updatedAt]);

    const isOnCooldown = cooldownRemaining > 0;

    // ✅ 2. Reactive effect that watches the status hook and releases the button on IDLE or ERROR
    useEffect(() => {
        if (!isExpectingSync || !connectionStatus) return;

        if (connectionStatus.syncStatus === 'ERROR') {
            setError(connectionStatus.lastSyncMessage || 'The background sync failed. Please try again.');
            setIsExpectingSync(false);
            return;
        }

        if (connectionStatus.syncStatus === 'IDLE') {
            // Worker finished! Invalidate queries to load fresh results and release the button
            queryClient.invalidateQueries({ queryKey: ['diagnostics', 'latest', selectedConnectionId] });
            queryClient.invalidateQueries({ queryKey: ['diagnostics', 'history', selectedConnectionId] });
            setIsExpectingSync(false);
            return;
        }
    }, [connectionStatus, isExpectingSync, selectedConnectionId, queryClient, setError]);

    // ✅ 3. FAILSAFE: If the audit takes longer than 3 minutes, release the button 
    // to prevent it from being permanently stuck due to network/rate-limit issues.
    useEffect(() => {
        if (!isExpectingSync) return;

        const timeout = setTimeout(() => {
            console.warn("Audit polling timeout reached. Releasing button.");
            setIsExpectingSync(false);
            setError("The audit is taking longer than expected. Please check the diagnostics history or try again.");
        }, 180000); // 3 minutes

        return () => clearTimeout(timeout);
    }, [isExpectingSync, setError]);

    useEffect(() => {
        if (isExpectingSync && hasNewResults) {
            const timer = setTimeout(() => {
                setIsExpectingSync(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isExpectingSync, hasNewResults]);

    useEffect(() => {
        if (auditError) {
            const isCooldown = (auditError as any).status === 429;

            if (isCooldown) {
                setCooldownRemaining(60 * 1000);
                setError('Sync is currently on cooldown. Please wait before trying again.');
            } else {
                const errorMessage = axios.isAxiosError(auditError)
                    ? auditError.response?.data?.message || auditError.message
                    : auditError instanceof Error ? auditError.message : 'Unknown server error';
                setError(errorMessage);
            }

            setIsExpectingSync(false);
        }
    }, [auditError, setError]);

    useEffect(() => {
        if (latestError || historyError) {
            console.error("Diagnostics failed to load", latestError || historyError);
        }
    }, [latestError, historyError]);

    const handleRunAudit = () => {
        if (!activeConnection || isOnCooldown) return;
        setError(null);
        preTriggerRunAtRef.current = latestDiagnostics?.runAt ? String(latestDiagnostics.runAt) : null;
        setIsExpectingSync(true);
        runAudit(activeConnection.id);
    };

    const { trend, previousScore } = calculateTrend(history || []);

    const isLocked =
        activeConnection?.subscriptionStatus === 'INACTIVE' ||
        latestDiagnostics?.locked === true ||
        (!latestDiagnostics && activeConnection?.subscriptionStatus !== 'ACTIVE');

    const metrics = useDiagnosticMetrics(latestDiagnostics ?? null);
    const isLoading = isAuditing || isLoadingLatest || isLoadingHistory;

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
            {(() => {
                const is401 = (err: any) => err?.response?.status === 401 || err?.status === 401;
                const isAuthError = is401(latestError) || is401(historyError);

                const isCurrentlySyncing = isAuditing || activeConnection?.syncStatus === 'SYNCING';
                const isDelayError = isCurrentlySyncing && (latestError || historyError) && !isAuthError;

                return (
                    <>
                        {isAuthError && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-slate-600" />
                                <div className="flex-1">
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Session Expired</p>
                                    <p className="text-[11px] font-medium text-slate-700 mt-0.5">
                                        Your authentication session has expired. Please refresh the page to continue.
                                    </p>
                                </div>
                            </div>
                        )}

                        {isDelayError && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <div className="flex-1">
                                    <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Diagnostics Delayed</p>
                                    <p className="text-[11px] font-medium text-amber-700 mt-0.5">
                                        The server is taking longer than expected to process diagnostics. The dashboard may show incomplete data.
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ErrorBoundary>
                    <HealthScoreCard
                        {...({ isLocked } as any)}
                        score={metrics?.healthScore ?? 100}
                        label={metrics?.scoreLabel ?? 'Ready'}
                        color={metrics?.scoreColor ?? '#94a3b8'}
                        lastUpdated={latestDiagnostics?.runAt ?? null}
                        breakdown={metrics?.scoreBreakdown}
                        trend={trend as any}
                        previousScore={previousScore}
                    />
                </ErrorBoundary>

                <ErrorBoundary>
                    <DetectedIssuesCard
                        metrics={metrics}
                        isLoading={isLoading}
                        selectedConnectionId={selectedConnectionId}
                    />
                </ErrorBoundary>

                <ErrorBoundary>
                    <ImpactScopeCard
                        metrics={metrics}
                        isLoading={isLoading}
                    />
                </ErrorBoundary>

                <ErrorBoundary>
                    <SyncStatusCard
                        {...({ isLocked } as any)}
                        metrics={metrics}
                        latestDiagnostics={latestDiagnostics ?? null}
                        isLoading={isLoading}
                        isAuditing={isAuditing}
                        onRunAudit={handleRunAudit}
                        isOnCooldown={isOnCooldown}
                        cooldownRemaining={cooldownRemaining}
                    />
                </ErrorBoundary>
            </div>

            {error && <ErrorBanner error={error} onClose={() => setError(null)} />}

            <DiagnosticFindingsSection
                isLocked={isLocked}
                isLoading={isLoading}
                latestDiagnostics={latestDiagnostics ?? null}
                selectedConnectionId={selectedConnectionId}
            />
        </div>
    );
}

function ErrorBanner({ error, onClose }: any) {
    return (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3" role="alert">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            <div className="flex-1">
                <p className="text-xs font-black text-rose-600 uppercase tracking-widest">Audit Failed</p>
                <p className="text-[11px] font-medium text-rose-500 mt-0.5">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-rose-600 hover:bg-rose-100 h-8 font-black text-[10px] uppercase tracking-widest">
                Dismiss
            </Button>
        </div>
    );
}