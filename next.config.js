/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['appcenter.intuit.com'],
    },
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.auditorgen.com https://challenges.cloudflare.com",
                            "style-src 'self' 'unsafe-inline'",
                            "img-src 'self' data: https:",
                            "font-src 'self' data: https:",
                            "connect-src 'self' https://api-production-f5369.up.railway.app https://*.clerk.accounts.dev https://clerk.auditorgen.com https://api.clerk.com",
                            "frame-src 'self' https://*.clerk.accounts.dev https://clerk.auditorgen.com https://challenges.cloudflare.com https://www.youtube.com",
                            "frame-ancestors 'none'",
                            "base-uri 'self'",
                            "form-action 'self' https://*.clerk.accounts.dev https://clerk.auditorgen.com",
                        ].join('; '),
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains',
                    },
                ],
            },
        ];
    },
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '';

        return [
            {
                source: '/api/:path*',
                destination: `${apiUrl}/api/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;