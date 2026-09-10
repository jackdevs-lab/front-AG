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
        this.client.interceptors.request.use(async (config) => {
            if (this.tokenProvider) {
                const token = await this.tokenProvider();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }

            // Pass the tenant ID so your backend context knows which workspace/org this is
            if (this.currentTenantId) {
                config.headers['x-tenant-id'] = this.currentTenantId;
            }

            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        // Response interceptor - handle errors
        this.client.interceptors.response.use(
            (response) => response.data,
            async (error: AxiosError) => {
                // Type assertion to allow custom _retry flag
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

                if (error.response?.status === 401 && typeof window !== 'undefined' && !originalRequest._retry) {
                    originalRequest._retry = true;
                    console.warn('API returned 401. Attempting single token refresh retry...');

                    try {
                        if (this.tokenProvider) {
                            const freshToken = await this.tokenProvider();
                            if (freshToken) {
                                originalRequest.headers.Authorization = `Bearer ${freshToken}`;
                                return this.client(originalRequest); // Retry the request once
                            }
                        }
                    } catch (retryError) {
                        console.error('Token refresh failed on 401 retry', retryError);
                    }
                }

                // Fallback logging if retry wasn't possible or also failed
                if (error.response?.status === 401 && typeof window !== 'undefined') {
                    console.warn('API returned 401 Unauthorized (Final)');
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