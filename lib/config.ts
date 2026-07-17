export const config = {
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
        timeout: 30000,
    },
    auth: {
        tokenKey: 'qbhm_token',
        tenantKey: 'qbhm_tenant',
    },
    quickbooks: {
        clientId: process.env.NEXT_PUBLIC_QB_CLIENT_ID,
        redirectUri: process.env.NEXT_PUBLIC_QB_REDIRECT_URI,
    },
    polling: {
        healthScore: 300000, // 5 minutes
        syncStatus: 30000,   // 30 seconds
    },
} as const;