'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <QueryProvider>
                {children}
            </QueryProvider>
        </AuthProvider>
    );
}
