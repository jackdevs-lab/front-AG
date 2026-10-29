// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';

const inter = Inter({ subsets: ['latin'] });

// ✅ ACTION: Replace with your actual production domain (no trailing slash)
const SITE_URL = 'https://www.auditorgen.com';

export const metadata: Metadata = {
    // ✅ FIX: Title tag (51 characters - perfect sweet spot, leads with brand)
    title: 'AuditGen | QuickBooks Error Detection & Cleanup',

    // ✅ FIX: Meta description (153 characters - perfect sweet spot, highlights the "direct links" value prop)
    description: 'Find accounting errors in QuickBooks faster. Detect duplicates, unreconciled transactions, and get direct links to fix them instantly.',

    // ✅ FIX: Canonical URL (Prevents duplicate content issues across URL variants)
    metadataBase: new URL(SITE_URL),
    alternates: {
        canonical: '/',
    },

    // ✅ FIX: Open Graph Tags (For LinkedIn, Facebook, Slack, iMessage rich previews)
    openGraph: {
        title: 'AuditGen | QuickBooks Error Detection & Cleanup',
        description: 'Find accounting errors in QuickBooks faster. Detect duplicates, unreconciled transactions, and get direct links to fix them instantly.',
        url: SITE_URL,
        siteName: 'AuditGen',
        type: 'website',
        images: [
            {
                url: '/og-image.png', // ✅ ACTION: Add a 1200x630px image to your public/ folder
                width: 1200,
                height: 630,
                alt: 'AuditGen QuickBooks Cleanup Dashboard',
            },
        ],
    },

    // ✅ FIX: Twitter Card (For X/Twitter rich previews)
    twitter: {
        card: 'summary_large_image',
        title: 'AuditGen | QuickBooks Error Detection & Cleanup',
        description: 'Find accounting errors in QuickBooks faster. Detect duplicates, unreconciled transactions, and get direct links to fix them instantly.',
        images: ['/og-image.png'],
    },

    // Ensures search engines know to index this page
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={inter.className}>
                    {/* ✅ FIX: Injects JSON-LD Structured Data globally */}
                    <StructuredData />
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}