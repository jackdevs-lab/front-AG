'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col items-center justify-center space-y-3 text-center h-full min-h-[150px]">
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                    <div>
                        <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest">Component Error</h3>
                        <p className="text-[10px] font-medium text-rose-500 mt-1 max-w-[200px] truncate">
                            {this.state.error?.message || 'Failed to load widget'}
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="text-rose-600 border-rose-200 hover:bg-rose-100 h-8 font-black text-[10px] uppercase tracking-widest mt-2"
                    >
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
