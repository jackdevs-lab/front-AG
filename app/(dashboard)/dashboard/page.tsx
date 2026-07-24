'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { DiagnosticFindingsSection } from '@/components/dashboard/DiagnosticFindingsSection';
import { useConnections, useConnectionStatus, useSuspenseConnections } from '@/lib/hooks/useConnections';
import {
    useLatestDiagnostics,
    useDiagnosticHistory,
    useDiagnosticStream,
    useInvalidateAfterPayment
} from '@/lib/hooks/useDiagnostics';
import { useActiveConnection } from '@/lib/contexts/ConnectionContext';
import { ConnectQuickBooks } from '@/components/connections/ConnectQuickBooks';
import { AlertCircle, Database } from 'lucide-react';
import { calculateTrend } from '@/lib/utils/dashboard-helpers';
import { Button } from '@/components/ui/button';
import { useDiagnosticMetrics } from '@/lib/hooks/useDiagnosticMetrics';
import { DetectedIssuesCard } from '@/components/dashboard/DetectedIssuesCard';
import { ImpactScopeCard } from '@/components/dashboard/ImpactScopeCard';
import { SyncStatusCard } from '@/components/dashboard/SyncStatusCard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export default function DashboardPage() {
    return (
        <ErrorBoundary fallback={<div className="p-10 text-center">Something went wrong. Please refresh.</div>}>
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
    const invalidate = useInvalidateAfterPayment();

    useEffect(() => {
        if (!selectedConnectionId && connections.length > 0) {
            setSelectedConnectionId(connections[0].id);
        }
    }, [connections, selectedConnectionId, setSelectedConnectionId]);

    useEffect(() => {
        const hasPaymentParams = searchParams.get('reference') || searchParams.get('payment') || searchParams.get('trxref');
        if (hasPaymentParams && selectedConnectionId) {
            invalidate(selectedConnectionId);
            router.replace('/dashboard');
        }
    }, [searchParams, selectedConnectionId, invalidate, router]);

    if (connections.length === 0) {
        return <NoConnectionsView onConnected={refetch} />;
    }

    return (
        <DashboardContent
            router={router}
            error={error}
            setError={setError}
        />
    );
}

function NoConnectionsView({ onConnected }: { onConnected: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="p-8 bg-white rounded-[40px] shadow-xl shadow-slate-100 border border-slate-50 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(199,89%,48%)]/5 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <Database className="w-20 h-20 text-slate-200 group-hover:text-[hsl(199,89%,48%)]/20 transition-colors relative z-10" />
            </div>
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Connect to Get Started</h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                    Link your QuickBooks Online account to begin real-time ledger health monitoring and risk detection.
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

    const currentRunAt = latestDiagnostics?.runAt ? String(latestDiagnostics.runAt) : null;
    const hasNewResults = currentRunAt !== null && currentRunAt !== preTriggerRunAtRef.current;
    const isAuditing = isTriggeringAudit || (isExpectingSync && !hasNewResults);

    useEffect(() => {
        if (!isExpectingSync || !selectedConnectionId) return;

        const interval = setInterval(async () => {
            try {
                const { data } = await axios.get(`/api/connections/${selectedConnectionId}/status`);

                if (data?.syncStatus === 'ERROR') {
                    setError(data.lastSyncMessage || 'The background sync failed. Please try again.');
                    setIsExpectingSync(false);
                    return;
                }
            } catch (err) {
                console.error("Failed to poll connection status", err);
            }

            queryClient.invalidateQueries({ queryKey: ['diagnostics', 'latest', selectedConnectionId] });
            queryClient.invalidateQueries({ queryKey: ['diagnostics', 'history', selectedConnectionId] });
        }, 5000);

        return () => clearInterval(interval);
    }, [isExpectingSync, selectedConnectionId, queryClient, setError]);

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
            const errorMessage = axios.isAxiosError(auditError)
                ? auditError.response?.data?.message || auditError.message
                : auditError instanceof Error ? auditError.message : 'Unknown server error';
            setError(errorMessage);
            setIsExpectingSync(false);
        }
    }, [auditError, setError]);

    useEffect(() => {
        if (latestError || historyError) {
            console.error("Diagnostics failed to load", latestError || historyError);
        }
    }, [latestError, historyError]);

    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    useEffect(() => {
        if (!activeConnection?.updatedAt) {
            setCooldownRemaining(0);
            return;
        }
        const calculateRemaining = () => {
            const lastUpdate = new Date(activeConnection.updatedAt).getTime();
            const elapsed = Date.now() - lastUpdate;
            const remaining = Math.max(0, 5 * 60 * 1000 - elapsed);
            setCooldownRemaining(remaining);
        };
        calculateRemaining();
        const interval = setInterval(calculateRemaining, 1000);
        return () => clearInterval(interval);
    }, [activeConnection?.updatedAt]);

    const isOnCooldown = cooldownRemaining > 0;

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

    // Type bypasses for discriminated union properties
    const isUnlocked = latestDiagnostics && !latestDiagnostics.locked;
    const diagnosticsData = latestDiagnostics as any;

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
            {(latestError || historyError) && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ErrorBoundary>
                    <HealthScoreCard
                        {...({ isLocked } as any)}
                        score={isUnlocked ? diagnosticsData.healthScore : 100}
                        label={isUnlocked ? diagnosticsData.scoreLabel : 'Ready'}
                        color={isUnlocked ? diagnosticsData.scoreColor : '#94a3b8'}
                        lastUpdated={latestDiagnostics ? new Date(latestDiagnostics.runAt) : new Date()}
                        breakdown={isUnlocked ? diagnosticsData.scoreBreakdown : undefined}
                        trend={trend as any}
                        previousScore={previousScore}
                    />
                </ErrorBoundary>

                <ErrorBoundary>
                    <DetectedIssuesCard
                        {...({ isLocked } as any)}
                        metrics={metrics}
                        isLoading={isLoading}
                        selectedConnectionId={selectedConnectionId}
                    />
                </ErrorBoundary>

                <ErrorBoundary>
                    <ImpactScopeCard
                        {...({ isLocked } as any)}
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