// types/api.ts
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}