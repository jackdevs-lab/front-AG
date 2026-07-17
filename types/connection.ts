// types/connection.ts
export interface Connection {
    id: string;
    realmId: string;
    companyName: string | null;
    lastSyncAt: Date | string | null;
    syncStatus: 'IDLE' | 'SYNCING' | 'ERROR';
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;          // Added for the cooldown timer
    lastSyncMessage?: string | null;   // Added to fix the build error
    isSubscribed?: boolean;
    subscriptionStatus?: string;
    totalIssues?: number;
}

export interface ConnectionList {
    success: boolean;
    data: Connection[];
}

export interface AuthUrlResponse {
    success: boolean;
    authUrl: string;
}