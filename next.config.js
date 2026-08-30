/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['appcenter.intuit.com'],
    },
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
    async rewrites() {
        const apiUrl = process.env.API_URL?.replace(/\/+$/, '') || '';

        return [
            {
                source: '/api/:path*',
                destination: `${apiUrl}/api/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;