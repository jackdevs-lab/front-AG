import { ArrowRight } from 'lucide-react';
import { SignInButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function QuickBooksDisconnectedPage() {
    // Check the user's authentication state asynchronously on the server
    const { userId } = await auth();

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
                        If you disconnected by mistake or wish to reconnect your company, please navigate to your <strong>Connections</strong> dashboard and click the "Connect to QuickBooks" button.
                    </p>
                </div>

                <div className="pt-4 flex justify-center">
                    {/* Conditionally render based on the server auth state */}
                    {userId ? (
                        <Link
                            href="/connections"
                            className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-md font-medium hover:bg-zinc-800 transition-colors"
                        >
                            Return to Connections <ArrowRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <SignInButton mode="modal" forceRedirectUrl="/connections">
                            <button className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-md font-medium hover:bg-zinc-800 transition-colors">
                                Sign In to Audit Gen <ArrowRight className="h-4 w-4" />
                            </button>
                        </SignInButton>
                    )}
                </div>

            </div>
        </div>
    );
}