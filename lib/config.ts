const getBaseUrl = () => {
    const envUrl = process.env.API_URL;
    if (envUrl) {
        return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    }
    return 'http://localhost:3000/api';
};

export const config = {
    api: {
        baseUrl: getBaseUrl(),
        timeout: 30000,
    },
    auth: {
        tokenKey: 'qbhm_token',
        tenantKey: 'qbhm_tenant',
    },
    QuickBooks: {
        clientId: process.env.NEXT_PUBLIC_QB_CLIENT_ID,
        redirectUri: process.env.NEXT_PUBLIC_QB_REDIRECT_URI,
    },
    polling: {
        healthScore: 300000, // 5 minutes
        syncStatus: 30000,   // 30 seconds
    },
} as const;