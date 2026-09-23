'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { DiagnosticFindingsSection } from '@/components/dashboard/DiagnosticFindingsSection';
import { useConnections, useSuspenseConnections } from '@/lib/hooks/useConnections';
import {
    useLatestDiagnostics,
    useDiagnosticHistory,
    useDiagnosticStream
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
import { DashboardErrorFallback } from './DashboardErrorFallback';
import { PaymentVerificationModal } from '@/components/billing/PaymentVerificationModal';

const AUDIT_HARD_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

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

interface PendingAudit {
    startedAt: number;
    previousRunAt: string | null;
}

function DashboardContent({ router, error, setError }: any) {
    const { activeConnection, selectedConnectionId } = useActiveConnection();

    // Tracks an in-flight audit from click until a new terminal DiagnosticRun lands.
    const [pendingAudit, setPendingAudit] = useState<PendingAudit | null>(null);

    const {
        data: latestDiagnostics,
        isLoading: isLoadingLatest,
        error: latestError
    } = useLatestDiagnostics(
        selectedConnectionId || '',
        { refetchInterval: pendingAudit ? 5000 : false }
    );

    const {
        data: history,
        isLoading: isLoadingHistory,
        error: historyError
    } = useDiagnosticHistory(selectedConnectionId || '');

    useDiagnosticStream(selectedConnectionId || null);

    const { runAudit: runAuditRaw, auditError, isTriggeringAudit } = useConnections();

    // True from click until the resulting DiagnosticRun reaches a terminal state.
    const isAuditing = isTriggeringAudit || pendingAudit !== null;

    // Wrap runAudit so we can open the audit window and record the previous run.
    const handleRunAudit = (
        id: string,
        options?: { onError?: (error: any) => void; onSuccess?: () => void }
    ) => {
        runAuditRaw(id, {
            onError: (err: any) => {
                options?.onError?.(err);
            },
            onSuccess: () => {
                setPendingAudit({
                    startedAt: Date.now(),
                    previousRunAt: latestDiagnostics?.runAt
                        ? String(latestDiagnostics.runAt)
                        : null,
                });
                options?.onSuccess?.();
            },
        });
    };

    // Close the audit window once a new run has reached a terminal status.
    useEffect(() => {
        if (!pendingAudit || !latestDiagnostics) return;

        const currentRunAt = latestDiagnostics.runAt
            ? String(latestDiagnostics.runAt)
            : null;
        const status = (latestDiagnostics as any)?.status as string | undefined;

        const hasNewRun =
            currentRunAt !== null && currentRunAt !== pendingAudit.previousRunAt;
        const isTerminal =
            !status || status === 'COMPLETED' || status === 'FAILED';

        if (hasNewRun && isTerminal) {
            setPendingAudit(null);
        }
    }, [pendingAudit, latestDiagnostics]);

    // Hard safety net: never let the audit window stay open indefinitely.
    useEffect(() => {
        if (!pendingAudit) return;
        const remaining = AUDIT_HARD_TIMEOUT_MS - (Date.now() - pendingAudit.startedAt);
        const timeout = setTimeout(
            () => setPendingAudit(null),
            Math.max(0, remaining)
        );
        return () => clearTimeout(timeout);
    }, [pendingAudit]);

    // Handle global audit errors
    useEffect(() => {
        if (auditError) {
            const errorMessage = axios.isAxiosError(auditError)
                ? auditError.response?.data?.message || auditError.message
                : auditError instanceof Error ? auditError.message : 'Unknown server error';
            setError(errorMessage);
        }
    }, [auditError, setError]);

    useEffect(() => {
        if (latestError || historyError) {
            console.error("Diagnostics failed to load", latestError || historyError);
        }
    }, [latestError, historyError]);

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
                        connectionId={selectedConnectionId || ''}
                        connectionUpdatedAt={activeConnection?.updatedAt || null}
                        metrics={metrics}
                        latestDiagnostics={latestDiagnostics ?? null}
                        isLoading={isLoading}
                        onRunAudit={handleRunAudit}
                        isLocked={isLocked}
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