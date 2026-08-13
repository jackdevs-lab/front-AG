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
        // Remove trailing slashes from the environment variable just in case
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '';

        return [
            {
                source: '/api/:path*',
                // Add /api back into the destination path
                destination: `${apiUrl}/api/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;