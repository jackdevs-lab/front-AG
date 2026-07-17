'use client';

import React, { useState, useEffect } from 'react';
import { AuthContext } from '@/lib/hooks/useAuth';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { api } from '@/lib/api/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { isLoaded: isUserLoaded, user: clerkUser } = useUser();
    const { isLoaded: isAuthLoaded, orgId, userId, getToken } = useClerkAuth();

    const [tenantId, setTenantId] = useState<string | null>(null);
    const [isApiReady, setIsApiReady] = useState(false); // <-- Add readiness state

    useEffect(() => {
        if (isAuthLoaded) {
            const currentTenantId = orgId || userId || null;
            setTenantId(currentTenantId);

            // Wire up the token provider
            api.setClerkProvider(getToken, currentTenantId);
            setIsApiReady(true); // <-- Signal that Axios is ready with the token
        }
    }, [isAuthLoaded, orgId, userId, getToken]);

    const login = (token: string, tenantId: string) => {
        console.warn('Manual login called while Clerk is active. Use Clerk UI instead.');
    };

    const logout = () => {
        console.warn('Manual logout called while Clerk is active. Use Clerk SignOut instead.');
    };

    // FIX: Do not render the application (or React Query hooks) until the API client 
    // is fully loaded and has access to the Clerk token. This prevents the 401 race condition.
    if (!isUserLoaded || !isAuthLoaded || !isApiReady) {
        return null;
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated: !!userId,
            isLoading: false, // We handle loading by returning null above
            tenantId,
            user: clerkUser ? {
                name: clerkUser.fullName || clerkUser.firstName || 'User',
                email: clerkUser.primaryEmailAddress?.emailAddress || ''
            } : null,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}