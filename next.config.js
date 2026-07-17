// next.config.js
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
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;