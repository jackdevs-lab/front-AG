// lib/rules/rule-registry.ts
import { Issue, DiagnosticEntity } from '@/types/diagnostic';

// 1. Bulletproof Exposure Calculation (Low-Payload Friendly)
const calculateExposure = (issue: Partial<Issue>) => {
    // Check if backend sends a single total number (future-proof, ~15 bytes)
    if ((issue as any).totalExposure) return Number((issue as any).totalExposure);
    if ((issue as any).metadata?.exposureAmount) return Number((issue as any).metadata.exposureAmount);

    // Fallback to summing entities if they happen to exist
    const entities = issue.entities || [];
    return entities.reduce((sum, entity: any) => {
        return sum + (Number(entity.amount ?? entity.exposureAmount ?? 0) || 0);
    }, 0);
};

const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

// 2. Bulletproof Entity Findings Generator
const generateEntityFindings = (issue: Partial<Issue>, typeLabel: string) => {
    // If entities array exists and has data, use it
    if (issue.entities && issue.entities.length > 0) {
        return issue.entities.map((entity: any, idx) => {
            const amount = Number(entity.amount ?? entity.exposureAmount ?? 0);
            const date = entity.date ?? entity.transactionDate ?? 'N/A';
            const deepLink = entity.deepLink ?? entity.url ?? (issue as any).deepLink;

            return {
                id: entity.id || `finding-${idx}`,
                type: `${typeLabel} ${entity.type || 'Record'}`,
                // Only show amount if it's > 0, otherwise just show the ID and Date
                description: amount > 0
                    ? `Amount: ${formatCurrency(amount)} | Date: ${date}`
                    : `Record ID: ${entity.id} | Date: ${date}`,
                urls: deepLink ? [deepLink] : [],
            };
        });
    }

    // FALLBACK: If no entities array, use entityIds to at least show meaningful data
    const entityIds = (issue as any).entityIds || [];
    if (entityIds.length > 0) {
        return entityIds.map((id: string, idx: number) => ({
            id: id,
            type: `${typeLabel} Record`,
            description: `Record ID: ${id}`,
            urls: [],
        }));
    }

    return [];
};

export interface RuleInsights {
    isStructured: boolean;
    summary: string;
    recommendation: string | null;
    findings: Array<{ id: string; type: string; description: string; urls: string[] }>;
}

// The Registry: Maps active ruleId to a function that generates structured insights
export const RuleInsightsRegistry: Record<string, (issue: Partial<Issue>) => RuleInsights> = {
    // ─── Hygiene Rules ───
    'UNAPPLIED_PAYMENTS': (issue) => {
        const count = issue.entityCount || issue.entities?.length || 0;
        const totalAmount = calculateExposure(issue);
        const amountText = totalAmount > 0 ? ` totaling ${formatCurrency(totalAmount)}` : '';
        return {
            isStructured: true,
            summary: `Found ${count} unapplied payment(s)${amountText}.`,
            recommendation: 'Apply these payments to their corresponding open invoices to accurately reflect customer balances.',
            findings: generateEntityFindings(issue, 'Unapplied'),
        };
    },

    // ─── Balance Rules ───
    'AR_CONTROL_ACCOUNT_MISMATCH': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} AR control account mismatch(es).`,
        recommendation: 'Review the linked transactions to ensure the AR sub-ledger matches the general ledger control account.',
        findings: generateEntityFindings(issue, 'AR Mismatch'),
    }),

    'AP_CONTROL_ACCOUNT_MISMATCH': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} AP control account mismatch(es).`,
        recommendation: 'Review the linked transactions to ensure the AP sub-ledger matches the general ledger control account.',
        findings: generateEntityFindings(issue, 'AP Mismatch'),
    }),

    'DELETED_ACCOUNT_REFERENCE': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} transaction(s) referencing a deleted or inactive account.`,
        recommendation: 'Reassign these transactions to an active account to maintain ledger integrity.',
        findings: generateEntityFindings(issue, 'Deleted Account Ref'),
    }),

    'BROKEN_TRANSACTION_LINK': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} broken transaction link(s).`,
        recommendation: 'Investigate these records to restore the missing parent-child transaction relationships.',
        findings: generateEntityFindings(issue, 'Broken Link'),
    }),

    'ORPHANED_PAYMENT': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} orphaned customer payment(s).`,
        recommendation: 'Review these transactions and link them to the correct customer invoice.',
        findings: generateEntityFindings(issue, 'Orphaned Payment'),
    }),

    'ORPHANED_BILL_PAYMENT': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} orphaned vendor bill payment(s).`,
        recommendation: 'Review these transactions and link them to the correct vendor bill.',
        findings: generateEntityFindings(issue, 'Orphaned Bill Payment'),
    }),

    // ─── Banking Rules ───
    'INCORRECT_DEPOSIT_RECORDING': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} incorrectly recorded deposit(s).`,
        recommendation: 'Verify the deposit amounts and linked transactions to ensure accurate bank reconciliation.',
        findings: generateEntityFindings(issue, 'Incorrect Deposit'),
    }),

    'DUPLICATE_DEPOSITS': (issue) => {
        const count = issue.entityCount || issue.entities?.length || 0;
        const totalAmount = calculateExposure(issue);
        const amountText = totalAmount > 0 ? ` totaling ${formatCurrency(totalAmount)}` : '';
        return {
            isStructured: true,
            summary: `Found ${count} duplicate deposit(s)${amountText}.`,
            recommendation: 'Review the listed deposits and void or delete the duplicates to prevent double-counting revenue.',
            findings: generateEntityFindings(issue, 'Duplicate Deposit'),
        };
    },

    'UNDEPOSITED_FUNDS_AGING': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} aging undeposited funds transaction(s).`,
        recommendation: 'Create a bank deposit in QuickBooks to clear these funds from the Undeposited Funds account.',
        findings: generateEntityFindings(issue, 'Aging Undeposited Funds'),
    }),

    'UNRECONCILED_TRANSACTION_AGING': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} aging unreconciled transaction(s).`,
        recommendation: 'Review these old transactions and reconcile them with your bank statement or investigate as necessary.',
        findings: generateEntityFindings(issue, 'Unreconciled Transaction'),
    }),

    // ─── AR Rules ───
    'DUPLICATE_INVOICES': (issue) => {
        const count = issue.entityCount || issue.entities?.length || 0;
        const totalAmount = calculateExposure(issue);
        const amountText = totalAmount > 0 ? ` totaling ${formatCurrency(totalAmount)}` : '';
        return {
            isStructured: true,
            summary: `Detected ${count} duplicate invoice(s)${amountText}.`,
            recommendation: 'Review the listed invoices and void or delete the duplicates to prevent double-counting revenue.',
            findings: generateEntityFindings(issue, 'Duplicate Invoice'),
        };
    },

    'NEGATIVE_AR_BALANCE': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} customer account(s) with a negative AR balance.`,
        recommendation: 'Investigate these accounts for unapplied credits or data entry errors causing the negative balance.',
        findings: generateEntityFindings(issue, 'Negative AR Balance'),
    }),

    'UNAPPLIED_CREDIT_MEMOS': (issue) => {
        const count = issue.entityCount || issue.entities?.length || 0;
        const totalAmount = calculateExposure(issue);
        const amountText = totalAmount > 0 ? ` totaling ${formatCurrency(totalAmount)}` : '';
        return {
            isStructured: true,
            summary: `Detected ${count} unapplied credit memo(s)${amountText}.`,
            recommendation: 'Apply these credit memos to their corresponding open customer invoices.',
            findings: generateEntityFindings(issue, 'Unapplied Credit Memo'),
        };
    },

    'PAYMENT_WITHOUT_INVOICE': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} customer payment(s) without a linked invoice.`,
        recommendation: 'Link these payments to the correct open invoices or verify if they are legitimate unapplied payments.',
        findings: generateEntityFindings(issue, 'Payment Without Invoice'),
    }),

    'DUPLICATE_PAYMENT': (issue) => {
        const count = issue.entityCount || issue.entities?.length || 0;
        const totalAmount = calculateExposure(issue);
        const amountText = totalAmount > 0 ? ` totaling ${formatCurrency(totalAmount)}` : '';
        return {
            isStructured: true,
            summary: `Detected ${count} duplicate customer payment(s)${amountText}.`,
            recommendation: 'Review the listed payments and refund or reallocate the duplicates to prevent accounting errors.',
            findings: generateEntityFindings(issue, 'Duplicate Payment'),
        };
    },

    'PAYMENT_DATE_BEFORE_INVOICE': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} payment(s) dated before the linked invoice.`,
        recommendation: 'Verify the transaction dates to ensure accurate period reporting and cash flow tracking.',
        findings: generateEntityFindings(issue, 'Payment Before Invoice'),
    }),

    'OVER_APPLIED_PAYMENT': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} over-applied payment(s).`,
        recommendation: 'Review these payments and adjust the applied amounts to match the actual invoice totals.',
        findings: generateEntityFindings(issue, 'Over-Applied Payment'),
    }),

    // ─── AP Rules ───
    'BILL_PAYMENT_WITHOUT_BILL': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} vendor bill payment(s) without a linked vendor bill.`,
        recommendation: 'Link these payments to the correct vendor bills or verify if they should be recorded as expenses.',
        findings: generateEntityFindings(issue, 'Bill Payment Without Bill'),
    }),

    'DUPLICATE_VENDOR_BILLS': (issue) => {
        const count = issue.entityCount || issue.entities?.length || 0;
        const totalAmount = calculateExposure(issue);
        const amountText = totalAmount > 0 ? ` totaling ${formatCurrency(totalAmount)}` : '';
        return {
            isStructured: true,
            summary: `Detected ${count} duplicate vendor bill(s)${amountText}.`,
            recommendation: 'Review the listed bills and void or delete the duplicates to prevent double-counting expenses.',
            findings: generateEntityFindings(issue, 'Duplicate Vendor Bill'),
        };
    },

    'NEGATIVE_AP_BALANCE': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} vendor account(s) with a negative AP balance.`,
        recommendation: 'Investigate these accounts for unapplied vendor credits or data entry errors causing the negative balance.',
        findings: generateEntityFindings(issue, 'Negative AP Balance'),
    }),

    'VENDOR_CREDITS_NOT_APPLIED': (issue) => {
        const count = issue.entityCount || issue.entities?.length || 0;
        const totalAmount = calculateExposure(issue);
        const amountText = totalAmount > 0 ? ` totaling ${formatCurrency(totalAmount)}` : '';
        return {
            isStructured: true,
            summary: `Detected ${count} unapplied vendor credit(s)${amountText}.`,
            recommendation: 'Apply these vendor credits to their corresponding open vendor bills.',
            findings: generateEntityFindings(issue, 'Unapplied Vendor Credit'),
        };
    },

    'DUPLICATE_BILL_PAYMENTS': (issue) => {
        const count = issue.entityCount || issue.entities?.length || 0;
        const totalAmount = calculateExposure(issue);
        const amountText = totalAmount > 0 ? ` totaling ${formatCurrency(totalAmount)}` : '';
        return {
            isStructured: true,
            summary: `Found ${count} duplicate vendor bill payment(s)${amountText}.`,
            recommendation: 'Review the listed payments and request a refund or reallocate the duplicates from the vendor.',
            findings: generateEntityFindings(issue, 'Duplicate Bill Payment'),
        };
    },

    'PAYMENT_BEFORE_BILL': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} vendor payment(s) dated before the linked vendor bill.`,
        recommendation: 'Verify the transaction dates to ensure accurate period reporting and expense tracking.',
        findings: generateEntityFindings(issue, 'Payment Before Bill'),
    }),
};

// Safe Fallback Wrapper
export function getRuleInsights(issue: Partial<Issue> & { ruleId: string; message: string }): RuleInsights {
    if (RuleInsightsRegistry[issue.ruleId]) {
        return RuleInsightsRegistry[issue.ruleId](issue);
    }

    // FALLBACK: Return flag indicating it's not structured, so the component 
    // can fall back to the old parseMarkdownFindings or raw string.
    return {
        isStructured: false,
        summary: issue.message,
        recommendation: null,
        findings: [],
    };
}