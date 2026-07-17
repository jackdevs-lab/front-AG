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
        if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
        if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-rose-500" />;
        return <Minus className="h-3.5 w-3.5 text-slate-400" />;
    };

    if (isPlaceholder) {
        return (
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                    <div className="h-5 w-16 bg-slate-100 rounded-full" />
                </div>
                <div className="h-10 w-20 bg-slate-100 rounded mb-4" />
                <div className="h-2 w-full bg-slate-50 rounded-full mb-6" />
                <div className="grid grid-cols-3 gap-2">
                    <div className="h-12 bg-slate-50 rounded-xl" />
                    <div className="h-12 bg-slate-50 rounded-xl" />
                    <div className="h-12 bg-slate-50 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
            {/* Background Accent */}
            <div 
                className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] transition-transform group-hover:scale-110"
                style={{ backgroundColor: color }}
            />

            <div className="relative space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">Health Score</span>
                    </div>
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "text-[10px] font-black uppercase tracking-tight px-2.5 py-0.5 rounded-full border-none",
                            score >= 80 ? "bg-emerald-50 text-emerald-700" : 
                            score >= 60 ? "bg-amber-50 text-amber-700" : 
                            "bg-rose-50 text-rose-700"
                        )}
                    >
                        {label}
                    </Badge>
                </div>

                {/* Main Score Area */}
                <div className="flex items-end justify-between">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-5xl font-mono font-black tracking-tighter tabular-nums" style={{ color }}>
                            {score}
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-400">/100</span>
                    </div>

                    {trend && (
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                            {getTrendIcon()}
                            <span className="text-[11px] font-mono font-black text-slate-700">
                                {previousScore ? `${Math.abs(score - previousScore)} pts` : 'STABLE'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <Progress
                        value={score}
                        className="h-2 bg-slate-100"
                        indicatorClassName={cn(
                            score >= 80 ? 'bg-emerald-500' : 
                            score >= 60 ? 'bg-amber-500' : 
                            'bg-rose-500'
                        )}
                    />
                </div>

                {/* Breakdown Grid */}
                {breakdown && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="flex flex-col p-2.5 rounded-xl bg-emerald-50/30 border border-emerald-100/50 group/item hover:bg-emerald-50/50 transition-colors">
                            <span className="text-[9px] font-black text-emerald-600/70 uppercase tracking-tighter mb-1">Passed</span>
                            <span className="text-sm font-mono font-black text-emerald-700">{breakdown.passedCount}</span>
                        </div>
                        <div className="flex flex-col p-2.5 rounded-xl bg-amber-50/30 border border-amber-100/50 group/item hover:bg-amber-50/50 transition-colors">
                            <span className="text-[9px] font-black text-amber-600/70 uppercase tracking-tighter mb-1">Warning</span>
                            <span className="text-sm font-mono font-black text-amber-700">{breakdown.warningCount}</span>
                        </div>
                        <div className="flex flex-col p-2.5 rounded-xl bg-rose-50/30 border border-rose-100/50 group/item hover:bg-rose-50/50 transition-colors">
                            <span className="text-[9px] font-black text-rose-600/70 uppercase tracking-tighter mb-1">Critical</span>
                            <span className="text-sm font-mono font-black text-rose-700">{breakdown.criticalCount}</span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">
                        Updated {format(lastUpdated, 'MMM d, h:mm a')}
                    </span>
                </div>
            </div>
        </div>
    );
}