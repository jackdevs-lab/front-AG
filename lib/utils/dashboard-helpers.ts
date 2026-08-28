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

// ... keep existing imports and helper functions ...

export function parseMarkdownFindings(message: string): ParsedMarkdownResult {
    if (!message) {
        return { findings: [], totalExposure: null, recommendation: null };
    }

    // 1. Try JSON parsing (unchanged from original)
    try {
        const parsedJson = JSON.parse(message);
        if (Array.isArray(parsedJson)) {
            return {
                findings: parsedJson.map((item: any, idx: number) => ({
                    id: String(item.id || item.txnId || `ID-${idx}`),
                    type: String(item.type || item.entityType || 'Audit Item'),
                    url: String(item.url || item.qbLink || '#'),
                    description: String(item.description || item.message || '')
                })),
                totalExposure: null,
                recommendation: null
            };
        }
    } catch (e) {
        // continue to markdown parser
    }

    // 2. Parse markdown format produced by formatStandardReport
    const findings: DiagnosticFinding[] = [];
    let totalExposure: string | null = null;
    let recommendation: string | null = null;

    // Extract total exposure from summary text
    const exposureMatch = message.match(/cumulative exposure of\s+\$([\d,.]+)/i);
    if (exposureMatch && exposureMatch[1]) {
        totalExposure = `$${exposureMatch[1]}`;
    }

    const recSectionStart = message.indexOf('### Recommended Remediation');
    if (recSectionStart !== -1) {
        const afterHeading = message.substring(recSectionStart + '### Recommended Remediation'.length);
        const blockquoteMatch = afterHeading.match(/>\s*(.*?)(?:\n|$)/);
        if (blockquoteMatch && blockquoteMatch[1]) {
            recommendation = blockquoteMatch[1].trim();
        }
    }

    const findingsHeading = '### Detailed Findings';
    const findingsStartIdx = message.indexOf(findingsHeading);
    if (findingsStartIdx === -1) {
        return { findings, totalExposure, recommendation };
    }

    const findingsContent = message.substring(findingsStartIdx + findingsHeading.length);
    const remediationIdx = findingsContent.indexOf('### Recommended Remediation');
    const findingsOnly = remediationIdx !== -1 ? findingsContent.substring(0, remediationIdx) : findingsContent;

    const findingRegex = /###\s+\d+\.\s+([^\n]+)\n([\s\S]*?)(?=###\s+\d+\.|$)/g;
    let match: RegExpExecArray | null;
    let idx = 0;

    while ((match = findingRegex.exec(findingsOnly)) !== null) {
        idx++;
        const label = match[1].trim();
        const body = match[2];

        let url = '';
        const linkMatch = body.match(/\[Open in QuickBooks\]\((.*?)\)/);
        if (linkMatch && linkMatch[1]) {
            url = linkMatch[1].trim();
        } else {
            const anyLink = body.match(/\[(.*?)\]\((https?:\/\/\S+)\)/);
            if (anyLink && anyLink[2]) {
                url = anyLink[2].trim();
            }
        }

        let description = body;

        const impactMarker = '- **Impact Details:**';
        if (description.includes(impactMarker)) {
            description = description.split(impactMarker)[1];
        }

        const qbMarker = '- **QuickBooks Reference:**';
        if (description.includes(qbMarker)) {
            description = description.split(qbMarker)[0];
        }

        description = description.trim();

        const id = `finding-${idx}`;

        findings.push({
            id,
            type: label,
            url,
            description,
        });
    }

    return { findings, totalExposure, recommendation };
}