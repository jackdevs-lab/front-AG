import React from 'react';
import { Lock } from 'lucide-react';

export function TeaserTooltip({ children, isTeaser }: { children: React.ReactNode; isTeaser: boolean }) {
    if (!isTeaser) return <>{children}</>;
    
    return (
        <div className="relative group/teaser">
            <div className="blur-[5px] pointer-events-none select-none" aria-hidden="true">
                {children}
            </div>
            <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/teaser:opacity-100 transition-opacity duration-150"
                aria-label="Subscribe to unlock full details"
            >
                <span className="bg-slate-900/90 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg flex items-center gap-1.5">
                    <Lock className="h-2.5 w-2.5" />
                    Subscribe to unlock
                </span>
            </div>
        </div>
    );
}
