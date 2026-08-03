'use client';

import { useState } from 'react';
import Image from 'next/image';
import { connectionsApi } from '@/lib/api/connections';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ConnectQuickBooksProps {
    onConnected?: () => void;
}

export function ConnectQuickBooks({ onConnected }: ConnectQuickBooksProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { tenantId } = useAuth();

    const handleConnect = async () => {
        if (!tenantId) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await connectionsApi.getAuthUrl(tenantId);
            if (response.success && response.authUrl) {
                window.location.href = response.authUrl;
            } else {
                setError('Failed to get connection URL. Please try again.');
            }
        } catch (error) {
            console.error('Failed to get QuickBooks auth URL:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center py-8">
            {/* Clean, unboxed logo */}
            <div className="mb-6">
                <Image
                    src="/qb.png"
                    alt="Intuit QuickBooks"
                    width={130}
                    height={40}
                    className="object-contain"
                    priority
                />
            </div>

            {/* Sharp, corporate typography */}
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    Connect to QuickBooks
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                    Unleash real-time financial insights
                </p>
            </div>

            {/* Minimalist error state */}
            {error && (
                <div className="w-full p-3 mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded text-left">
                    <span className="font-semibold">Error:</span> {error}
                </div>
            )}

            {/* Connection Button */}
            <button
                onClick={handleConnect}
                disabled={isLoading}
                aria-label="Connect to QuickBooks"
                className="w-full flex justify-center items-center transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            >
                {isLoading ? (
                    <div className="flex h-[40px] w-full max-w-[250px] items-center justify-center bg-[#2CA01C] rounded text-white text-sm font-medium shadow-sm">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                    </div>
                ) : (
                    <div className="relative w-full max-w-[250px] h-[40px]">
                        {/* Intuit's required button graphic */}
                        <Image
                            src="/C2QB_green_btn_tall_hover_2x.png"
                            alt="Connect to QuickBooks"
                            fill
                            className="object-contain"
                        />
                    </div>
                )}
            </button>

            {/* Muted footer text */}
            <p className="text-xs text-slate-400 text-center leading-relaxed">
                Secured with industry-standard encryption. By connecting, you agree to our
                <span className="text-slate-600 cursor-pointer hover:underline ml-1">
                    Data Authorization Policy
                </span>.
            </p>
        </div>
    );
}