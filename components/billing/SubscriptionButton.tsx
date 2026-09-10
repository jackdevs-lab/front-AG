//components/billing/SubscriptionButton.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SubscriptionButtonProps {
    /** The QbConnection.id to subscribe. Appended as ?connectionId= to /billing. */
    connectionId: string;
    className?: string;
    text?: string;
}

/**
 * Navigates to the dedicated /billing page with the connectionId as a query
 * param. The actual Paystack checkout is initiated there — this button is
 * purely a router entry-point so paywall logic stays in ONE place.
 */
export function SubscriptionButton({
    connectionId,
    className,
    text = 'Subscribe to Unlock',
}: SubscriptionButtonProps) {
    const router = useRouter();

    const handleNavigate = () => {
        router.push(`/billing?connectionId=${encodeURIComponent(connectionId)}`);
    };

    return (
        <Button
            id={`subscribe-btn-${connectionId}`}
            onClick={handleNavigate}
            className={cn(
                'bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-slate-200/50 flex items-center gap-2',
                className
            )}
        >
            <Lock className="h-4 w-4" />
            {text}
        </Button>
    );
}
