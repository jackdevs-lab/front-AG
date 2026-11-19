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
    // Added for teaser table display
    exposureAmount?: number;
    currency?: string;
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
 * Now includes the 'issues' array as teaser data to populate the findings table.
 */
export interface LockedDiagnosticRun {
    locked: true;
    runId: string;
    runAt: Date;
    meta: {
        healthScore: number | null;
        criticalCount: number;
        warningCount: number;
        infoCount: number;
        entitiesAffected: number;
        totalExposure: string;
    };
    message: string;
    issues: Issue[];
    checks: DiagnosticCheck[];
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