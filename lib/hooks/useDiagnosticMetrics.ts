import { useMemo } from 'react';
import { DiagnosticRunResult } from '@/types/diagnostic';
import { parseMarkdownFindings } from '@/lib/utils/dashboard-helpers';

export interface BaseDiagnosticMetrics {
    critical: number;
    warning: number;
    info: number;
    totalIssues: number;
    totalEntities: number;
    totalExposure: string;
    lastSync: Date;
    // Newly exposed KPIs so components don't have to parse locked vs unlocked runs
    healthScore: number;
    scoreLabel: string;
    scoreColor: string;
    scoreBreakdown?: any;
}

export interface TeaserMetrics extends BaseDiagnosticMetrics {
    isTeaser: true;
}

export interface FullMetrics extends BaseDiagnosticMetrics {
    isTeaser: false;
}

export type DiagnosticMetricsResult = TeaserMetrics | FullMetrics | null;

const CURRENCY_CLEANUP_REGEX = /[^\d.-]/g;

const formatUSD = (value: number): string => {
    return `$${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const safelyParseDate = (dateVal?: string | Date | null): Date => {
    if (!dateVal) return new Date();
    if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? new Date() : dateVal;

    const parsed = new Date(dateVal);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
};

const extractNumericExposure = (exposureString?: string | null): number => {
    if (!exposureString) return 0;
    const cleanedString = exposureString.replace(CURRENCY_CLEANUP_REGEX, '');
    const numericValue = parseFloat(cleanedString);
    return isNaN(numericValue) ? 0 : numericValue;
};

export function useDiagnosticMetrics(latestDiagnostics: DiagnosticRunResult | null): DiagnosticMetricsResult {
    return useMemo(() => {
        if (!latestDiagnostics) return null;

        // Bypassing strict types on the raw payload to safely extract conditionally present properties
        const diagAny = latestDiagnostics as any;
        const meta = diagAny.meta ?? {};

        const lastSync = safelyParseDate(latestDiagnostics.runAt);
        const { totalExposure: summaryExposure } = parseMarkdownFindings(diagAny.message || '');
        const fallbackExposure = summaryExposure || '$0.00';

        // Extract teaser values whether they are top-level or tucked inside the meta object
        const healthScore = diagAny.healthScore ?? meta.healthScore ?? 100;
        const scoreLabel = diagAny.scoreLabel ?? meta.scoreLabel ?? (latestDiagnostics.locked ? 'Locked' : 'Ready');
        const scoreColor = diagAny.scoreColor ?? meta.scoreColor ?? '#94a3b8';
        const scoreBreakdown = diagAny.scoreBreakdown ?? meta.scoreBreakdown;

        if (latestDiagnostics.locked) {
            return {
                critical: meta.criticalCount ?? 0,
                warning: meta.warningCount ?? 0,
                info: meta.infoCount ?? 0,
                totalIssues: (meta.criticalCount ?? 0) + (meta.warningCount ?? 0) + (meta.infoCount ?? 0),
                totalEntities: meta.entitiesAffected ?? 0,
                totalExposure: meta.totalExposure || fallbackExposure,
                lastSync,
                healthScore,
                scoreLabel,
                scoreColor,
                scoreBreakdown,
                isTeaser: true,
            };
        }

        let critical = 0;
        let warning = 0;
        let info = 0;
        let calculatedEntities = 0;
        let calculatedExposureSum = 0;

        const seenRuleIds = new Set<string>();
        const issuesList = diagAny.issues ?? [];

        const requiresDynamicExposure = !summaryExposure && issuesList.length > 0;

        for (const issue of issuesList) {
            switch (issue.severity) {
                case 'CRITICAL': critical++; break;
                case 'WARNING': warning++; break;
                case 'INFO': info++; break;
            }

            calculatedEntities += issue.entityCount ?? 0;

            if (requiresDynamicExposure && issue.ruleId && !seenRuleIds.has(issue.ruleId)) {
                seenRuleIds.add(issue.ruleId);

                const { totalExposure: issueExp } = parseMarkdownFindings(issue.message || '');
                calculatedExposureSum += extractNumericExposure(issueExp);
            }
        }

        let finalExposure = diagAny.totalExposure || summaryExposure;

        if (!finalExposure && requiresDynamicExposure && calculatedExposureSum > 0) {
            finalExposure = formatUSD(calculatedExposureSum);
        }

        return {
            critical,
            warning,
            info,
            totalIssues: diagAny.issueCount ?? issuesList.length,
            totalEntities: diagAny.totalEntities ?? calculatedEntities,
            totalExposure: finalExposure || '$0.00',
            lastSync,
            healthScore,
            scoreLabel,
            scoreColor,
            scoreBreakdown,
            isTeaser: false,
        };
    }, [latestDiagnostics]);
}