import { DiagnosticHistory, DiagnosticRun, DiagnosticCheck } from '@/types/diagnostic';
import { format } from 'date-fns';

export type DashboardTrend = 'up' | 'down' | 'stable';

export interface TrendResult {
    trend: DashboardTrend | undefined;
    previousScore: number | undefined;
}

/**
 * Calculates the health score trend between the last two diagnostic runs.
 */
export function calculateTrend(history: DiagnosticHistory[]): TrendResult {
    const sortedHistory = [...history].sort(
        (a, b) => new Date(a.runAt).getTime() - new Date(b.runAt).getTime()
    );
    const lastTwoRuns = sortedHistory.slice(-2);

    if (lastTwoRuns.length < 2) {
        return { trend: undefined, previousScore: undefined };
    }

    const currentScore = lastTwoRuns[1].healthScore;
    const prevScore = lastTwoRuns[0].healthScore;

    const trend: DashboardTrend = currentScore > prevScore
        ? 'up'
        : currentScore < prevScore
            ? 'down'
            : 'stable';

    return { trend, previousScore: prevScore };
}

/**
 * Formats the raw history data for the trend chart.
 */
export function formatHistoryForChart(history: DiagnosticHistory[]) {
    return history.map(h => ({
        date: new Date(h.runAt),
        score: h.healthScore,
        runId: h.id || '',
    }));
}

/**
 * Generates summary metrics from the latest diagnostic run.
 */
export function getDashboardMetrics(latestRun: DiagnosticRun | null) {
    if (!latestRun) return [];

    return [
        {
            label: 'Total Rules',
            value: latestRun.checks?.length || 0,
            description: 'Active diagnostic tests'
        },
        {
            label: 'Failing Rules',
            value: latestRun.checks?.filter(c => c.status === 'FAILED').length || 0,
            description: 'Critical issues detected'
        },
        {
            label: 'Last System Check',
            value: format(new Date(latestRun.runAt), 'h:mm a'),
            description: format(new Date(latestRun.runAt), 'MMM d, yyyy')
        },
    ];
}


export interface DiagnosticFinding {
    id: string;
    type: string;
    url: string;
    description: string;
}

export interface ParsedMarkdownResult {
    findings: DiagnosticFinding[];
    totalExposure: string | null;
    recommendation: string | null;
}

export function parseMarkdownFindings(message: string): ParsedMarkdownResult {
    if (!message) {
        return { findings: [], totalExposure: null, recommendation: null };
    }

    const findingRegex = /^- \*\*(.*?)\*\* \(\[(?:Link \d+|View)\]\((https?:\/\/\S+)\).*?\) — (.*)$/gm;
    const findings: DiagnosticFinding[] = [];
    let match;

    while ((match = findingRegex.exec(message)) !== null) {
        const titleContent = match[1] || '';
        const hasSplit = titleContent.includes(' - ');

        findings.push({
            id: hasSplit ? titleContent.split(' - ')[0] : 'ID',
            type: hasSplit ? titleContent.split(' - ')[1] : 'Audit Item',
            url: match[2] || '',
            description: match[3] || ''
        });
    }

    const uniqueFindings = Array.from(
        new Map(findings.map(f => [`${f.id}-${f.description}`, f])).values()
    );

    const exposureMatch = message.match(/(?:total exposure of|exposure:)\s*\$?([\d,.]+(?:\.\d{2})?)/i);
    const totalExposure = exposureMatch && exposureMatch[1] ? `$${exposureMatch[1]}` : null;

    const recommendationMatch = message.match(/\*\*Recommendation:\*\*\s*([\s\S]*?)(?:\n\n|\n$|$)/i);
    const recommendation = recommendationMatch && recommendationMatch[1] ? recommendationMatch[1].trim() : null;

    return {
        findings: uniqueFindings,
        totalExposure,
        recommendation
    };
}