// types/diagnostic.ts
export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface DiagnosticEntity {
    id: string;
    type: string;
    name?: string;
    [key: string]: any;
}

export interface Issue {
    id: string;
    ruleId: string;
    ruleName: string;
    severity: Severity;
    message: string;
    entityCount: number;
    entities?: DiagnosticEntity[];
    isResolved: boolean;
    createdAt: Date;
}

export interface ScoreBreakdown {
    score: number;
    grade: string;
    color: string;
    totalRules: number;
    passedCount: number;
    warningCount: number;
    criticalCount: number;
}

export interface DiagnosticCheck {
    id: string;
    ruleId: string;
    ruleName: string;
    category: string;
    status: 'PASSED' | 'FAILED' | 'WARNING';
    message?: string;
    durationMs?: number;
    createdAt: Date;
}

export interface DiagnosticRun {
    locked: false;
    id: string;
    runAt: Date;
    healthScore: number;
    scoreLabel: string;
    scoreColor: string;
    scoreBreakdown: ScoreBreakdown;
    issueCount: number;
    totalEntities?: number;
    totalExposure?: string;
    issues: Issue[];
    checks: DiagnosticCheck[];
    message?: string;
}

/**
 * Returned by GET /diagnostics/latest when subscriptionStatus !== 'ACTIVE'.
 *
 * The server confirms a run completed and exposes AGGREGATE COUNTS ONLY.
 * No issue titles, rule names, entity IDs or remediation text are included.
 * These counts power the teaser KPI cards so locked users see real numbers.
 */
export interface LockedDiagnosticRun {
    locked: true;
    runId: string;
    runAt: Date;
    meta: {
        /** Withheld — shown as null in locked state */
        healthScore: number | null;
        /** Number of CRITICAL-severity issues detected */
        criticalCount: number;
        /** Number of WARNING-severity issues detected */
        warningCount: number;
        /** Number of INFO-severity issues detected */
        infoCount: number;
        /** Total entity records touched across all issues */
        entitiesAffected: number;
        /** Total financial exposure (teaser) */
        totalExposure: string;
    };
    message: string;
}

/** Union type for the latest diagnostics query result data */
export type DiagnosticRunResult = DiagnosticRun | LockedDiagnosticRun;

export interface DiagnosticHistory {
    id: string;
    runAt: Date;
    healthScore: number;
    status: string;
}

export interface RunDiagnosticsRequest {
    connectionId: string;
}