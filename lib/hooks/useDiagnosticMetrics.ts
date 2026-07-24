import { useMemo } from 'react';

export function useDiagnosticMetrics(diagnostics: any) {
    return useMemo(() => {
        if (!diagnostics) {
            return {
                isTeaser: false,
                healthScore: 100,
                scoreLabel: 'Ready',
                scoreColor: '#94a3b8',
                totalIssues: 0,
                critical: 0,
                warning: 0,
                totalEntities: 0,
                totalExposure: 0,
            };
        }

        const isTeaser = diagnostics.locked === true || diagnostics.isTeaser === true;

        // 1. If backend supplies pre-aggregated teaser/summary metrics directly on diagnostics:
        if (isTeaser && diagnostics.summary) {
            return {
                isTeaser: true,
                healthScore: diagnostics.healthScore ?? 100,
                scoreLabel: diagnostics.scoreLabel ?? 'Fair',
                scoreColor: diagnostics.scoreColor ?? '#eab308',
                totalIssues: diagnostics.summary.totalIssues ?? diagnostics.totalIssues ?? 0,
                critical: diagnostics.summary.criticalCount ?? diagnostics.criticalCount ?? 0,
                warning: diagnostics.summary.warningCount ?? diagnostics.warningCount ?? 0,
                totalEntities: diagnostics.summary.affectedEntitiesCount ?? diagnostics.affectedEntitiesCount ?? 0,
                totalExposure: diagnostics.summary.totalExposure ?? diagnostics.totalExposure ?? 0,
                scoreBreakdown: diagnostics.scoreBreakdown,
            };
        }

        // 2. Otherwise, fall back to counting raw findings (for Unlocked/Subscribed mode or backends returning findings)
        const findings = diagnostics.findings || [];

        let critical = 0;
        let warning = 0;
        let totalExposure = 0;
        const uniqueEntities = new Set<string>();

        findings.forEach((item: any) => {
            if (item.severity === 'CRITICAL') critical++;
            if (item.severity === 'WARNING') warning++;
            if (item.exposureAmount) totalExposure += Number(item.exposureAmount) || 0;
            if (item.entityId) uniqueEntities.add(item.entityId);
        });

        // Use top-level counts if findings array was stripped by the server
        const totalIssues = findings.length > 0 ? findings.length : (diagnostics.totalIssues || 0);

        return {
            isTeaser,
            healthScore: diagnostics.healthScore ?? 100,
            scoreLabel: diagnostics.scoreLabel ?? 'Good',
            scoreColor: diagnostics.scoreColor ?? '#22c55e',
            totalIssues,
            critical: critical || (diagnostics.criticalCount ?? 0),
            warning: warning || (diagnostics.warningCount ?? 0),
            totalEntities: uniqueEntities.size || (diagnostics.affectedEntitiesCount ?? 0),
            totalExposure: totalExposure || (diagnostics.totalExposure ?? 0),
            scoreBreakdown: diagnostics.scoreBreakdown,
        };
    }, [diagnostics]);
}