// DetailedRuleMessage — NESTED PAYWALL REMOVED
//
// This component previously re-checked `activeConnection.isSubscribed` to blur
// the entity table and sidebar insight panel. That was a nested paywall: the
// parent (RulesTable) only renders this component when subscription is ACTIVE,
// so the inner `isSubscribed` guard was both redundant and caused a double-lock
// bug where legitimate subscribers still saw a lock overlay.
//
// Fix: All `isSubscribed` conditionals and SubscriptionButton calls are removed.
// If the modal is open, the user is entitled to see all content.
import React, { useState, useEffect } from 'react';
import { 
    X, 
    FileText, 
    AlertTriangle, 
    Calendar, 
    Hash, 
    DollarSign, 
    Tag, 
    ArrowUpDown,
    Info,
    Clock,
    BarChart2,
    ExternalLink,
    Building2,
    ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DetailedRuleMessageProps {
    message: string;
    entities?: any;
    ruleName?: string;
    ruleId?: string;
    category?: string;
    durationMs?: number;
    entityCount?: number;
    severity?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const cur = (val: any): string => {
    if (val === undefined || val === null) return '—';
    const n = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(n)) return String(val);
    return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function detectSchema(entities: any[]): 'transaction' | 'invoice' | 'mismatch' | 'duplicate' | 'allocation' | 'credit' | 'orphaned' | 'outlier' | 'stat' | 'generic' {
    if (!entities?.length) return 'generic';
    const e = entities[0];
    if ('matchTerm' in e || 'recordCount' in e || ('duplicateAmount' in e)) return 'duplicate';
    if ('diff' in e || ('expected' in e && 'actual' in e) || 'lineItemSum' in e) return 'mismatch';
    if ('totalAmount' in e && 'appliedAmount' in e) return 'allocation';
    if ('creditMemoId' in e || (e.type?.toLowerCase() === 'credit' && 'customer' in e)) return 'credit';
    if ('isOrphan' in e || 'missingLink' in e || 'deletedAccount' in e || e.type?.toLowerCase() === 'orphan') return 'orphaned';
    if ('deviation' in e || 'averageAmount' in e) return 'outlier';
    if ('usagePercentage' in e || 'usageCount' in e) return 'stat';
    if (e.type?.toLowerCase() === 'invoice' || 'balance' in e || 'dueDate' in e) return 'invoice';
    if ('amount' in e || 'transactionId' in e || 'expenseId' in e || 'depositId' in e || 'id' in e) return 'transaction';
    return 'generic';
}

// ─── Table Column Definitions ──────────────────────────────────────────────────

interface ColDef {
    key: string;
    label: string;
    icon: React.ReactNode;
    render: (e: any) => React.ReactNode;
    align?: 'left' | 'right' | 'center';
}

function getColumns(schema: ReturnType<typeof detectSchema>, sampleEntity?: any): ColDef[] {
    const iconCls = 'h-3 w-3 opacity-40';

    switch (schema) {
        case 'transaction':
            return [
                { key: 'id', label: 'ID', icon: <Hash className={iconCls} />, render: e => <span className="font-mono font-bold text-slate-900">{e.id || e.transactionId || e.expenseId || e.depositId || '—'}</span> },
                { key: 'type', label: 'Type', icon: <Tag className={iconCls} />, render: e => <TypeBadge type={e.type || 'Transaction'} /> },
                { key: 'date', label: 'Date', icon: <Calendar className={iconCls} />, render: e => e.date || '—' },
                { key: 'amount', label: 'Amount', icon: <DollarSign className={iconCls} />, render: e => <span className="font-semibold text-slate-900">{cur(e.amount)}</span>, align: 'right' },
                { key: 'name', label: 'Name/Vendor', icon: <Building2 className={iconCls} />, render: e => <span className={cn("text-slate-500", !(e.name || e.vendor || e.payee || e.customer) && "text-rose-500 font-bold italic")}>{e.name || e.vendor || e.payee || e.customer || 'MISSING'}</span> },
                { key: 'account', label: 'Account', icon: <Info className={iconCls} />, render: e => <span className="text-slate-400 italic">{e.account || e.accountName || '—'}</span> },
            ];
        case 'invoice':
            return [
                { key: 'id', label: 'ID', icon: <Hash className={iconCls} />, render: e => <span className="font-mono font-bold text-slate-900">{e.id || e.invoiceId || '—'}</span> },
                { key: 'customer', label: 'Customer', icon: <Building2 className={iconCls} />, render: e => <span className="font-semibold text-slate-900">{e.customer || e.customerName || e.name || '—'}</span> },
                { key: 'date', label: 'Due/Activity', icon: <Calendar className={iconCls} />, render: e => e.dueDate || e.lastActivityDate || e.date || '—' },
                { key: 'account', label: 'Account/Item', icon: <Tag className={iconCls} />, render: e => <span className="text-slate-500 italic">{e.account || e.item || '—'}</span> },
                { key: 'balance', label: 'Balance', icon: <DollarSign className={iconCls} />, render: e => <span className="font-bold text-rose-600">{cur(e.balance ?? e.amount)}</span>, align: 'right' },
            ];
        case 'credit':
            return [
                { key: 'id', label: 'Credit ID', icon: <Hash className={iconCls} />, render: e => <span className="font-mono font-bold text-slate-900">{e.id || e.creditMemoId || '—'}</span> },
                { key: 'customer', label: 'Customer', icon: <Building2 className={iconCls} />, render: e => <span className="font-semibold text-slate-900">{e.customer || '—'}</span> },
                { key: 'date', label: 'Date', icon: <Calendar className={iconCls} />, render: e => e.date || '—' },
                { key: 'amount', label: 'Credit Amount', icon: <DollarSign className={iconCls} />, render: e => <span className="font-bold text-slate-900">{cur(e.amount)}</span>, align: 'right' },
            ];
        case 'allocation':
            return [
                { key: 'id', label: 'Payment ID', icon: <Hash className={iconCls} />, render: e => <span className="font-mono font-bold text-slate-900">{e.id || e.paymentId || '—'}</span> },
                { key: 'date', label: 'Date', icon: <Calendar className={iconCls} />, render: e => e.date || '—' },
                { key: 'total', label: 'Total Amount', icon: <DollarSign className={iconCls} />, render: e => cur(e.totalAmount), align: 'right' },
                { key: 'applied', label: 'Applied', icon: <ArrowUpDown className={iconCls} />, render: e => cur(e.appliedAmount), align: 'right' },
                { key: 'unapplied', label: 'Over-Applied', icon: <DollarSign className={iconCls} />, render: e => <span className="font-bold text-rose-600">{cur(e.unappliedAmount ?? (e.appliedAmount - e.totalAmount))}</span>, align: 'right' },
            ];
        case 'orphaned':
            return [
                { key: 'id', label: 'Record ID', icon: <Hash className={iconCls} />, render: e => <span className="font-mono font-bold text-rose-600">{e.id || e.lineId || e.recordId || '—'}</span> },
                { key: 'parent', label: 'Broken Link', icon: <Tag className={iconCls} />, render: e => <span className="text-slate-500 italic font-medium">{e.missingLink || e.deletedAccount || 'Reference Missing'}</span> },
                { key: 'date', label: 'Date', icon: <Calendar className={iconCls} />, render: e => e.date || '—' },
                { key: 'amount', label: 'Amount', icon: <DollarSign className={iconCls} />, render: e => <span className="font-bold text-slate-900">{cur(e.amount)}</span>, align: 'right' },
            ];
        case 'outlier':
            return [
                { key: 'id', label: 'ID', icon: <Hash className={iconCls} />, render: e => <span className="font-mono font-bold text-slate-900">{e.id || '—'}</span> },
                { key: 'type', label: 'Type', icon: <Tag className={iconCls} />, render: e => e.type || 'Entry' },
                { key: 'amount', label: 'Large Amount', icon: <DollarSign className={iconCls} />, render: e => <span className="font-black text-rose-600 underline decoration-rose-200 underline-offset-4">{cur(e.amount)}</span>, align: 'right' },
                { key: 'avg', label: 'Average', icon: <BarChart2 className={iconCls} />, render: e => <span className="text-slate-400 italic text-[11px]">{cur(e.averageAmount)}</span>, align: 'right' },
                { key: 'dev', label: 'Deviation', icon: <ArrowUpDown className={iconCls} />, render: e => <span className="font-bold text-slate-600">+{e.deviation}x</span>, align: 'center' },
            ];
        case 'stat':
            return [
                { key: 'metric', label: 'Metric', icon: <Tag className={iconCls} />, render: e => <span className="font-bold text-slate-700">{e.metric || 'Usage Monitor'}</span> },
                { key: 'count', label: 'Count', icon: <Hash className={iconCls} />, render: e => <span className="font-mono font-bold text-slate-900">{e.usageCount || e.jeCount || 0}</span>, align: 'center' },
                { key: 'total', label: 'Total Volume', icon: <BarChart2 className={iconCls} />, render: e => e.totalCount || '—', align: 'center' },
                { key: 'percent', label: 'Usage %', icon: <ArrowUpDown className={iconCls} />, render: e => <span className="font-black text-rose-600">{(e.usagePercentage || 0).toFixed(1)}%</span>, align: 'right' },
            ];
        case 'mismatch':
            return [
                { key: 'id', label: 'ID', icon: <Hash className={iconCls} />, render: e => <span className="font-mono font-bold text-slate-900">{e.id || e.transactionId || '—'}</span> },
                { key: 'date', label: 'Date', icon: <Calendar className={iconCls} />, render: e => e.date || '—' },
                { key: 'expected', label: 'Expected', icon: <DollarSign className={iconCls} />, render: e => cur(e.expected), align: 'right' },
                { key: 'actual', label: 'Actual', icon: <DollarSign className={iconCls} />, render: e => cur(e.lineItemSum ?? e.actual), align: 'right' },
                { key: 'diff', label: 'Diff', icon: <ArrowUpDown className={iconCls} />, render: e => <span className="font-bold text-rose-600">{cur(e.diff)}</span>, align: 'right' },
            ];
        case 'duplicate':
            return [
                { key: 'term', label: 'Grouping Key', icon: <Tag className={iconCls} />, render: e => <span className="font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded">"{e.matchTerm || (e.duplicateAmount ? cur(e.duplicateAmount) : '—')}"</span> },
                { key: 'ids', label: 'IDs', icon: <Hash className={iconCls} />, render: e => (e.ids || []).map((id: any) => <span key={id} className="inline-block bg-slate-900 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded shadow-sm mr-1">{id}</span>) },
                { key: 'count', label: 'Records', icon: <BarChart2 className={iconCls} />, render: e => <span className="font-black text-rose-600">{e.recordCount ?? (e.ids?.length) ?? '—'}</span>, align: 'center' },
                { key: 'details', label: 'Matches', icon: <Building2 className={iconCls} />, render: e => <span className="text-slate-500">{e.matchDetails || e.details || 'Multiple matches detected'}</span> },
            ];
        default:
            return Object.keys(sampleEntity || {}).map(k => ({
                key: k,
                label: k.charAt(0).toUpperCase() + k.slice(1),
                icon: null,
                render: (e: any) => <span className="text-slate-700">{String(e[k] ?? '—')}</span>,
            }));
    }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
    return <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.05em] px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-600">{type}</span>;
}

function StatRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 text-slate-400">
                {icon}
                <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-xs font-black text-slate-900">{value}</span>
        </div>
    );
}

// ─── Parse summary ────────────────────────────────────────────────────────────

function extractSummary(message: string): string {
    if (!message) return '';
    const firstPeriod = message.match(/^(.*?\.)(?:\s|$)/);
    const raw = firstPeriod ? firstPeriod[1] : message.split(/\n| \| /)[0];
    return raw.replace(/\s*Samples:.*$/i, '').trim();
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DetailedRuleMessage({
    message,
    entities,
    ruleName = 'Diagnostic Rule',
    ruleId,
    category,
    durationMs,
    entityCount,
    severity,
}: DetailedRuleMessageProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const summary = extractSummary(message);
    const hasEntities = Array.isArray(entities) && entities.length > 0;
    const schema = detectSchema(entities);
    const columns = getColumns(schema, entities?.[0]);
    const totalAffected = entityCount ?? (hasEntities ? entities.length : 0);

    const hasSegments = message.includes(' | ') || message.includes('\n');
    const segments = hasSegments ? message.split(/\n| \| /) : [];
    const previewItems = segments.slice(0, 2).map(s => s.replace(/Samples:\s*/i, '').replace(/\.\.\.\s*\(\+\d+\s*more\)$/i, '').trim()).filter(Boolean);

    return (
        <>
            {/* ── Trigger ── */}
            <div
                className="w-full mt-1 cursor-pointer group space-y-2"
                onClick={() => setIsOpen(true)}
            >
                {summary && (
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight leading-snug whitespace-pre-wrap">{summary}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50/50 px-2.5 py-1 rounded-full whitespace-nowrap ml-4">
                            <FileText className="h-3 w-3" /> OPEN REPORT
                        </div>
                    </div>
                )}
                {!summary && (
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors whitespace-pre-wrap">{message}</div>
                )}
                {previewItems.map((item, i) => (
                    <div key={i} className="text-[11px] font-medium text-slate-500 border-l-2 border-slate-100 pl-3 leading-relaxed whitespace-pre-wrap italic">
                        {item}
                    </div>
                ))}
                {hasEntities && entities.length > 0 && (
                    <div className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 flex items-center gap-1.5 pt-1">
                        <BarChart2 className="h-3 w-3 opacity-50" />
                        {entities.length} records processed
                    </div>
                )}
            </div>

            {/* ── Premium Modal ── */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
                >
                    <div className="bg-white rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200/60 animate-in zoom-in-95 duration-300">
                        
                        {/* ── Minimal Header ── */}
                        <div className="shrink-0 px-8 py-6 flex items-center justify-between bg-white border-b border-slate-100">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-rose-50 rounded-2xl">
                                    <ShieldAlert className="h-6 w-6 text-rose-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{ruleName}</h2>
                                        <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-[10px] font-black border border-rose-100 uppercase tracking-wider">
                                            <div className="h-1 w-1 rounded-full bg-rose-600 animate-pulse" />
                                            FAILED
                                        </div>
                                    </div>
                                    {category && (
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{category}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-3 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all active:scale-95 border border-transparent hover:border-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 flex overflow-hidden min-h-0 bg-white">
                            
                            {/* ── Summary & Table ── */}
                            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                                
                                {summary && (
                                    <div className="shrink-0 mx-8 mt-8 mb-4 border border-rose-100/50 bg-rose-50/20 rounded-2xl px-6 py-5">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-0.5">
                                                <AlertTriangle className="h-5 w-5 text-rose-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-rose-400">Issue Summary</p>
                                                <p className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap">{summary}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto px-8 py-4 min-h-0 relative">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                                            <span>Detailed Findings Breakdown</span>
                                            {hasEntities && <span className="text-slate-200">/</span>}
                                            {hasEntities && <span className="text-blue-600">{entities.length} items found</span>}
                                        </h3>
                                    </div>

                                    {hasEntities ? (
                                        <div className="rounded-2xl border border-slate-100/80 overflow-hidden shadow-sm shadow-slate-100/50">
                                            <table className="w-full text-sm border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-100">
                                                        <th className="w-12 py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">#</th>
                                                        {columns.map(col => (
                                                            <th
                                                                key={col.key}
                                                                className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                                                            >
                                                                <div className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}`}>
                                                                    {col.icon}
                                                                    {col.label}
                                                                </div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {entities.map((entity: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="py-4 px-4 text-[10px] font-bold text-slate-300 tabular-nums">{String(idx + 1).padStart(2, '0')}</td>
                                                            {columns.map(col => (
                                                                <td
                                                                    key={col.key}
                                                                    className={`py-4 px-4 text-xs font-medium whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                                                                >
                                                                    {col.render(entity)}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {segments.map((seg, i) => {
                                                const txt = seg.replace(/Samples:\s*/i, '').replace(/\.\.\.\s*\(\+\d+\s*more\)$/i, '').trim();
                                                if (!txt) return null;
                                                return (
                                                    <div key={i} className="flex items-start gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-slate-200 transition-colors">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200 mt-2 group-hover:bg-blue-400 transition-colors" />
                                                        <span className="text-[13px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{txt}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Sidebar Stats ── */}
                            <div className="w-80 shrink-0 border-l border-slate-100 bg-slate-50/30 flex flex-col">
                                <div className="p-8 space-y-10 overflow-y-auto">
                                    
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contextual Metrics</p>
                                        <div className="space-y-1 divide-y divide-slate-100 border-t border-slate-100">
                                            <StatRow label="Affected Items" value={totalAffected || '—'} icon={<BarChart2 className="h-3.5 w-3.5" />} />
                                            {durationMs && (
                                                <StatRow label="Execution" value={`${durationMs}ms`} icon={<Clock className="h-3.5 w-3.5" />} />
                                            )}
                                            {severity && (
                                                <StatRow label="Severity" value={<span className="text-rose-600">{severity}</span>} icon={<ShieldAlert className="h-3.5 w-3.5" />} />
                                            )}
                                            {ruleId && (
                                                <StatRow label="ID" value={<span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-100">{ruleId}</span>} icon={<Hash className="h-3.5 w-3.5" />} />
                                            )}
                                            <StatRow label="Schema" value={schema} icon={<Tag className="h-3.5 w-3.5" />} />
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-sm shadow-slate-100 relative overflow-hidden">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-1.5 bg-blue-50 rounded-lg">
                                                <Info className="h-3.5 w-3.5 text-blue-500" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Expert Insight</span>
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                                            Inconsistencies detected in this rule usually point to manual journal entries or deleted transactions in the current period.
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-slate-200">
                                        <button 
                                            className="w-full flex items-center justify-between bg-slate-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                                            onClick={() => window.location.href = '/logs'}
                                        >
                                            Investigate Logs
                                            <ExternalLink className="h-4 w-4 opacity-50" />
                                        </button>
                                        <button className="w-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 py-3 transition-colors">
                                            Export Finding Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
