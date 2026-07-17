'use client';

import React from 'react';
import { Issue, Severity } from '@/types/diagnostic';
import { cn } from '@/lib/utils/cn';

interface EntityFilterBarProps {
    issues: Issue[];
    selectedType: string | null;
    onTypeSelect: (type: string | null) => void;
}

interface AggregatedEntity {
    type: string;
    count: number;
    highestSeverity: Severity;
}

export function EntityFilterBar({ issues, selectedType, onTypeSelect }: EntityFilterBarProps) {
    const aggregation = React.useMemo(() => {
        const map: Record<string, { count: number; highestSeverity: Severity }> = {};

        issues.forEach((issue) => {
            const entities = Array.isArray(issue.entities) ? issue.entities : [];
            entities.forEach((entity: any) => {
                const type = entity.type || 'Other';
                if (!map[type]) {
                    map[type] = { count: 0, highestSeverity: issue.severity };
                }
                map[type].count += 1;
                
                // Severity priority: CRITICAL > WARNING > INFO
                const severityPriority = { 'CRITICAL': 3, 'WARNING': 2, 'INFO': 1 };
                if (severityPriority[issue.severity] > severityPriority[map[type].highestSeverity]) {
                    map[type].highestSeverity = issue.severity;
                }
            });
        });

        return Object.entries(map)
            .map(([type, data]) => ({
                type,
                ...data,
            }))
            .sort((a, b) => b.count - a.count);
    }, [issues]);

    if (aggregation.length === 0) return null;

    return (
        <div className="w-full bg-white/50 backdrop-blur-sm border-y border-slate-100 py-3 overflow-x-auto scrollbar-hide">
            <div className="flex w-max space-x-3 px-4">
                <button
                    onClick={() => onTypeSelect(null)}
                    className={cn(
                        "inline-flex items-center px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 border whitespace-nowrap",
                        selectedType === null
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200"
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                >
                    All Entities
                    <span className={cn(
                        "ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono",
                        selectedType === null ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                        {issues.reduce((sum, i) => sum + (i.entityCount || 0), 0)}
                    </span>
                </button>

                {aggregation.map((entity) => (
                    <button
                        key={entity.type}
                        onClick={() => onTypeSelect(entity.type)}
                        className={cn(
                            "inline-flex items-center px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 border group whitespace-nowrap",
                            selectedType === entity.type
                                ? "bg-[hsl(199,89%,48%)] text-white border-[hsl(199,89%,48%)] shadow-lg shadow-blue-100"
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        )}
                    >
                        {/* Severity Dot */}
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full mr-2.5",
                            entity.highestSeverity === 'CRITICAL' ? "bg-rose-500" :
                            entity.highestSeverity === 'WARNING' ? "bg-amber-500" : "bg-blue-400"
                        )} />
                        
                        {entity.type}
                        
                        <span className={cn(
                            "ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono",
                            selectedType === entity.type 
                                ? "bg-white/20 text-white" 
                                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                        )}>
                            {entity.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

