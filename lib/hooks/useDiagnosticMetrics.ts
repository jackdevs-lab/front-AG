import { useMemo } from 'react';

/**
 * Shape returned by the hook. `currency` is new — consumers (ImpactScopeCard)
 * should use it instead of defaulting to USD.
 */
export interface DiagnosticMetrics {
    isTeaser: boolean;
    healthScore: number;
    scoreLabel: string;
    scoreColor: string;
    totalIssues: number;
    critical: number;
    warning: number;
    totalEntities: number;
    totalExposure: number;
    /** ✅ NEW: primary currency for totalExposure. Empty string means "unknown". */
    currency: string;
    /** ✅ NEW: exact exposure bucketed per currency (for mixed-currency connections). */
    exposureByCurrency: Record<string, number>;
    scoreBreakdown?: any;
}

const EMPTY_METRICS: DiagnosticMetrics = {
    isTeaser: false,
    healthScore: 100,
    scoreLabel: 'Ready',
    scoreColor: '#94a3b8',
    totalIssues: 0,
    critical: 0,
    warning: 0,
    totalEntities: 0,
    totalExposure: 0,
    currency: '',
    exposureByCurrency: {},
};

/**
 * Pick the "primary" currency from a per-currency exposure map.
 * Largest bucket wins; ties broken alphabetically for determinism.
 */
function pickPrimaryCurrency(byCurrency: Record<string, number>): string {
    const entries = Object.entries(byCurrency).filter(([, v]) => v !== 0);
    if (entries.length === 0) return '';
    entries.sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]));
    return entries[0][0];
}

/**
 * Resolve the connection's currency from the various places the backend has
 * stored it over time. Order matters — most authoritative first.
 */
function resolveCurrency(diagnostics: any, issues: any[], summary: any, meta: any): string {
    return (
        diagnostics?.currency ||
        summary?.currency ||
        meta?.currency ||
        issues?.find((i: any) => typeof i?.currency === 'string' && i.currency)?.currency ||
        ''
    );
}

export function useDiagnosticMetrics(diagnostics: any): DiagnosticMetrics {
    return useMemo<DiagnosticMetrics>(() => {
        if (!diagnostics) return EMPTY_METRICS;

        const isTeaser = diagnostics.locked === true || diagnostics.isTeaser === true;
        const summary = diagnostics.summary ?? null;
        const meta = diagnostics.meta ?? null;

        // ─────────────────────────────────────────────────────────────
        // Path 1: Pre-aggregated teaser/summary (locked runs)
        // ─────────────────────────────────────────────────────────────
        if (isTeaser && summary) {
            // ✅ Also fall back to meta.totalExposure (LockedDiagnosticRun)
            const totalExposure =
                summary.totalExposure ??
                meta?.totalExposure ??
                diagnostics.totalExposure ??
                0;
            const currency =
                summary.currency ||
                meta?.currency ||
                diagnostics.currency ||
                '';

            // Build exposureByCurrency if backend gave a single-currency figure
            const exposureByCurrency: Record<string, number> =
                currency && totalExposure ? { [currency]: totalExposure } : {};

            return {
                isTeaser: true,
                healthScore: diagnostics.healthScore ?? 100,
                scoreLabel: diagnostics.scoreLabel ?? 'Fair',
                scoreColor: diagnostics.scoreColor ?? '#eab308',
                totalIssues: summary.totalIssues ?? diagnostics.totalIssues ?? 0,
                critical: summary.criticalCount ?? diagnostics.criticalCount ?? 0,
                warning: summary.warningCount ?? diagnostics.warningCount ?? 0,
                totalEntities:
                    summary.affectedEntitiesCount ??
                    diagnostics.affectedEntitiesCount ??
                    0,
                totalExposure,
                currency,
                exposureByCurrency,
                scoreBreakdown: diagnostics.scoreBreakdown,
            };
        }

        // ─────────────────────────────────────────────────────────────
        // Path 2: Unlocked / subscribed — compute from diagnostics.issues
        // ─────────────────────────────────────────────────────────────
        // ✅ FIX: read `issues` (not `findings` — DiagnosticRun never had
        //        a `findings` field, only `issues`). Keep `findings` as a
        //        defensive fallback in case some older backend returns it.
        const issues: any[] = Array.isArray(diagnostics.issues)
            ? diagnostics.issues
            : Array.isArray(diagnostics.findings)
                ? diagnostics.findings
                : [];

        let critical = 0;
        let warning = 0;
        let entitiesFromCount = 0;
        const uniqueEntities = new Set<string>();
        const exposureByCurrency: Record<string, number> = {};
        const defaultCurrency = resolveCurrency(diagnostics, issues, summary, meta);

        issues.forEach((item: any) => {
            if (item?.severity === 'CRITICAL') critical++;
            if (item?.severity === 'WARNING') warning++;

            // ✅ Each Issue carries `entityCount` (summary API) — sum those.
            if (typeof item?.entityCount === 'number') {
                entitiesFromCount += item.entityCount;
            }
            // Some issues may carry entity ids directly — dedupe those.
            if (Array.isArray(item?.entities)) {
                item.entities.forEach((e: any) => {
                    if (e?.id) uniqueEntities.add(String(e.id));
                });
            }
            if (Array.isArray(item?.entityIds)) {
                item.entityIds.forEach((id: any) => {
                    if (id) uniqueEntities.add(String(id));
                });
            }

            // ✅ Bucket exposure per currency — never add USD + KES together.
            const amount = Number(item?.exposureAmount) || 0;
            if (amount !== 0) {
                const cur = item?.currency || defaultCurrency || 'USD';
                exposureByCurrency[cur] = (exposureByCurrency[cur] || 0) + amount;
            }
        });

        // Derive totalExposure from the biggest bucket + pick that currency.
        const primaryCurrency = pickPrimaryCurrency(exposureByCurrency);
        const totalExposureFromIssues = primaryCurrency
            ? exposureByCurrency[primaryCurrency]
            : 0;

        // ✅ Backend-provided fallbacks (summary / meta / top-level)
        const backendExposure =
            summary?.totalExposure ??
            meta?.totalExposure ??
            diagnostics.totalExposure ??
            0;

        // Prefer the value we computed from issues (it is what the table rows
        // show). Fall back to backend only when we had nothing to sum.
        const totalExposure = totalExposureFromIssues || backendExposure;

        // Currency: prefer the one from issues, then fall back to backend.
        const currency =
            primaryCurrency ||
            defaultCurrency ||
            summary?.currency ||
            meta?.currency ||
            '';

        // If we fell back to backendExposure but have no bucket yet, seed one
        if (!primaryCurrency && currency && totalExposure) {
            exposureByCurrency[currency] = totalExposure;
        }

        // Entity count: prefer dedupe-from-entities, then summed entityCount,
        // then backend aggregate.
        const totalEntities =
            uniqueEntities.size ||
            entitiesFromCount ||
            diagnostics.affectedEntitiesCount ||
            summary?.affectedEntitiesCount ||
            0;

        const totalIssues =
            issues.length > 0
                ? issues.length
                : diagnostics.totalIssues ?? summary?.totalIssues ?? 0;

        return {
            isTeaser,
            healthScore: diagnostics.healthScore ?? 100,
            scoreLabel: diagnostics.scoreLabel ?? 'Good',
            scoreColor: diagnostics.scoreColor ?? '#22c55e',
            totalIssues,
            critical: critical || (diagnostics.criticalCount ?? summary?.criticalCount ?? 0),
            warning: warning || (diagnostics.warningCount ?? summary?.warningCount ?? 0),
            totalEntities,
            totalExposure,
            currency,
            exposureByCurrency,
            scoreBreakdown: diagnostics.scoreBreakdown,
        };
    }, [diagnostics]);
}