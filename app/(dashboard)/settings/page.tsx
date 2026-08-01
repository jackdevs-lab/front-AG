'use client';

import { useState } from 'react';
import { useActiveConnection } from '@/lib/contexts/ConnectionContext';
import { useConnections } from '@/lib/hooks/useConnections';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Settings,
    Building2,
    Save,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Database,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function SettingsPage() {
    const { connections, isUpdating, updateConnection } = useConnections();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleStartEdit = (id: string, currentName: string | null) => {
        setEditingId(id);
        setNewName(currentName || '');
        setStatus(null);
    };

    const handleSave = async (id: string) => {
        if (!newName.trim()) return;

        try {
            updateConnection({ id, companyName: newName }, {
                onSuccess: () => {
                    setEditingId(null);
                    setStatus({ type: 'success', message: 'Company name updated successfully' });
                    setTimeout(() => setStatus(null), 3000);
                },
                onError: (err: any) => {
                    setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update name' });
                }
            });
        } catch (err: any) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Settings className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-gray-900">System Settings</h1>
                </div>
                <p className="text-muted-foreground font-medium">Manage your connected QuickBooks accounts and system preferences.</p>
            </div>

            {/* Connection Management Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                        <h2 className="text-lg font-black tracking-tight text-gray-900">Connected Accounts</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Rename or manage your data sources</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {connections.map((connection) => (
                        <Card key={connection.id} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
                            <CardContent className="p-0">
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        {editingId === connection.id ? (
                                            <div className="space-y-3 min-w-[300px]">
                                                <Label htmlFor={`name-${connection.id}`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Display Name</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id={`name-${connection.id}`}
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        className="h-10 rounded-xl border-gray-100 font-bold focus:ring-primary/20"
                                                        placeholder="Enter new company name"
                                                        autoFocus
                                                    />
                                                    <Button
                                                        onClick={() => handleSave(connection.id)}
                                                        disabled={isUpdating}
                                                        className="h-10 rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest px-4 shadow-lg shadow-primary/20"
                                                    >
                                                        {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setEditingId(null)}
                                                        className="h-10 rounded-xl font-bold text-xs"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-black text-gray-900 leading-tight">
                                                    {connection.companyName || 'Unnamed Connection'}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                                        <Database className="h-3 w-3" />
                                                        Realm ID: {connection.realmId}
                                                    </span>
                                                    <div className="h-1 w-1 rounded-full bg-gray-100" />
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                                        <Shield className="h-3 w-3" />
                                                        Status: {connection.isActive ? 'Active' : 'Disconnected'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {editingId !== connection.id && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleStartEdit(connection.id, connection.companyName)}
                                            className="rounded-xl border-gray-100 font-black uppercase text-[10px] tracking-widest h-10 hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                                        >
                                            Rename Account
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {connections.length === 0 && (
                        <Card className="border-dashed border-2 p-12 text-center">
                            <CardContent className="space-y-4">
                                <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                    <Database className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-gray-900">No Connections Found</h3>
                                    <p className="text-xs text-muted-foreground">Connect a QuickBooks account to get started.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Notifications */}
            {status && (
                <div className={cn(
                    "fixed bottom-8 right-8 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300",
                    status.type === 'success' ? "bg-white border-green-100 text-green-700" : "bg-white border-red-100 text-red-700"
                )}>
                    {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span className="text-xs font-black uppercase tracking-widest">{status.message}</span>
                </div>
            )}
        </div>
    );
}
