'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { connectionsApi } from '@/lib/api/connections';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2, RefreshCw } from 'lucide-react';

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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2CA01C] to-[#1D6E11] p-1 shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(44,160,28,0.3)] group">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none" />

            <Card className="relative border-none bg-white/95 backdrop-blur-sm rounded-[14px]">
                <CardHeader className="pb-4">
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                        {/* 
                          UPDATED LOGO CONTAINER
                          - Rectangular shape to fit the full logo
                          - Padding respects the "clear space" margin rules 
                          - Removed hover:scale to strictly avoid altering the logo
                        */}
                        <div className="relative flex items-center justify-center min-w-[140px] h-[60px] p-3 rounded-xl bg-white border border-[#2CA01C]/20 shadow-sm">
                            <Image
                                src="/qb.png"
                                alt="Intuit QuickBooks"
                                width={120}
                                height={36}
                                className="object-contain"
                                priority
                            />
                        </div>

                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                Connect to QuickBooks
                            </CardTitle>
                            <CardDescription className="text-gray-500 font-medium tracking-tight">
                                Unleash real-time financial insights
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-3">
                        {[
                            { icon: <RefreshCw className="h-4 w-4 text-[#2CA01C]" />, text: "On Demand Data Sync", desc: "Always up-to-date financials" },
                            { icon: <RefreshCw className="h-4 w-4 text-blue-500" />, text: "20+ Rule Diagnostics", desc: "Find errors before they happen" },
                            { icon: <RefreshCw className="h-4 w-4 text-orange-500" />, text: "Health Scoring", desc: "Track your fiscal fitness daily" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group/item">
                                <div className="mt-1 p-1.5 rounded-lg bg-gray-50 group-hover/item:bg-white flex items-center justify-center transition-colors shadow-sm">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{item.text}</p>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="p-4 text-sm bg-red-50 border border-red-100 text-red-600 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <p className="font-semibold mb-1">Connection Error</p>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* 
                          UPDATED BUTTON
                          - Replaces custom CSS with the mandatory Intuit button graphic
                          - Wrap in a standard HTML button for click/accessibility handling
                        */}
                        <button
                            onClick={handleConnect}
                            disabled={isLoading}
                            aria-label="Connect to QuickBooks"
                            className="w-full flex justify-center items-center transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex h-[40px] w-full max-w-[250px] items-center justify-center bg-[#2CA01C] rounded-md text-white font-medium shadow-sm">
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Connecting...
                                </div>
                            ) : (
                                <div className="relative w-full max-w-[250px] h-[40px]">
                                    {/* Ensure this points to the exact asset downloaded from Intuit */}
                                    <Image
                                        src="/C2QB_green_btn_lg_default.png"
                                        alt="Connect to QuickBooks"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}
                        </button>

                        <p className="text-[10px] items-center text-gray-400 text-center px-4 leading-relaxed">
                            Secured with industry-standard encryption. By connecting, you agree to our
                            <span className="text-[#2CA01C] cursor-pointer hover:underline ml-1">Data Authorization Policy</span>.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}