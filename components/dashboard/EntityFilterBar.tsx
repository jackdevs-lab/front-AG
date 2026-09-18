'use client';

import React from 'react';
import { Issue, Severity } from '@/types/diagnostic';
import { cn } from '@/lib/utils/cn';

interface EntityFilterBarProps {
    issues: Issue[];
    selectedType: string | null;
    onTypeSelect: (type: string | null) => void;
}

export function EntityFilterBar({ issues, selectedType, onTypeSelect }: EntityFilterBarProps) {
    // entityTypes are not yet exposed by the API after the Phase 1 schema change.
    // The bar will re-enable once /runs/:runId/rules includes per-rule entity types.
    return null;
}