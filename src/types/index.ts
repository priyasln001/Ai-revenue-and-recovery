export type NavItemKey =
  | 'dashboard'
  | 'opportunities'
  | 'agent'
  | 'customers'
  | 'transactions'
  | 'invoices'
  | 'audit'
  | 'analytics'
  | 'settings';

export interface NavItem {
  key: NavItemKey;
  label: string;
  badge?: string;
  badgeType?: 'indigo' | 'emerald' | 'amber';
}

export interface MetricSummary {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  timeframe: string;
  description: string;
}

export interface RecoveryCase {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  currency: string;
  gateway: 'Stripe' | 'Razorpay' | 'Adyen' | 'Authorize.Net';
  failureReason: string;
  aiStrategy: string;
  confidenceScore: number;
  status: 'Recovering' | 'Recovered' | 'Action Required' | 'Dunning Sent';
  attempts: number;
  lastEventTime: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event: string;
  details: string;
  performedBy: string;
  type: 'ai' | 'system' | 'user';
  customer?: string;
  customerId?: string;
  invoiceId?: string;
  issue?: string;
  actionTaken?: string;
  amount?: string;
  previousStatus?: string;
  newStatus?: string;
  result?: 'Successful' | 'Failed' | 'Escalated';
}


