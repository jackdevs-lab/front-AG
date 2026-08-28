'use client';

import React, { useState } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import {
    Copy,
    Check,
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
                "group relative bg-white border-b border-zinc-100 transition-all duration-200 overflow-hidden first:border-t",
                isExpanded ? "bg-zinc-50/50" : "hover:bg-zinc-50/30"
            )}
        >
            <div
                className="py-4 px-2 cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-zinc-900 text-xs tracking-tight">
                                {title}
                            </h3>
                            {risk === 'high' && (
                                <Badge variant="critical" className="h-4 text-[8px] px-1.5 uppercase tracking-wider font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                                    Critical Exception
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-zinc-100/60 border border-zinc-200/50">
                                <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-tighter">ID:</span>
                                <span className="text-[10px] font-mono font-medium text-zinc-600">{id}</span>
                            </div>
                            <span className="text-[10px] font-medium text-zinc-400 uppercase">
                                {type}
                            </span>
                            {!isExpanded && (
                                <p className="text-[11px] text-zinc-400 truncate max-w-[240px]">
                                    {description.split(' — ')[0].split('.')[0]}...
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 pt-1">
                        {isExpanded
                            ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400 transition-transform" />
                            : <ChevronDown className="h-3.5 w-3.5 text-zinc-300 transition-transform group-hover:text-zinc-400" />
                        }
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-2 pb-4 pt-1 space-y-4 animate-in fade-in duration-150">
                    <div className="pt-2 border-t border-zinc-100">
                        <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                            {description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 uppercase tracking-wider bg-emerald-50/80 border border-emerald-100 px-2 py-1 rounded-md">
                            <ShieldAlert className="h-3 w-3 text-emerald-600" />
                            Verified Incident
                        </div>

                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            <Activity className="h-3 w-3 text-white" />
                            <span>QuickBooks</span>
                            <ArrowUpRight className="h-3 w-3 opacity-90 text-white" />
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
    connectionId?: string;
}

export function AuditDrawer({ isOpen, onClose, ruleName, category, message, connectionId }: AuditDrawerProps) {
    const { findings, totalExposure, recommendation } = parseMarkdownFindings(message);
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const handleDownloadPDF = async () => {
        if (!connectionId) {
            alert('Cannot download PDF: Missing connection ID.');
            return;
        }

        try {
            // Dynamically apply the backend URL if it exists in the environment
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const response = await fetch(`${baseUrl}/api/pdf/${connectionId}`);

            if (!response.ok) {
                // Attempt to parse the error message sent from your Express error-handler
                let errorMessage = `Download failed with status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    // If response isn't JSON, fallback to standard text
                    console.warn('Could not parse backend error as JSON');
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qb-health-report-${connectionId.slice(0, 8)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error: any) {
            console.error('Error downloading PDF:', error);
            // Expose the error to the user (replace alert with your toast/notification component if you have one)
            alert(`PDF Generation Failed: ${error.message}`);
        }
    };
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
            <div className="space-y-6 pb-12">
                {/* Minimalist Status Bar */}
                <div className="flex items-center justify-between py-4 border-b border-zinc-200">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Risk Status</span>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                totalExposure ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                            )} />
                            <span className="text-xs font-semibold text-zinc-900 uppercase">
                                {totalExposure ? "Integrity Breaches Found" : "System Healthy"}
                            </span>
                        </div>
                    </div>

                    {totalExposure && (
                        <div className="h-8 px-2.5 rounded-lg bg-rose-50 text-rose-600 flex items-center gap-1.5 border border-rose-100 text-xs font-mono font-medium">
                            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                            <span>{totalExposure}</span>
                        </div>
                    )}
                </div>

                {/* Diagnostic Incidents List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Diagnostic Incidents</h4>
                            <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-mono font-medium">
                                {filteredFindings.length}
                            </span>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Filter incidents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1 bg-transparent border border-zinc-200 rounded-lg text-xs font-normal w-32 focus:w-48 transition-all focus:outline-none focus:border-zinc-400 text-zinc-900 placeholder:text-zinc-400"
                                aria-label="Filter audit findings"
                            />
                        </div>
                    </div>

                    <div className="space-y-0">
                        {filteredFindings.length > 0 ? (
                            filteredFindings.map((finding, idx) => (
                                <FindingItem key={`${finding.id}-${idx}`} {...finding} />
                            ))
                        ) : (
                            <div className="py-16 text-center space-y-1 border-y border-zinc-100">
                                <p className="text-xs font-semibold text-zinc-900 uppercase">No Anomalies Detected</p>
                                <p className="text-[11px] text-zinc-500">
                                    System audit complete. No integrity mismatches found.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Forensic Action Plan */}
                {recommendation && (
                    <div className="pt-4 border-t border-zinc-200 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Action Plan</h4>
                            <button
                                onClick={copyRecommendation}
                                className={cn(
                                    "text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all border",
                                    copied
                                        ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                                        : "text-zinc-600 bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                )}
                                aria-label="Copy recommendation to clipboard"
                            >
                                {copied
                                    ? <><Check className="inline h-3 w-3 mr-1 text-emerald-600" />COPIED</>
                                    : <><Copy className="inline h-3 w-3 mr-1" />COPY NOTE</>
                                }
                            </button>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60">
                            <p className="text-xs font-normal leading-relaxed italic text-zinc-600">
                                "{recommendation}"
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer Action */}
                <div className="pt-2">
                    <Button
                        variant="outline"
                        onClick={handleDownloadPDF}
                        className="w-full h-10 rounded-xl border-zinc-200 font-semibold text-xs uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-all shadow-none"
                    >
                        <FileText className="h-3.5 w-3.5 mr-2" />
                        Download Audit Report (PDF)
                    </Button>
                </div>
            </div>
        </Sheet>
    );
}