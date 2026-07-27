'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useConnections } from '@/lib/hooks/useConnections';
import { useLogs } from '@/lib/hooks/useLogs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    Search,
    Filter,
    Clock,
    AlertCircle,
    Info,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';

export default function LogsPage() {
    const { connections, isLoading: connectionsLoading } = useConnections();
    const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
    const [severityFilter, setSeverityFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!selectedConnection && connections.length > 0) {
            setSelectedConnection(connections[0].id);
        }
    }, [connections, selectedConnection]);

    const { data: logs, isLoading: logsLoading } = useLogs(selectedConnection || '');

    const filteredLogs = (logs || []).filter((log: any) => {
        const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.source.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

        return matchesSearch && matchesSeverity;
    });

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-100';
            case 'ERROR': return 'text-red-600 bg-red-50 border-red-100';
            case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
            case 'INFO': return 'text-blue-600 bg-blue-50 border-blue-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
            case 'ERROR': return <AlertCircle className="h-3 w-3" />;
            case 'WARNING': return <AlertTriangle className="h-3 w-3" />;
            case 'INFO': return <Info className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

    if (connectionsLoading) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <h1 className="text-2xl font-black tracking-tighter text-gray-900 leading-none">
                            System Event Logs
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50/50 p-1 rounded-2xl border border-gray-100 w-fit">
                        {connections.map((connection) => (
                            <button
                                key={connection.id}
                                onClick={() => setSelectedConnection(connection.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black transition-all duration-300 uppercase tracking-widest leading-none",
                                    selectedConnection === connection.id
                                        ? "bg-white text-primary shadow-sm border border-primary/10"
                                        : "text-muted-foreground hover:text-gray-900 hover:bg-white/50"
                                )}
                            >
                                {connection.companyName || connection.realmId.slice(0, 8)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 bg-white border-gray-100 rounded-xl text-xs font-bold"
                        />
                    </div>
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                        {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
                            <button
                                key={sev}
                                onClick={() => setSeverityFilter(sev)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    severityFilter === sev
                                        ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                                        : "text-muted-foreground hover:text-gray-600"
                                )}
                            >
                                {sev}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-50">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 w-[180px]">Timestamp</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 w-[120px]">Severity</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 w-[200px]">Source</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4">Message</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logsLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/20" />
                                </TableCell>
                            </TableRow>
                        ) : filteredLogs.length > 0 ? (
                            filteredLogs.map((log: any) => (
                                <TableRow key={log.id} className="border-gray-50 hover:bg-gray-50/50 group">
                                    <TableCell className="py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-900">
                                                {format(new Date(log.timestamp), 'MMM d, yyyy')}
                                            </span>
                                            <span className="text-[10px] font-bold text-muted-foreground">
                                                {format(new Date(log.timestamp), 'h:mm:ss a')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
                                            getSeverityStyles(log.severity)
                                        )}>
                                            {getSeverityIcon(log.severity)}
                                            {log.severity}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="text-xs font-black text-gray-700 tracking-tight">
                                            {log.source}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <p className="text-xs font-bold text-muted-foreground group-hover:text-gray-900 transition-colors leading-relaxed">
                                            {log.message}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200 border border-gray-100">
                                            <Filter className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-gray-900">No events found</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Adjust filters or search query</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
