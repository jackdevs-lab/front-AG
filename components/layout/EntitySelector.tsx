'use client';

import { useActiveConnection } from '@/lib/contexts/ConnectionContext';
import { cn } from '@/lib/utils/cn';
import { ChevronDown, Building2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

export function EntitySelector() {
    const { connections, selectedConnectionId, setSelectedConnectionId, activeConnection } = useActiveConnection();

    if (connections.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 px-3 py-1.5 h-auto bg-gray-50/50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-all group"
                >
                    <div className="w-6 h-6 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                        <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Active Entity</span>
                        <span className="text-xs font-black text-gray-900 leading-none">
                            {activeConnection?.companyName || activeConnection?.realmId.slice(0, 8) || 'Select Company'}
                        </span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-2 rounded-2xl border-gray-100 shadow-2xl p-2" align="start">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">
                    Switch Connected Company
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-50" />
                <div className="p-1 space-y-1">
                    {connections.map((connection) => (
                        <DropdownMenuItem
                            key={connection.id}
                            onClick={() => setSelectedConnectionId(connection.id)}
                            className={cn(
                                "rounded-xl py-2 px-3 flex flex-col items-start gap-0.5 cursor-pointer transition-all",
                                selectedConnectionId === connection.id
                                    ? "bg-primary/5 text-primary"
                                    : "hover:bg-gray-50"
                            )}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="font-black text-sm">{connection.companyName || 'Unknown Entity'}</span>
                                {!connection.isSubscribed && (
                                    <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase tracking-tight border border-amber-200">
                                        Pay to Resolve
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">ID: {connection.realmId.slice(0, 12)}...</span>
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
