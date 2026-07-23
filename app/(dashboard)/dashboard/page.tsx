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
import { AlertCircle, Database, Lock } from 'lucide-react';
import { calculateTrend } from '@/lib/utils/dashboard-helpers';
import { Button } from '@/components/ui/button';
import { useDiagnosticMetrics } from '@/lib/hooks/useDiagnosticMetrics';
import { DetectedIssuesCard } from '@/components/dashboard/DetectedIssuesCard';
import { ImpactScopeCard } from '@/components/dashboard/ImpactScopeCard';
import { SyncStatusCard } from '@/components/dashboard/SyncStatusCard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import axios from 'axios';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

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
                    {isLocked ? (
                        <LockedHealthCard router={router} selectedConnectionId={selectedConnectionId} />
                    ) : (
                        <HealthScoreCard
                            score={latestDiagnostics && !latestDiagnostics.locked ? latestDiagnostics.healthScore : 100}
                            label={latestDiagnostics && !latestDiagnostics.locked ? latestDiagnostics.scoreLabel : 'Ready'}
                            color={latestDiagnostics && !latestDiagnostics.locked ? latestDiagnostics.scoreColor : '#94a3b8'}
                            lastUpdated={latestDiagnostics ? new Date(latestDiagnostics.runAt) : new Date()}
                            breakdown={latestDiagnostics && !latestDiagnostics.locked ? latestDiagnostics.scoreBreakdown : undefined}
                            trend={trend as any}
                            previousScore={previousScore}
                        />
                    )}
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

            {isLocked ? (
                <LockedOverlay router={router} selectedConnectionId={selectedConnectionId}>
                    <DiagnosticFindingsSection
                        isLocked={isLocked}
                        isLoading={isLoading}
                        latestDiagnostics={latestDiagnostics ?? null}
                        selectedConnectionId={selectedConnectionId}
                    />
                </LockedOverlay>
            ) : (
                <DiagnosticFindingsSection
                    isLocked={isLocked}
                    isLoading={isLoading}
                    latestDiagnostics={latestDiagnostics ?? null}
                    selectedConnectionId={selectedConnectionId}
                />
            )}
        </div>
    );
}

function LockedOverlay({ router, selectedConnectionId, children }: { router: any, selectedConnectionId: string | null, children: React.ReactNode }) {
    // Fetch ungated overview metrics to tease the locked user
    const { data: overview } = useQuery({
        queryKey: ['connection-overview', selectedConnectionId],
        queryFn: async () => {
            if (!selectedConnectionId) return null;
            const response = await api.get(`/connections/${selectedConnectionId}/overview`);
            return response.data;
        },
        enabled: !!selectedConnectionId,
    });

    return (
        <div className="relative mt-8">
            <div className="blur-[6px] opacity-40 pointer-events-none select-none transition-all duration-500 max-h-[650px] overflow-hidden">
                {children}
            </div>
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 p-8 rounded-[32px] shadow-2xl max-w-xl w-full text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-[hsl(199,89%,48%)]/10 text-[hsl(199,89%,48%)] flex items-center justify-center rounded-2xl mb-2">
                        <Lock className="w-8 h-8" />
                    </div>

                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Unlock Detailed Findings</h3>
                        <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                            Upgrade your plan to view full line-item details, exact transaction IDs, and receive step-by-step resolution guides.
                        </p>
                    </div>

                    {overview && (
                        <div className="grid grid-cols-3 gap-4 py-2">
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-slate-900">{overview.totalIssues || 0}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1 text-center">Issues Found</span>
                            </div>
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-rose-600">{overview.criticalIssues || 0}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 mt-1 text-center">Critical</span>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-amber-600">{overview.warningIssues || 0}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 mt-1 text-center">Warnings</span>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={() => router.push(`/billing?connectionId=${selectedConnectionId}`)}
                        className="w-full h-14 bg-[hsl(199,89%,48%)] hover:bg-[hsl(199,89%,38%)] text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all"
                    >
                        View Subscription Plans
                    </Button>
                </div>
            </div>
        </div>
    );
}

function LockedHealthCard({ router, selectedConnectionId }: any) {
    return (
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <Lock className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">Health Score</span>
                </div>
                <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2.5 py-0.5 rounded-full uppercase tracking-tight">Locked</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-5xl font-mono font-black text-slate-200 tracking-tighter">—</span>
                <span className="text-sm font-mono font-bold text-slate-200">/100</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full mb-4" />
            <div className="grid grid-cols-3 gap-2">
                {['Passed', 'Warning', 'Critical'].map(label => (
                    <div key={label} className="flex flex-col p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mb-1">{label}</span>
                        <span className="text-sm font-mono font-black text-slate-200">—</span>
                    </div>
                ))}
            </div>
            {selectedConnectionId && (
                <button
                    onClick={() => router.push(`/billing?connectionId=${encodeURIComponent(selectedConnectionId)}`)}
                    className="mt-4 w-full text-[10px] font-black uppercase tracking-widest text-[hsl(199,89%,48%)] hover:text-[hsl(199,89%,38%)] transition-colors text-center"
                >
                    Subscribe to see your score →
                </button>
            )}
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