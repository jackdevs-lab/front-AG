import { api } from '@/lib/api/client';
import { DiagnosticRunResult, DiagnosticHistory } from '@/types/diagnostic';
import { AxiosRequestConfig } from 'axios';

export const diagnosticsApi = {
    // Added 'config' parameter
    getLatest(connectionId: string, config?: AxiosRequestConfig): Promise<{
        success: boolean;
        data: DiagnosticRunResult | null;
        message?: string;
    }> {
        return api.get(`/diagnostics/latest/${connectionId}`, config);
    },

    // Added 'config' parameter and merged it
    getHistory(connectionId: string, limit?: number, config?: AxiosRequestConfig): Promise<{
        success: boolean;
        data: DiagnosticHistory[];
    }> {
        return api.get(`/diagnostics/history/${connectionId}`, {
            params: { limit },
            ...config
        });
    },

    // Added 'config' parameter and merged it
    getLogs(connectionId: string, limit?: number, config?: AxiosRequestConfig): Promise<{
        success: boolean;
        data: any[];
    }> {
        return api.get(`/diagnostics/logs/${connectionId}`, {
            params: { limit },
            ...config
        });
    },
};