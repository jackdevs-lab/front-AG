import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosError,
    InternalAxiosRequestConfig
} from 'axios';
import { config } from '@/lib/config';

export class ApiClient {
    private client: AxiosInstance;
    private tokenProvider: (() => Promise<string | null>) | null = null;
    private currentTenantId: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: config.api.baseUrl,
            timeout: config.api.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor - add auth token
        this.client.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                // Rely solely on Clerk token provider and currentTenantId
                const token = this.tokenProvider ? await this.tokenProvider() : null;
                const tenantId = this.currentTenantId;

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                if (tenantId) {
                    config.headers['x-tenant-id'] = tenantId;
                }

                return config;
            },
            (error: AxiosError) => Promise.reject(error)
        );

        // Response interceptor - handle errors
        this.client.interceptors.response.use(
            (response) => response.data,
            (error: AxiosError) => {
                if (error.response?.status === 401 && typeof window !== 'undefined') {
                    console.warn('API returned 401 Unauthorized');
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Integrates with Clerk by providing a dynamic token provider.
     * This ensures we always have a fresh JWT for every request.
     */
    setClerkProvider(getToken: () => Promise<string | null>, tenantId: string | null) {
        this.tokenProvider = getToken;
        this.currentTenantId = tenantId;
    }

    clearAuth(): void {
        this.tokenProvider = null;
        this.currentTenantId = null;
    }

    // HTTP methods
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.client.get<T>(url, config) as unknown as Promise<T>;
    }

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.client.post<T>(url, data, config) as unknown as Promise<T>;
    }

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.client.put<T>(url, data, config) as unknown as Promise<T>;
    }

    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.client.patch<T>(url, data, config) as unknown as Promise<T>;
    }

    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.client.delete<T>(url, config) as unknown as Promise<T>;
    }
}

export const api = new ApiClient();
export default api;