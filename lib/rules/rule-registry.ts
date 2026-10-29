// lib/rules/rule-registry.ts
import { Issue, DiagnosticEntity } from '@/types/diagnostic';

const calculateExposure = (entities: DiagnosticEntity[] = []) => {
    return entities.reduce((sum, entity) => sum + (Number(entity.amount) || 0), 0);
};

const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

// Helper to generate standardized findings from the entities array
const generateEntityFindings = (issue: Issue, typeLabel: string) => {
    return (issue.entities || []).map((entity, idx) => ({
        id: entity.id || `finding-${idx}`,
        type: `${typeLabel} ${entity.type || 'Record'}`,
        description: `Amount: ${formatCurrency(Number(entity.amount) || 0)} | Date: ${entity.date || 'N/A'}`,
        urls: entity.deepLink ? [entity.deepLink] : (entity.url ? [entity.url] : []),
    }));
};

export interface RuleInsights {
    isStructured: boolean;
    summary: string;
    recommendation: string | null;
    findings: Array<{ id: string; type: string; description: string; urls: string[] }>;
}

// The Registry: Maps active ruleId to a function that generates structured insights
export const RuleInsightsRegistry: Record<string, (issue: Issue) => RuleInsights> = {
    // ─── Hygiene Rules ───
    'UNAPPLIED_PAYMENTS': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} unapplied payment(s) totaling ${formatCurrency(calculateExposure(issue.entities))}.`,
        recommendation: 'Apply these payments to their corresponding open invoices to accurately reflect customer balances.',
        findings: generateEntityFindings(issue, 'Unapplied'),
    }),

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

    'DUPLICATE_DEPOSITS': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} duplicate deposit(s) totaling ${formatCurrency(calculateExposure(issue.entities))}.`,
        recommendation: 'Review the listed deposits and void or delete the duplicates to prevent double-counting revenue.',
        findings: generateEntityFindings(issue, 'Duplicate Deposit'),
    }),

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
    'DUPLICATE_INVOICES': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} duplicate invoice(s) totaling ${formatCurrency(calculateExposure(issue.entities))}.`,
        recommendation: 'Review the listed invoices and void or delete the duplicates to prevent double-counting revenue.',
        findings: generateEntityFindings(issue, 'Duplicate Invoice'),
    }),

    'NEGATIVE_AR_BALANCE': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} customer account(s) with a negative AR balance.`,
        recommendation: 'Investigate these accounts for unapplied credits or data entry errors causing the negative balance.',
        findings: generateEntityFindings(issue, 'Negative AR Balance'),
    }),

    'UNAPPLIED_CREDIT_MEMOS': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} unapplied credit memo(s) totaling ${formatCurrency(calculateExposure(issue.entities))}.`,
        recommendation: 'Apply these credit memos to their corresponding open customer invoices.',
        findings: generateEntityFindings(issue, 'Unapplied Credit Memo'),
    }),

    'PAYMENT_WITHOUT_INVOICE': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} customer payment(s) without a linked invoice.`,
        recommendation: 'Link these payments to the correct open invoices or verify if they are legitimate unapplied payments.',
        findings: generateEntityFindings(issue, 'Payment Without Invoice'),
    }),

    'DUPLICATE_PAYMENT': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} duplicate customer payment(s) totaling ${formatCurrency(calculateExposure(issue.entities))}.`,
        recommendation: 'Review the listed payments and refund or reallocate the duplicates to prevent accounting errors.',
        findings: generateEntityFindings(issue, 'Duplicate Payment'),
    }),

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

    'DUPLICATE_VENDOR_BILLS': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} duplicate vendor bill(s) totaling ${formatCurrency(calculateExposure(issue.entities))}.`,
        recommendation: 'Review the listed bills and void or delete the duplicates to prevent double-counting expenses.',
        findings: generateEntityFindings(issue, 'Duplicate Vendor Bill'),
    }),

    'NEGATIVE_AP_BALANCE': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} vendor account(s) with a negative AP balance.`,
        recommendation: 'Investigate these accounts for unapplied vendor credits or data entry errors causing the negative balance.',
        findings: generateEntityFindings(issue, 'Negative AP Balance'),
    }),

    'VENDOR_CREDITS_NOT_APPLIED': (issue) => ({
        isStructured: true,
        summary: `Detected ${issue.entityCount || issue.entities?.length || 0} unapplied vendor credit(s) totaling ${formatCurrency(calculateExposure(issue.entities))}.`,
        recommendation: 'Apply these vendor credits to their corresponding open vendor bills.',
        findings: generateEntityFindings(issue, 'Unapplied Vendor Credit'),
    }),

    'DUPLICATE_BILL_PAYMENTS': (issue) => ({
        isStructured: true,
        summary: `Found ${issue.entityCount || issue.entities?.length || 0} duplicate vendor bill payment(s) totaling ${formatCurrency(calculateExposure(issue.entities))}.`,
        recommendation: 'Review the listed payments and request a refund or reallocate the duplicates from the vendor.',
        findings: generateEntityFindings(issue, 'Duplicate Bill Payment'),
    }),

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
        return RuleInsightsRegistry[issue.ruleId](issue as Issue);
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