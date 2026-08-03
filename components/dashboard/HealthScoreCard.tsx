'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface HealthScoreCardProps {
    score: number;
    label: string;
    color: string;
    lastUpdated: Date;
    breakdown?: {
        passedCount: number;
        warningCount: number;
        criticalCount: number;
        totalRules: number;
    };
    trend?: 'up' | 'down' | 'stable';
    previousScore?: number;
    isPlaceholder?: boolean;
}

export function HealthScoreCard({
    score,
    label,
    color,
    lastUpdated,
    breakdown,
    trend,
    previousScore,
    isPlaceholder = false,
}: HealthScoreCardProps) {
    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
        if (trend === 'down') return <TrendingDown className="h-4 w-4 text-rose-500" />;
        return <Minus className="h-4 w-4 text-slate-400" />;
    };

    if (isPlaceholder) {
        return (
            <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-pulse min-h-[160px]">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                    <div className="h-5 w-16 bg-slate-100 rounded-full" />
                </div>
                <div className="h-8 w-20 bg-slate-100 rounded mb-4" />
                <div className="h-1.5 w-full bg-slate-50 rounded-full mb-6" />
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-8 bg-slate-50 rounded" />
                    <div className="h-8 bg-slate-50 rounded" />
                    <div className="h-8 bg-slate-50 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[160px] flex flex-col justify-between">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-sm font-medium">Health Score</span>
                    </div>
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-xs font-medium px-2.5 py-0.5 rounded-full border-none",
                            score >= 80 ? "bg-emerald-50 text-emerald-700" :
                                score >= 60 ? "bg-amber-50 text-amber-700" :
                                    "bg-rose-50 text-rose-700"
                        )}
                    >
                        {label}
                    </Badge>
                </div>

                {/* Main Score Area */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-end justify-between">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-semibold tracking-tight" style={{ color }}>
                                {score}
                            </span>
                            <span className="text-sm font-medium text-slate-400">/100</span>
                        </div>

                        {trend && (
                            <div className="flex items-center gap-1.5">
                                {getTrendIcon()}
                                <span className="text-xs font-medium text-slate-600">
                                    {previousScore ? `${Math.abs(score - previousScore)} pts` : 'Stable'}
                                </span>
                            </div>
                        )}
                    </div>

                    <Progress
                        value={score}
                        className="h-1.5 bg-slate-100"
                        indicatorClassName={cn(
                            score >= 80 ? 'bg-emerald-500' :
                                score >= 60 ? 'bg-amber-500' :
                                    'bg-rose-500'
                        )}
                    />
                </div>

                {/* Breakdown Grid */}
                {breakdown && (
                    <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 mb-1">Passed</span>
                            <span className="text-base font-semibold text-slate-900">{breakdown.passedCount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 mb-1">Warning</span>
                            <span className="text-base font-semibold text-amber-600">{breakdown.warningCount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 mb-1">Critical</span>
                            <span className="text-base font-semibold text-rose-600">{breakdown.criticalCount}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="pt-4 mt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                    Updated {format(lastUpdated, 'MMM d, h:mm a')}
                </span>
            </div>
        </div>
    );
}