// app/(dashboard)/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

import { Sidebar } from '@/components/layout/Sidebar';
import { UserMenu } from '@/components/layout/UserMenu';
import { EntitySelector } from '@/components/layout/EntitySelector';
import { ConnectionProvider } from '@/lib/contexts/ConnectionContext';

import { ClientProviders } from '@/components/providers/ClientProviders';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClientProviders>
            <DashboardContent>{children}</DashboardContent>
        </ClientProviders>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/sign-in'); // Standard Clerk sign-in path
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
                <div className="p-3 bg-white rounded-2xl shadow-xl border border-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <ConnectionProvider>
            <div className="min-h-screen bg-slate-50 flex">
                {/* Navigation Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:pl-20 transition-all duration-300">
                    {/* Secondary Header / Top Bar */}
                    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
                        <div className="flex items-center gap-6">
                            <EntitySelector />
                            <div className="h-4 w-px bg-gray-100 hidden md:block" />
                            <div className="hidden md:flex items-center gap-4">
                                <div className="h-1 w-8 bg-primary/20 rounded-full" />
                                <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Overview</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <UserMenu user={user} />
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 px-8 py-8 animate-in fade-in duration-500">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ConnectionProvider>
    );
}