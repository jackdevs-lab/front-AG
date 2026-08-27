'use client';

import React from 'react';
import { Issue, Severity } from '@/types/diagnostic';
import { cn } from '@/lib/utils/cn';

interface EntityFilterBarProps {
    issues: Issue[];
    selectedType: string | null;
    onTypeSelect: (type: string | null) => void;
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
        <div className="w-full py-2 overflow-x-auto scrollbar-hide border-b border-zinc-200 pb-3">
            <div className="flex w-max space-x-2">
                <button
                    onClick={() => onTypeSelect(null)}
                    className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap",
                        selectedType === null
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                    )}
                >
                    All Entities
                    <span className={cn(
                        "ml-2 px-1.5 py-0.2 rounded text-[10px] font-mono",
                        selectedType === null ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                    )}>
                        {issues.reduce((sum, i) => sum + (i.entityCount || 0), 0)}
                    </span>
                </button>

                {aggregation.map((entity) => (
                    <button
                        key={entity.type}
                        onClick={() => onTypeSelect(entity.type)}
                        className={cn(
                            "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all border group whitespace-nowrap",
                            selectedType === entity.type
                                ? "bg-zinc-900 text-white border-zinc-900"
                                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                    >
                        {/* Severity Dot */}
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full mr-2",
                            entity.highestSeverity === 'CRITICAL' ? "bg-rose-500" :
                                entity.highestSeverity === 'WARNING' ? "bg-amber-500" : "bg-blue-400"
                        )} />

                        {entity.type}

                        <span className={cn(
                            "ml-2 px-1.5 py-0.2 rounded text-[10px] font-mono",
                            selectedType === entity.type
                                ? "bg-white/20 text-white"
                                : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                        )}>
                            {entity.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}