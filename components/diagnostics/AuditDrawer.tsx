'use client';

import React, { useState } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import {
    ExternalLink,
    Copy,
    Check,
    AlertCircle,
    FileText,
    TrendingDown,
    Search,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    ArrowUpRight,
    Activity,
    Info,
} from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { parseMarkdownFindings } from '@/lib/utils/dashboard-helpers';

/**
 * Heuristically derive a concise issue title from the description and type.
 */
function getIssueTitle(type: string, description: string): string {
    const desc = description.toLowerCase();
    if (desc.includes('missing linked transaction')) return 'Missing Linked Transaction';
    if (desc.includes('reimbursement') && (desc.includes('not found') || desc.includes('missing'))) return 'Broken Reimbursement Reference';
    if (desc.includes('orphaned') || desc.includes('no longer exists')) return `Orphaned ${type} Reference`;
    if (desc.includes('mapping') && desc.includes('detached')) return 'Detached Transaction Mapping';
    if (desc.includes('related entity') && desc.includes('missing')) return 'Missing Related Entity';
    if (desc.includes('duplicate')) return 'Duplicate Entry Detected';
    if (desc.includes('mismatch')) return 'Data Integrity Mismatch';
    if (desc.includes('references a transaction id that no longer exists')) return 'Broken Reference Detected';
    
    return `${type} Integrity Exception`;
}

/**
 * Determine risk level based on keywords and dollar amounts.
 */
function getRiskLevel(description: string): 'high' | 'medium' {
    const desc = description.toLowerCase();
    const exposureMatch = desc.match(/\$([\d,.]+)/);
    if (exposureMatch) {
        const amount = parseFloat(exposureMatch[1].replace(/,/g, ''));
        if (amount > 1000) return 'high';
    }
    if (desc.includes('critical') || desc.includes('broken') || desc.includes('orphaned') || desc.includes('mismatch')) {
        return 'high';
    }
    return 'medium';
}

interface FindingItemProps {
    id: string;
    type: string;
    url: string;
    description: string;
}

export function FindingItem({ id, type, url, description }: FindingItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const title = getIssueTitle(type, description);
    const risk = getRiskLevel(description);

    return (
        <div 
            className={cn(
                "group relative bg-white border border-slate-100 rounded-xl transition-all duration-300 overflow-hidden",
                isExpanded ? "shadow-md border-slate-200 ring-1 ring-slate-200/50" : "hover:shadow-sm hover:border-slate-200 shadow-transparent",
                risk === 'high' && !isExpanded && "border-l-4 border-l-red-500 shadow-[0_2px_10px_-4px_rgba(239,68,68,0.15)]"
            )}
        >
            <div 
                className="p-4 cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-[14px] leading-tight tracking-tight">
                                {title}
                            </h3>
                            {risk === 'high' && (
                                <Badge variant="critical" className="h-4 text-[8px] px-1.5 uppercase tracking-[0.1em] font-black">
                                    Critical Exception
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ID:</span>
                                <span className="text-[10px] font-mono font-bold text-slate-600">{id}</span>
                            </div>
                            <Badge variant="outline" className="h-4 text-[9px] uppercase tracking-tighter border-slate-100 text-slate-400 bg-slate-50/30">
                                {type}
                            </Badge>
                            {!isExpanded && (
                                <p className="text-[11px] text-slate-400 truncate max-w-[240px] italic">
                                    {description.split(' — ')[0].split('.')[0]}...
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="shrink-0 pt-1">
                         {isExpanded 
                            ? <ChevronUp className="h-4 w-4 text-slate-400 transition-transform" /> 
                            : <ChevronDown className="h-4 w-4 text-slate-300 transition-transform group-hover:text-slate-400" />
                         }
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="pt-3 border-t border-slate-50/80">
                        <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                            {description}
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4 pt-1">
                         <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">
                                <ShieldAlert className="h-3 w-3" />
                                Verified Incident
                            </div>
                        </div>
                        
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 active:scale-95"
                        >
                            <Activity className="h-3.5 w-3.5" />
                            Inspect in QuickBooks
                            <ArrowUpRight className="h-3 w-3 opacity-70" />
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

interface AuditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    ruleName?: string;
    category?: string;
    message: string;
}

export function AuditDrawer({ isOpen, onClose, ruleName, category, message }: AuditDrawerProps) {
    const { findings, totalExposure, recommendation } = parseMarkdownFindings(message);
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const filteredFindings = findings.filter(f =>
        f.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        f.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        f.type.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

    const copyRecommendation = () => {
        if (!recommendation) return;
        navigator.clipboard.writeText(recommendation);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Sheet
            isOpen={isOpen}
            onClose={onClose}
            title={ruleName || "Audit Investigation"}
            description={category || "Diagnostic Analysis"}
        >
            <div className="space-y-8 pb-12">
                {/* 1. Investigation Status Header */}
                <div className="flex flex-col gap-4 py-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Status</span>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    totalExposure ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                                )} />
                                <span className="text-xs font-black text-slate-900 uppercase">
                                    {totalExposure ? "Integrity Breaches Found" : "System Healthy"}
                                </span>
                            </div>
                        </div>
                        {totalExposure && (
                            <div className="h-10 px-3 rounded-lg bg-red-50 text-red-600 flex items-center gap-2 border border-red-100/50">
                                <TrendingDown className="h-4 w-4" />
                                <span className="text-lg font-mono font-black">{totalExposure}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                                className={cn(
                                    "h-full transition-all duration-1000",
                                    totalExposure ? "bg-red-500 w-[85%]" : "bg-emerald-500 w-full"
                                )}
                            />
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase">Audit Precision: 98%</span>
                    </div>
                </div>

                {/* 2. Investigation Workspace */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Diagnostic Incidents</h4>
                            <div className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black border border-slate-200/50">
                                {filteredFindings.length}
                            </div>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter incidents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium w-32 focus:w-48 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-200"
                                aria-label="Filter audit findings"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredFindings.length > 0 ? (
                            filteredFindings.map((finding, idx) => (
                                <FindingItem key={`${finding.id}-${idx}`} {...finding} />
                            ))
                        ) : (
                            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <div className="p-4 rounded-full bg-slate-100 text-slate-400">
                                    <Activity className="h-8 w-8 opacity-20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-900">No anomalies detected</p>
                                    <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                                        System audit complete. No integrity mismatches found for this rule.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Expert Action Plan */}
                {recommendation && (
                    <div className="pt-8 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                </div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Forensic Action Plan</h4>
                            </div>
                            <button
                                onClick={copyRecommendation}
                                className={cn(
                                    "text-[10px] font-black px-3 py-1.5 rounded-lg transition-all border",
                                    copied 
                                        ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                                        : "text-blue-600 bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 shadow-sm"
                                )}
                                aria-label="Copy recommendation to clipboard"
                            >
                                {copied
                                    ? <><Check className="inline h-3 w-3 mr-1.5" />COPIED</>
                                    : <><Copy className="inline h-3 w-3 mr-1.5" />COPY NOTE</>
                                }
                            </button>
                        </div>
                        <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-sm overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                <Info className="h-16 w-16 rotate-12" />
                            </div>
                            <p className="relative text-[14px] font-medium leading-relaxed italic text-slate-600 z-10">
                                "{recommendation}"
                            </p>
                        </div>
                    </div>
                )}

                {/* 4. Footer Actions */}
                <div className="pt-6 grid grid-cols-1 gap-3">
                    <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl border-slate-200 font-black text-[11px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group"
                    >
                        <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Download Audit Evidence
                    </Button>
                </div>
            </div>
        </Sheet>
    );
}
