'use client';

import React from 'react';

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto animate-pulse">
            {/* KPI Header Row Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-40 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-4 w-24 bg-slate-100 rounded" />
                            <div className="h-4 w-4 bg-slate-100 rounded" />
                        </div>
                        <div className="h-10 w-20 bg-slate-100 rounded mb-4" />
                        <div className="h-2 w-full bg-slate-50 rounded-full mb-4" />
                        <div className="grid grid-cols-3 gap-2">
                            <div className="h-10 bg-slate-50 rounded-xl" />
                            <div className="h-10 bg-slate-50 rounded-xl" />
                            <div className="h-10 bg-slate-50 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Findings Section Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="h-3 w-32 bg-slate-100 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-5 border-b border-slate-100 last:border-0 flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-4 w-48 bg-slate-100 rounded" />
                                <div className="h-2.5 w-24 bg-slate-50 rounded" />
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-50" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
