// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'QuickBooks Health Monitor',
    description: 'Monitor and improve your QuickBooks bookkeeping health',
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
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}