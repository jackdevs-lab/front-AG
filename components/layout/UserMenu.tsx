'use client';

import { UserButton } from "@clerk/nextjs";

/**
 * UserMenu Component
 * 
 * Replaces the custom dropdown with Clerk's UserButton for secure
 * profile management and sign-out functionality.
 */
export function UserMenu({ user }: { user: any }) {
    return (
        <div className="flex items-center gap-3 px-2 h-10">
            <UserButton 
                appearance={{
                    elements: {
                        avatarBox: "h-8 w-8 border border-slate-200 shadow-sm",
                        userButtonBox: "hover:bg-slate-50 rounded-lg p-1 transition-all"
                    }
                }}
            />
            <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-[11px] font-black text-slate-900 leading-none mb-1">
                    {user?.name || 'Loading...'}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Financial Auditor
                </span>
            </div>
        </div>
    );
}
