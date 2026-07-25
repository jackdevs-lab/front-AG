'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
                    <div className="flex items-center gap-4">
                        <div className="relative group/logo">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#2CA01C] to-[#1D6E11] rounded-xl blur opacity-25 group-hover/logo:opacity-50 transition duration-300" />
                            <div className="relative w-14 h-14 rounded-xl bg-white border border-[#2CA01C]/20 flex items-center justify-center shadow-sm">
                                <Image
                                    src="/image.png"
                                    alt="QuickBooks"
                                    width={32}
                                    height={32}
                                    className="transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                Connect QuickBooks
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
                        <Button
                            onClick={handleConnect}
                            disabled={isLoading}
                            className="w-full h-12 text-base font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-[#2CA01C] to-[#1D6E11] hover:from-[#1D6E11] hover:to-[#2CA01C] border-none shadow-lg shadow-[#2CA01C]/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Establishing Connection...
                                </>
                            ) : (
                                'Connect with QuickBooks'
                            )}
                        </Button>

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