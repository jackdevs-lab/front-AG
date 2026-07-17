'use client';

import { useConnections } from '@/lib/hooks/useConnections';
import { ConnectQuickBooks } from '@/components/connections/ConnectQuickBooks';
import { ConnectionCard } from '@/components/connections/ConnectionCard';
import { Loader2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ConnectionsPage() {
    const { connections, isLoading, runAudit, refetch } = useConnections();

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to disconnect this QuickBooks account?')) {
            // Delete logic would go here, usually calling an API
            console.log('Delete connection:', id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            {/* Header section with glassmorphism header */}
            <div className="relative overflow-hidden rounded-3xl bg-white/50 backdrop-blur-xl border border-white/20 p-8 shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600">
                            Connections Center
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium max-w-xl">
                            Manage your linked QuickBooks accounts and monitor their synchronization health.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Left side: Action/Add Connection */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-6">
                        <h2 className="text-xl font-bold mb-4 px-1">Link New Account</h2>
                        <ConnectQuickBooks onConnected={refetch} />

                        <div className="mt-6 p-6 rounded-2xl bg-blue-50 border border-blue-100/50">
                            <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white mr-2">i</span>
                                Security Note
                            </h3>
                            <p className="text-xs text-blue-700/80 leading-relaxed font-medium">
                                Your data is protected with 256-bit encryption. We only access financial
                                primitives required for health analysis.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side: List of connections */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold px-1">
                            Active Connections
                            <span className="ml-3 text-sm font-medium text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                                {connections.length}
                            </span>
                        </h2>
                    </div>

                    {connections.length === 0 ? (
                        <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center transition-all hover:border-primary/30 hover:bg-white">
                            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-500">
                                <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No connections yet</h3>
                            <p className="text-muted-foreground mt-2 max-w-xs mx-auto font-medium">
                                Start by linking your first QuickBooks company on the left panel.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {connections.map((connection) => (
                                <ConnectionCard
                                    key={connection.id}
                                    connection={connection}
                                    onRunAudit={runAudit}
                                    onDelete={handleDelete}
                                    onView={(id) => {
                                        // Specific view logic if needed
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
