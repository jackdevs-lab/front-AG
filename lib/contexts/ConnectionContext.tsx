'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConnections } from '@/lib/hooks/useConnections';
import { Connection } from '@/types/connection';

interface ConnectionContextType {
    selectedConnectionId: string | null;
    setSelectedConnectionId: (id: string | null) => void;
    activeConnection: Connection | null;
    connections: Connection[];
    isLoading: boolean;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
    const { connections, isLoading } = useConnections();
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

    useEffect(() => {
        // Set default connection if none selected
        if (!selectedConnectionId && connections.length > 0) {
            setSelectedConnectionId(connections[0].id);
        }
    }, [connections, selectedConnectionId]);

    const activeConnection = connections.find(c => c.id === selectedConnectionId) || null;

    return (
        <ConnectionContext.Provider value={{
            selectedConnectionId,
            setSelectedConnectionId,
            activeConnection,
            connections,
            isLoading
        }}>
            {children}
        </ConnectionContext.Provider>
    );
}

export function useActiveConnection() {
    const context = useContext(ConnectionContext);
    if (context === undefined) {
        throw new Error('useActiveConnection must be used within a ConnectionProvider');
    }
    return context;
}
