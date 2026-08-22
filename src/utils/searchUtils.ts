import { CUSTOMERS_DATA, Customer } from '../data/customers';
import { INVOICES_DATA, Invoice } from '../data/invoices';
import { RECOVERY_CASES_DATA } from '../data/recoveryCases';
import { TRANSACTIONS_DATA, Transaction } from '../data/transactions';

export type RecommendationAction =
  | 'Send Reminder'
  | 'Send Email'
  | 'Call Customer'
  | 'Offer Payment Plan'
  | 'Escalate Case'
  | 'Mark as High Priority';

export interface AiRecommendation {
  action: RecommendationAction;
  reason: string;
  confidence: number;
}

export interface SearchResultItem {
  customerName: string;
  customerId: string;
  invoiceId: string;
  invoiceAmount: string;
  dueDate: string;
  daysOverdue: number;
  paymentStatus: 'Paid' | 'Overdue' | 'Pending' | 'Promise to Pay';
  recoveryStatus: 'Recovered' | 'In Progress' | 'Escalated' | 'New' | 'Unassigned';
  recommendation: AiRecommendation;
  relatedTransactions?: { id: string; status: string; amount: number; gateway?: string }[];
}

export const DEMO_SEARCH_IDS = ['CUST-1001', 'CUST-1002', 'INV-10001', 'INV-10002'];

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function mapPaymentStatus(status: Invoice['status']): SearchResultItem['paymentStatus'] {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'overdue':
      return 'Overdue';
    case 'pending':
      return 'Pending';
    case 'promise_to_pay':
      return 'Promise to Pay';
    default:
      return 'Pending';
  }
}

function getRecoveryStatusForInvoiceOrCustomer(
  customerId: string,
  invoiceId: string
): SearchResultItem['recoveryStatus'] {
  const matchedCase = RECOVERY_CASES_DATA.find(
    (c) => c.invoiceId === invoiceId || c.customerId === customerId
  );

  if (!matchedCase) {
    return 'New';
  }

  switch (matchedCase.status) {
    case 'recovered':
      return 'Recovered';
    case 'in_progress':
      return 'In Progress';
    case 'escalated':
    case 'failed':
      return 'Escalated';
    case 'new':
    default:
      return 'New';
  }
}

/**
 * Step 9 AI Recovery Recommendation Rules Engine
 * Evaluates record parameters (amount, days overdue, risk level, payment status)
 * and generates a contextual action recommendation, reason, and confidence score.
 */
export function generateAiRecommendation(
  amount: number,
  daysOverdue: number,
  status: Invoice['status'],
  riskLevel: Customer['riskLevel'] = 'medium'
): AiRecommendation {
  if (status === 'paid') {
    return {
      action: 'Send Reminder',
      reason: 'Invoice is fully settled. Automated thank-you and next billing cycle reminder scheduled.',
      confidence: 96,
    };
  }

  if (daysOverdue > 25 || (riskLevel === 'high' && daysOverdue > 15)) {
    return {
      action: 'Escalate Case',
      reason: 'Severe invoice overdue period with high risk profile. Immediate RevOps team escalation required.',
      confidence: 94,
    };
  }

  if (amount >= 200000) {
    return {
      action: 'Offer Payment Plan',
      reason: 'Large outstanding balance (≥₹2,00,000) at risk. Flexible payment plan offer recommended to prevent default.',
      confidence: 89,
    };
  }

  if (daysOverdue > 10 && riskLevel === 'high') {
    return {
      action: 'Call Customer',
      reason: 'High customer payment risk with 10+ days overdue invoice. Direct telephone outreach recommended.',
      confidence: 91,
    };
  }

  if (amount >= 100000 && daysOverdue > 5) {
    return {
      action: 'Mark as High Priority',
      reason: 'Significant amount at risk (≥₹1,00,000) past due. Case flagged for priority recovery queue.',
      confidence: 88,
    };
  }

  if (daysOverdue > 5 || riskLevel === 'medium') {
    return {
      action: 'Send Email',
      reason: 'Invoice is overdue and the customer has a moderate recovery risk.',
      confidence: 87,
    };
  }

  return {
    action: 'Send Reminder',
    reason: 'Recently overdue invoice with low account risk profile. Gentle automated reminder sequence advised.',
    confidence: 92,
  };
}

export function searchCustomerOrInvoice(rawQuery: string): SearchResultItem | null {
  if (!rawQuery || !rawQuery.trim()) {
    return null;
  }

  let cleanQuery = rawQuery.trim().toUpperCase();

  // Support legacy format e.g. CUS-001 -> CUST-1001, CUS-002 -> CUST-1002, etc.
  if (cleanQuery.startsWith('CUS-')) {
    const numPart = parseInt(cleanQuery.replace('CUS-', ''), 10);
    if (!isNaN(numPart)) {
      cleanQuery = `CUST-${1000 + numPart}`;
    }
  }

  // 1. Match by Invoice ID
  const foundInvoice = INVOICES_DATA.find(
    (inv) => inv.id.toUpperCase() === cleanQuery
  );

  if (foundInvoice) {
    const customer = CUSTOMERS_DATA.find((c) => c.id === foundInvoice.customerId);
    const customerName = customer ? customer.name : 'Unknown Customer';
    const riskLevel = customer ? customer.riskLevel : 'medium';
    const txns = TRANSACTIONS_DATA.filter(
      (t) => t.invoiceId === foundInvoice.id || t.customerId === foundInvoice.customerId
    ).map((t) => ({ id: t.id, status: t.status, amount: t.amount, gateway: t.gateway }));

    return {
      customerName,
      customerId: foundInvoice.customerId,
      invoiceId: foundInvoice.id,
      invoiceAmount: formatCurrency(foundInvoice.amount),
      dueDate: foundInvoice.dueDate,
      daysOverdue: foundInvoice.daysOverdue,
      paymentStatus: mapPaymentStatus(foundInvoice.status),
      recoveryStatus: getRecoveryStatusForInvoiceOrCustomer(
        foundInvoice.customerId,
        foundInvoice.id
      ),
      recommendation: generateAiRecommendation(
        foundInvoice.amount,
        foundInvoice.daysOverdue,
        foundInvoice.status,
        riskLevel
      ),
      relatedTransactions: txns,
    };
  }

  // 2. Match by Customer ID, Email, Customer Name, or Company Name
  const foundCustomer = CUSTOMERS_DATA.find(
    (c) =>
      c.id.toUpperCase() === cleanQuery ||
      c.email.toUpperCase() === cleanQuery ||
      c.name.toUpperCase().includes(cleanQuery) ||
      c.company.toUpperCase().includes(cleanQuery)
  );

  if (foundCustomer) {
    const relatedInvoice =
      INVOICES_DATA.find((inv) => inv.customerId === foundCustomer.id) || {
        id: `INV-1000${foundCustomer.id.slice(-1)}`,
        customerId: foundCustomer.id,
        amount: 50000,
        issueDate: '2026-08-01',
        dueDate: '2026-08-15',
        daysOverdue: 5,
        status: 'overdue' as const,
        promiseToPayDate: null,
      };

    const txns = TRANSACTIONS_DATA.filter(
      (t) => t.customerId === foundCustomer.id
    ).map((t) => ({ id: t.id, status: t.status, amount: t.amount, gateway: t.gateway }));

    return {
      customerName: foundCustomer.name,
      customerId: foundCustomer.id,
      invoiceId: relatedInvoice.id,
      invoiceAmount: formatCurrency(relatedInvoice.amount),
      dueDate: relatedInvoice.dueDate,
      daysOverdue: relatedInvoice.daysOverdue,
      paymentStatus: mapPaymentStatus(relatedInvoice.status),
      recoveryStatus: getRecoveryStatusForInvoiceOrCustomer(
        foundCustomer.id,
        relatedInvoice.id
      ),
      recommendation: generateAiRecommendation(
        relatedInvoice.amount,
        relatedInvoice.daysOverdue,
        relatedInvoice.status,
        foundCustomer.riskLevel
      ),
      relatedTransactions: txns,
    };
  }

  return null;
}
