'use client';

import Image from 'next/image';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Settings,
    Menu,
    X,
    Database,
    CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const menuItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Connections', href: '/connections', icon: Database },
    { title: 'Billing', href: '/billing', icon: CreditCard },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed top-0 left-0 h-screen bg-white border-r border-gray-100 z-40 transition-all duration-300 ease-in-out flex flex-col shadow-sm",
                isOpen ? "w-64" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"
            )}>
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-gray-50 flex-shrink-0">
                    <Image
                        src="/icon.png"
                        alt="Audit Gen logo"
                        width={32}
                        height={32}
                        className="rounded"
                    />

                    {isOpen && (
                        <span className="ml-3 font-black text-gray-900 tracking-tight text-sm uppercase">
                            Audit<span className="text-primary">Gen</span>
                        </span>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary/5 text-primary shadow-sm shadow-primary/5"
                                        : "text-muted-foreground hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 flex-shrink-0 transition-colors",
                                    isActive ? "text-primary" : "group-hover:text-gray-900"
                                )} />
                                {(isOpen || !isActive) && (
                                    <span className={cn(
                                        "ml-3 transition-opacity duration-300",
                                        !isOpen && "lg:hidden"
                                    )}>
                                        {item.title}
                                    </span>
                                )}
                                {isActive && !isOpen && (
                                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-gray-50 space-y-1">
                    <Link
                        href="/settings"
                        className="flex items-center px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                    >
                        <Settings className="h-5 w-5" />
                        {isOpen && <span className="ml-3">Settings</span>}
                    </Link>

                    {/* Expand Toggle Desktop */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="hidden lg:flex w-full items-center px-4 py-2 mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors"
                    >
                        {isOpen ? "Collapse Menu" : "Expand"}
                    </button>
                </div>
            </aside>
        </>
    );
}