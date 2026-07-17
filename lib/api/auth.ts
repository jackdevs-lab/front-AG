import api from '@/lib/api/client';
import { ApiResponse } from '@/types/api';

export interface LoginResponse {
    token: string;
    tenantId: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export const authApi = {
    login: async (credentials: any) => {
        // We use a regular post here. 
        // If the backend expects form-data, we can adjust later.
        return api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    },
    
    me: async () => {
        return api.get<ApiResponse<any>>('/auth/me');
    }
};
