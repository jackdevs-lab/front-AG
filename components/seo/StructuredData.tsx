// components/seo/StructuredData.tsx
export function StructuredData() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AuditGen',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: 'Automated QuickBooks error detection, reconciliation review, and ledger cleanup tool for business owners and  professional bookkeepers.',
        url: 'https://www.auditorgen.com',
        offers: {
            '@type': 'Offer',
            price: '39', // ✅ ACTION: Replace with your actual starting price, or '0' for a free tier
            priceCurrency: '£',
        },
        keywords: 'QuickBooks cleanup, month-end close, reconciliation tool, find duplicate invoices, bookkeeping error detection',
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
    );
}