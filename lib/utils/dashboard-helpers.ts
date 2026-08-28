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
    urls: string[];
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

    // 1. Try JSON parsing
    try {
        const parsedJson = JSON.parse(message);
        if (Array.isArray(parsedJson)) {
            return {
                findings: parsedJson.map((item: any, idx: number) => {
                    // Extract all URLs from the JSON item (could be a single string or array)
                    const rawUrls = Array.isArray(item.url)
                        ? item.url
                        : item.url || item.qbLink ? [String(item.url || item.qbLink)] : [];
                    const urls = rawUrls.map((u: any) => String(u));

                    return {
                        id: String(item.id || item.txnId || `ID-${idx}`),
                        type: String(item.type || item.entityType || 'Audit Item'),
                        url: urls.length > 0 ? urls[0] : '', // first URL or empty
                        urls,
                        description: String(item.description || item.message || '')
                            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                            .replace(/\*\*/g, '')
                    };
                }),
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
            recommendation = recommendation.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');
        }
    }

    const findingsHeading = '### Detailed Findings';
    const findingsStartIdx = message.indexOf(findingsHeading);
    if (findingsStartIdx === -1) {
        // Fallback: if no detailed findings section, try to extract any URL from the whole message
        const urls = extractUrls(message);
        if (urls.length > 0) {
            findings.push({
                id: 'finding-1',
                type: 'Finding',
                url: urls[0],
                urls,
                description: message.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '')
            });
        }
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

        // Extract ALL URLs from the body (Markdown links or plain URLs)
        const urls: string[] = [];
        const mdLinkRegex = /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
        let mdMatch;
        while ((mdMatch = mdLinkRegex.exec(body)) !== null) {
            urls.push(mdMatch[2].trim());
        }
        // If no Markdown links found, try plain URLs
        if (urls.length === 0) {
            const plainUrlRegex = /https?:\/\/[^\s)]+/g;
            let plainMatch;
            while ((plainMatch = plainUrlRegex.exec(body)) !== null) {
                urls.push(plainMatch[0]);
            }
        }

        const url = urls.length > 0 ? urls[0] : '';

        let description = body;

        // Remove Impact Details and QuickBooks Reference prefixes
        const impactRegex = /(?:-\s*)?\*\*Impact Details:\*\*/i;
        const impactMatch = description.match(impactRegex);
        if (impactMatch) {
            description = description.substring(impactMatch.index! + impactMatch[0].length);
        }

        const qbRegex = /(?:-\s*)?\*\*QuickBooks Reference:\*\*/i;
        const qbMatch = description.match(qbRegex);
        if (qbMatch) {
            description = description.substring(0, qbMatch.index!);
        }

        // Clean remaining Markdown
        description = description.replace(/\[Open in QuickBooks\]\([^)]+\)/gi, '');
        description = description.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        description = description.replace(/\*\*([^*]+)\*\*/g, '$1');
        description = description.replace(/__([^_]+)__/g, '$1');
        description = description.trim();

        findings.push({
            id: `finding-${idx}`,
            type: label,
            url,
            urls,
            description,
        });
    }

    return { findings, totalExposure, recommendation };
}

// Helper to extract plain URLs (used in fallback)
function extractUrls(text: string): string[] {
    const urls: string[] = [];
    const regex = /https?:\/\/[^\s)]+/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        urls.push(match[0]);
    }
    return urls;
}