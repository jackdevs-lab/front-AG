'use client';

import { createContext, useContext } from 'react';

export interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    tenantId: string | null;
    user: any | null;
    login: (token: string, tenantId: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}