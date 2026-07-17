'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Issue } from '@/types/diagnostic';
import { AlertCircle, CheckCircle, ChevronRight, ExternalLink, ShieldCheck, Scale, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface IssueListProps {
    issues: Issue[];
    onResolve?: (issueId: string) => void;
    onViewDetails?: (issue: Issue) => void;
    showActions?: boolean;
}

export function IssueList({
    issues,
    onResolve,
    onViewDetails,
    showActions = true
}: IssueListProps) {
    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return <Badge variant="critical">Critical</Badge>;
            case 'WARNING':
                return <Badge variant="warning">Warning</Badge>;
            case 'INFO':
                return <Badge variant="info">Info</Badge>;
            default:
                return <Badge variant="secondary">{severity}</Badge>;
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return <AlertCircle className="h-4 w-4 text-danger" />;
            case 'WARNING':
                return <AlertCircle className="h-4 w-4 text-warning" />;
            default:
                return <CheckCircle className="h-4 w-4 text-info" />;
        }
    };

    if (issues.length === 0) {
        return (
            <Card className="border-success/20 bg-success/5 shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="p-2 bg-success/10 rounded-full">
                        <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-success font-heading tracking-tight">Company Health Snapshot</h3>
                        <p className="text-xs text-success/80 font-medium">All financial hygiene rules are currently passing.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Detected Issues ({issues.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {issues.map((issue) => (
                        <div
                            key={issue.id}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className="mt-0.5">
                                {getSeverityIcon(issue.severity)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {getSeverityBadge(issue.severity)}
                                    <span className="text-sm font-medium">{issue.ruleName}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {issue.message}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span>{issue.entityCount || (Array.isArray(issue.entities) ? issue.entities.length : 0)} affected record(s)</span>
                                    <span>•</span>
                                    <span>{format(new Date(issue.createdAt), 'MMM d')}</span>
                                </div>

                                {/* Detailed Entities Display */}
                                {issue.entities && Array.isArray(issue.entities) && (
                                    <div className="mt-3 space-y-2">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                            Affected Records Breakdown
                                        </div>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {issue.entities.map((entity: any, idx: number) => (
                                                <div 
                                                    key={idx}
                                                    className="text-xs p-2 rounded bg-muted/30 border border-border/50 flex flex-col gap-1"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-foreground/80">
                                                            {entity.type}: {entity.key}
                                                        </span>
                                                        <Badge variant="outline" className="text-[9px] h-4 px-1">
                                                            {entity.count} duplicates
                                                        </Badge>
                                                    </div>
                                                    {entity.names && (
                                                        <div className="text-[10px] text-muted-foreground italic">
                                                            {entity.names.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {showActions && (
                                <div className="flex items-center gap-2">
                                    {onResolve && !issue.isResolved && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onResolve(issue.id)}
                                            className="h-8"
                                        >
                                            Resolve
                                        </Button>
                                    )}
                                    {onViewDetails && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onViewDetails(issue)}
                                            className="h-8 w-8"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}