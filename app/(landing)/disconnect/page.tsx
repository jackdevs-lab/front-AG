import { CheckCircle2, ShieldCheck, ArrowRight, Database } from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';

export default function QuickBooksDisconnectedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white p-10 rounded-xl shadow-md text-center">

                {/* App Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16">
                    <img
                        src="/icon.png"
                        alt="Audit Gen"
                        className="h-16 w-16 object-contain"
                    />
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                    QuickBooks Disconnected
                </h2>

                <div className="text-sm text-gray-600 space-y-4">
                    <p>
                        Your QuickBooks Online OAuth tokens have been successfully invalidated. <strong>Audit Gen</strong> no longer has access to your QuickBooks data.
                    </p>
                    <p>
                        If you disconnected by mistake or wish to reconnect your company, please log in to your Audit Gen account, navigate to your <strong>Connections</strong> dashboard, and click the "Connect to QuickBooks" button to reauthorize the application.
                    </p>
                </div>

                <div className="pt-4">
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-md font-medium hover:bg-zinc-800 transition-colors">
                            Sign Up for Audit Gen <ArrowRight className="h-4 w-4" />
                        </button>
                    </SignUpButton>
                </div>

            </div>
        </div>
    );
}