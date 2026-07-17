'use client';

import * as React from 'react';
import { X, Copy, Check, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './button';

interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export function Sheet({ isOpen, onClose, title, description, children }: SheetProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const [width, setWidth] = React.useState(512); // Default width (w-full max-w-lg)
    const [isResizing, setIsResizing] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const startResizing = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = React.useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            // Constraints: Min 384px (max-w-sm), Max half page
            const minWidth = 384;
            const maxWidth = window.innerWidth / 2;
            
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setWidth(newWidth);
            }
        }
    }, [isResizing]);

    React.useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    if (!isMounted) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                style={{ width: isOpen ? `${width}px` : '0px' }}
                className={cn(
                    "fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transform flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full",
                    !isResizing && "transition-all duration-300 ease-in-out"
                )}
            >
                {/* Drag Handle */}
                <div
                    onMouseDown={startResizing}
                    className={cn(
                        "absolute top-0 left-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-blue-500/20 group transition-colors flex items-center justify-center",
                        isResizing && "bg-blue-500/10"
                    )}
                >
                    <div className="w-1 h-12 bg-slate-200 rounded-full group-hover:bg-blue-400 transition-colors" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white shrink-0">
                    <div className="space-y-1 overflow-hidden">
                        {title && (
                            <h2 className="text-lg font-black tracking-tight text-slate-900 truncate">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                                {description}
                            </p>
                        )}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClose} 
                        className="rounded-xl h-9 w-9 bg-slate-50 hover:bg-slate-100 shrink-0 ml-4"
                    >
                        <X className="h-4 w-4 text-slate-500" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    {children}
                </div>
            </div>
        </>
    );
}

export function SheetContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("space-y-8", className)}>{children}</div>;
}

export function CopyableField({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = React.useState(false);

    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                <button
                    onClick={copy}
                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-[11px] break-all text-slate-600">
                {value}
            </div>
        </div>
    );
}
