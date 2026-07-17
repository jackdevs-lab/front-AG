import { describe, it, expect } from 'vitest';
import { calculateTrend, formatHistoryForChart, getDashboardMetrics } from './dashboard-helpers';
import { DiagnosticHistory, DiagnosticRun } from '@/types/diagnostic';

describe('dashboard-helpers', () => {
    describe('calculateTrend', () => {
        it('should return undefined when history has less than 2 runs', () => {
            const history: DiagnosticHistory[] = [
                { id: '1', runAt: new Date('2024-01-01T00:00:00Z'), healthScore: 80, status: 'COMPLETED' }
            ];
            const result = calculateTrend(history);
            expect(result.trend).toBeUndefined();
            expect(result.previousScore).toBeUndefined();
        });

        it('should return "up" when score increased', () => {
            const history: DiagnosticHistory[] = [
                { id: '1', runAt: new Date('2024-01-01T00:00:00Z'), healthScore: 80, status: 'COMPLETED' },
                { id: '2', runAt: new Date('2024-01-02T00:00:00Z'), healthScore: 90, status: 'COMPLETED' }
            ];
            const result = calculateTrend(history);
            expect(result.trend).toBe('up');
            expect(result.previousScore).toBe(80);
        });

        it('should return "down" when score decreased', () => {
            const history: DiagnosticHistory[] = [
                { id: '1', runAt: new Date('2024-01-01T00:00:00Z'), healthScore: 80, status: 'COMPLETED' },
                { id: '2', runAt: new Date('2024-01-02T00:00:00Z'), healthScore: 70, status: 'COMPLETED' }
            ];
            const result = calculateTrend(history);
            expect(result.trend).toBe('down');
            expect(result.previousScore).toBe(80);
        });

        it('should return "stable" when score is the same', () => {
            const history: DiagnosticHistory[] = [
                { id: '1', runAt: new Date('2024-01-01T00:00:00Z'), healthScore: 80, status: 'COMPLETED' },
                { id: '2', runAt: new Date('2024-01-02T00:00:00Z'), healthScore: 80, status: 'COMPLETED' }
            ];
            const result = calculateTrend(history);
            expect(result.trend).toBe('stable');
            expect(result.previousScore).toBe(80);
        });
    });

    describe('formatHistoryForChart', () => {
        it('should format history for chart correctly', () => {
            const history: DiagnosticHistory[] = [
                { id: '1', runAt: new Date('2024-01-01T00:00:00Z'), healthScore: 80, status: 'COMPLETED' }
            ];
            const result = formatHistoryForChart(history);
            expect(result).toHaveLength(1);
            expect(result[0].score).toBe(80);
            expect(result[0].date).toBeInstanceOf(Date);
            expect(result[0].runId).toBe('1');
        });
    });

    describe('getDashboardMetrics', () => {
        it('should return empty array when no latestRun provided', () => {
            const result = getDashboardMetrics(null);
            expect(result).toEqual([]);
        });

        it('should return metrics correctly when latestRun provided', () => {
            const latestRun: any = {
                runAt: new Date('2024-01-01T12:00:00Z'),
                checks: [
                    { status: 'FAILED' },
                    { status: 'PASSED' },
                    { status: 'PASSED' }
                ]
            };
            const result = getDashboardMetrics(latestRun);
            expect(result).toHaveLength(3);
            expect(result[0].label).toBe('Total Rules');
            expect(result[0].value).toBe(3);
            expect(result[1].label).toBe('Failing Rules');
            expect(result[1].value).toBe(1);
        });
    });
});
