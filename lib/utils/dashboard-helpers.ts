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
        // Fallback to text line parser
    }

    const findings: DiagnosticFinding[] = [];

    // Split message by lines or list entries to evaluate line-by-line
    const lines = message.split('\n');
    let currentId = 'ID';
    let currentType = 'Audit Item';
    let currentUrl = '#';
    let currentDescLines: string[] = [];

    const flushFinding = () => {
        if (currentDescLines.length > 0) {
            const fullDesc = currentDescLines.join(' ');
            // Try to extract an ID if embedded in text like "Invoice 1042:" or "ID: 162"
            const idMatch = fullDesc.match(/(?:id|invoice|payment|bill|txn)[:\s#]+([a-zA-Z0-9_-]+)/i);
            const resolvedId = idMatch ? idMatch[1] : currentId;

            findings.push({
                id: resolvedId,
                type: currentType,
                url: currentUrl,
                description: fullDesc.replace(/\*\*QuickBooks Reference:\*\*.*$/, '').trim()
            });
            currentDescLines = [];
        }
    };

    for (const line of lines) {
        // Look for markdown links containing QuickBooks or URL patterns
        const linkMatch = line.match(/\[([^\]]+)\]\((https?:\/\/\S+)\)/);
        if (linkMatch) {
            currentUrl = linkMatch[2];
        }

        // Detect list markers or item rows
        if (line.match(/^[*-]\s+/)) {
            flushFinding();
            const cleanLine = line.replace(/^[*-]\s+/, '');
            currentDescLines.push(cleanLine);
        } else if (line.trim() !== '') {
            currentDescLines.push(line.trim());
        }
    }
    flushFinding();

    const exposureMatch = message.match(/(?:total exposure of|exposure:)\s*\$?([\d,.]+(?:\.\d{2})?)/i);
    const totalExposure = exposureMatch && exposureMatch[1] ? `$${exposureMatch[1]}` : null;

    const recommendationMatch = message.match(/\*\*Recommendation:\*\*\s*([\s\S]*?)(?:\n\n|\n$|$)/i);
    const recommendation = recommendationMatch && recommendationMatch[1] ? recommendationMatch[1].trim() : null;

    return {
        findings: findings.length > 0 ? findings : [{
            id: 'GENERAL',
            type: 'Audit Exception',
            url: currentUrl !== '#' ? currentUrl : '',
            description: message
        }],
        totalExposure,
        recommendation
    };
}