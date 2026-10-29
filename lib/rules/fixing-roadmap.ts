// lib/rules/fixing-roadmap.ts

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RoadmapStep {
    step: number;
    action: string;
    detail: string;
}

export interface RuleRoadmap {
    priority: Priority;
    whyItMatters: string; // Explains the accounting impact
    steps: RoadmapStep[]; // Step-by-step fix instructions
}

export const FixingRoadmap: Record<string, RuleRoadmap> = {
    // ─── AR Rules (Highest Impact on Cash Flow) ───
    'DUPLICATE_INVOICES': {
        priority: 'CRITICAL',
        whyItMatters: 'Duplicate invoices artificially inflate your revenue and Accounts Receivable, leading to incorrect tax reporting and confused customers.',
        steps: [
            { step: 1, action: 'Identify the Original', detail: 'Review the linked records below to determine which invoice is the valid one.' },
            { step: 2, action: 'Void or Delete', detail: 'In QuickBooks, open the duplicate invoice and select "Void" (preferred to keep an audit trail) or "Delete".' },
            { step: 3, action: 'Verify AR Balance', detail: 'Run an A/R Aging Summary report to ensure the customer\'s balance has corrected.' }
        ]
    },
    'UNAPPLIED_PAYMENTS': {
        priority: 'HIGH',
        whyItMatters: 'Unapplied payments make it look like customers still owe you money, skewing your cash flow and A/R aging reports.',
        steps: [
            { step: 1, action: 'Locate the Open Invoice', detail: 'Check the customer\'s account in QuickBooks for an open invoice matching the payment amount/date.' },
            { step: 2, action: 'Apply the Payment', detail: 'Open the unapplied payment, click "Outstanding Transactions", and check the box next to the correct invoice.' },
            { step: 3, action: 'Save and Close', detail: 'Save the transaction and verify the customer balance is now $0.00.' }
        ]
    },
    'PAYMENT_WITHOUT_INVOICE': {
        priority: 'HIGH',
        whyItMatters: 'Payments without linked invoices create negative customer balances and make reconciliation difficult.',
        steps: [
            { step: 1, action: 'Determine Intent', detail: 'Is this an advance payment (retainer) or a missing invoice?' },
            { step: 2, action: 'Create or Link', detail: 'If an invoice exists, edit the payment to link it. If it\'s a retainer, create a new invoice and apply this payment to it.' }
        ]
    },

    // ─── AP Rules (Highest Impact on Expenses) ───
    'DUPLICATE_VENDOR_BILLS': {
        priority: 'CRITICAL',
        whyItMatters: 'Duplicate bills artificially inflate your expenses and Accounts Payable, potentially leading to double-paying a vendor.',
        steps: [
            { step: 1, action: 'Compare Details', detail: 'Review the linked bills below to check dates, amounts, and vendor names.' },
            { step: 2, action: 'Void the Duplicate', detail: 'Open the incorrect bill in QuickBooks and select "Void" to preserve the audit trail.' },
            { step: 3, action: 'Check for Double Payment', detail: 'Verify that a bill payment was not already made against the duplicate.' }
        ]
    },
    'BILL_PAYMENT_WITHOUT_BILL': {
        priority: 'HIGH',
        whyItMatters: 'Payments without a linked bill bypass your Accounts Payable workflow, making it hard to track vendor liabilities.',
        steps: [
            { step: 1, action: 'Locate the Bill', detail: 'Search the vendor\'s profile in QuickBooks for the corresponding bill.' },
            { step: 2, action: 'Link the Payment', detail: 'Edit the bill payment and select the matching bill from the "Outstanding Transactions" list.' },
            { step: 3, action: 'Reconcile', detail: 'Ensure the vendor\'s balance reflects the applied payment.' }
        ]
    },

    // ─── Banking Rules ───
    'UNRECONCILED_TRANSACTION_AGING': {
        priority: 'MEDIUM',
        whyItMatters: 'Old unreconciled transactions indicate missing bank statement matches or data entry errors, compromising your bank reconciliation.',
        steps: [
            { step: 1, action: 'Pull the Bank Statement', detail: 'Obtain the bank or credit card statement for the month the transaction occurred.' },
            { step: 2, action: 'Match or Investigate', detail: 'If it\'s on the statement, reconcile it. If not, determine if it was a bank error or an internal duplicate entry.' },
            { step: 3, action: 'Correct the Entry', detail: 'Void, delete, or edit the transaction to match the actual bank activity.' }
        ]
    },

    // ─── Balance Rules ───
    'BROKEN_TRANSACTION_LINK': {
        priority: 'HIGH',
        whyItMatters: 'Broken links (e.g., a payment pointing to a deleted invoice) create orphaned data that breaks the audit trail and skews reports.',
        steps: [
            { step: 1, action: 'Identify the Orphan', detail: 'Review the linked records to see which parent transaction is missing.' },
            { step: 2, action: 'Recreate or Re-link', detail: 'If the parent was deleted by mistake, recreate it. Otherwise, edit the child transaction to point to the correct, existing parent.' }
        ]
    },

    // Add fallback for any rule not explicitly defined
    'DEFAULT': {
        priority: 'MEDIUM',
        whyItMatters: 'This exception indicates a deviation from standard accounting best practices that should be reviewed.',
        steps: [
            { step: 1, action: 'Review the Records', detail: 'Click the QuickBooks links below to inspect the specific transactions.' },
            { step: 2, action: 'Correct the Data', detail: 'Update the transaction details in QuickBooks to align with your accounting policies.' }
        ]
    }
};

// Helper to get roadmap safely
export function getRuleRoadmap(ruleId: string): RuleRoadmap {
    return FixingRoadmap[ruleId] || FixingRoadmap['DEFAULT'];
}