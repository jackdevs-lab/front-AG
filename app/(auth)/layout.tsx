import { ClientProviders } from '@/components/providers/ClientProviders';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClientProviders>
            <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
                <div className="w-full max-w-md p-4">
                    {children}
                </div>
            </div>
        </ClientProviders>
    );
}