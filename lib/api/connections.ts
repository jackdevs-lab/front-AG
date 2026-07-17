import { api } from '@/lib/api/client';
import { Connection, ConnectionList, AuthUrlResponse } from '@/types/connection';

export const connectionsApi = {
    getAuthUrl(tenantId: string): Promise<AuthUrlResponse> {
        return api.get('/qb/auth-url', {
            params: { tenantId }
        });
    },

    list(): Promise<ConnectionList> {
        return api.get('/connections');
    },

    getById(id: string): Promise<{ success: boolean; data: Connection }> {
        return api.get(`/connections/${id}`);
    },

    delete(id: string): Promise<{ success: boolean; message: string }> {
        return api.delete(`/connections/${id}`);
    },

    triggerSync(id: string): Promise<{ success: boolean; jobId: string; message: string }> {
        return api.post(`/connections/${id}/sync`);
    },
    update(id: string, data: { companyName: string }): Promise<{ success: boolean; data: Connection }> {
        return api.patch(`/connections/${id}`, data);
    },
};