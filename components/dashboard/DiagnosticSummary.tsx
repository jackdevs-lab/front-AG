'use client';

import { DiagnosticCheck, Issue } from '@/types/diagnostic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, Activity, Scale, FileText, Landmark, FileWarning, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DetailedRuleMessage } from '@/components/diagnostics/DetailedRuleMessage';

interface DiagnosticSummaryProps {
    checks: DiagnosticCheck[];
    issues?: Issue[];
}

export function DiagnosticSummary({ checks, issues = [] }: DiagnosticSummaryProps) {
    if (!checks || checks.length === 0) return null;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PASSED':
                return <CheckCircle2 className="h-5 w-5 text-success" />;
            case 'WARNING':
                return <AlertTriangle className="h-5 w-5 text-warning" />;
            case 'FAILED':
                return <XCircle className="h-5 w-5 text-danger" />;
            default:
                return <Activity className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        const normalized = category.toUpperCase();
        switch (normalized) {
            case 'HYGIENE & DATA QUALITY':
                return <ShieldCheck className="h-4 w-4" />;
            case 'BALANCE & LEDGER':
                return <Scale className="h-4 w-4" />;
            case 'BANKING':
                return <Landmark className="h-4 w-4" />;
            case 'WORKFLOW':
                return <Activity className="h-4 w-4" />;
            case 'AR RULES':
                return <FileWarning className="h-4 w-4" />;
            case 'AP RULES':
                return <Receipt className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const groupedChecks = checks.reduce((acc, check) => {
        if (!acc[check.category]) {
            acc[check.category] = [];
        }
        acc[check.category].push(check);
        return acc;
    }, {} as Record<string, DiagnosticCheck[]>);

    return (
        <div className="space-y-6 w-full">
            <div className="space-y-8">
                {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
                    <Card key={category} className="overflow-hidden shadow-sm border-muted/60">
                        <CardHeader className="bg-muted/10 pb-4 border-b">
                            <CardTitle className="text-base font-extrabold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                {getCategoryIcon(category)}
                                {category}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {categoryChecks.map((check) => (
                                    <div 
                                        key={check.id} 
                                        className={cn(
                                            "flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 hover:shadow-md",
                                            check.status === 'PASSED' ? "bg-success/5 border-success/10 shadow-success/5" : 
                                            check.status === 'WARNING' ? "bg-warning/5 border-warning/10 shadow-warning/5" : 
                                            "bg-danger/5 border-danger/10 shadow-danger/5"
                                        )}
                                    >
                                        <div className="mt-1">
                                            {getStatusIcon(check.status)}
                                        </div>
                                        
                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <h4 className="font-bold text-sm leading-tight flex flex-wrap items-center gap-2 text-foreground/90">
                                                    <span>{check.ruleName}</span>
                                                </h4>
                                                {check.durationMs && (
                                                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 whitespace-nowrap bg-muted/50 px-2 py-0.5 rounded-full">
                                                        <Clock className="h-3 w-3" />
                                                        {check.durationMs}ms
                                                    </span>
                                                )}
                                            </div>
                                            <p className={cn(
                                                "text-sm font-medium",
                                                check.status === 'PASSED' ? "text-success/80" : 
                                                check.status === 'WARNING' ? "text-warning/90" : 
                                                "text-danger/90"
                                            )}>
                                                <DetailedRuleMessage 
                                                    message={check.message || (check.status === 'PASSED' ? 'Check passed successfully.' : 'No details available.')} 
                                                    entities={issues.filter(i => i.ruleId === check.ruleId).flatMap(i => i.entities || [])}
                                                    ruleName={check.ruleName}
                                                    ruleId={check.ruleId}
                                                    category={check.category}
                                                    durationMs={check.durationMs}
                                                    severity={issues.find(i => i.ruleId === check.ruleId)?.severity}
                                                    entityCount={issues.filter(i => i.ruleId === check.ruleId).reduce((sum, i) => sum + (i.entityCount || 0), 0)}
                                                />
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
