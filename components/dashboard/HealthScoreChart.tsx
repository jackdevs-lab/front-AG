'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { format, isLastDayOfMonth } from 'date-fns';
import { useMemo } from 'react';

interface ChartData {
    date: Date;
    score: number;
    runId: string;
}

interface HealthScoreChartProps {
    data: ChartData[];
    days?: number;
    companyName?: string;
}

export function HealthScoreChart({ data, days = 30, companyName }: HealthScoreChartProps) {
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [data]);

    const chartData = useMemo(() => {
        return sortedData.map(item => ({
            ...item,
            dateLabel: format(item.date, 'MMM d'),
            isMonthEnd: isLastDayOfMonth(item.date),
        }));
    }, [sortedData]);

    const monthEndDates = useMemo(() => {
        return chartData.filter(d => d.isMonthEnd).map(d => d.dateLabel);
    }, [chartData]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            const score = payload[0].value;
            return (
                <div className="rounded-lg border bg-white p-2 shadow-lg border-slate-200">
                    <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1">{label}</p>
                    <p className="text-sm font-mono font-black" style={{
                        color: score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626'
                    }}>
                        {score}.00
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="flex flex-row items-center justify-between py-3 px-4 border-b border-slate-50 bg-slate-50/30">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {companyName ? `${companyName} Health Performance` : 'Ledger Health Performance'}
                </span>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Feed</span>
                </div>
            </div>
            <div className="p-4">
                <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="dateLabel"
                                fontSize={9}
                                fontWeight={800}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#94a3b8', fontFamily: 'monospace' }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                domain={[0, 100]}
                                fontSize={9}
                                fontWeight={800}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#94a3b8', fontFamily: 'monospace' }}
                                ticks={[0, 25, 50, 75, 100]}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />

                            {/* Month End Reference Lines */}
                            {monthEndDates.map(date => (
                                <ReferenceLine
                                    key={date}
                                    x={date}
                                    stroke="#e2e8f0"
                                    strokeDasharray="3 3"
                                    label={{
                                        position: 'top',
                                        value: 'EOY',
                                        fill: '#cbd5e1',
                                        fontSize: 8,
                                        fontWeight: 900
                                    }}
                                />
                            ))}

                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#0284c7"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#0284c7', strokeWidth: 0 }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}