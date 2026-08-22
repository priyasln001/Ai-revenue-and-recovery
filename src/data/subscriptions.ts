export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled';
export type BillingCycle = 'monthly' | 'quarterly' | 'annual';

export interface Subscription {
  id: string;
  customerId: string;
  plan: string;
  amount: number;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  lastPaymentStatus: 'success' | 'failed' | 'pending';
  nextBillingDate: string;
  failedAttempts: number;
}

export const SUBSCRIPTIONS_DATA: Subscription[] = [
  {
    id: 'SUB-301',
    customerId: 'CUST-1004', // GreenCart Retail
    plan: 'Starter Monthly',
    amount: 2499,
    billingCycle: 'monthly',
    status: 'past_due',
    lastPaymentStatus: 'failed',
    nextBillingDate: '2026-08-21',
    failedAttempts: 1,
  },
  {
    id: 'SUB-302',
    customerId: 'CUST-1005', // Zenith Global Systems
    plan: 'Enterprise Ultimate',
    amount: 120000,
    billingCycle: 'monthly',
    status: 'past_due',
    lastPaymentStatus: 'failed',
    nextBillingDate: '2026-08-21',
    failedAttempts: 2,
  },
  {
    id: 'SUB-303',
    customerId: 'CUST-1002', // Apex Solutions
    plan: 'Pro Tier',
    amount: 12999,
    billingCycle: 'monthly',
    status: 'active',
    lastPaymentStatus: 'success',
    nextBillingDate: '2026-09-21',
    failedAttempts: 0,
  },
  {
    id: 'SUB-304',
    customerId: 'CUST-1007', // CloudScale Technologies
    plan: 'Scale Growth Plan',
    amount: 55000,
    billingCycle: 'monthly',
    status: 'past_due',
    lastPaymentStatus: 'failed',
    nextBillingDate: '2026-08-20',
    failedAttempts: 3,
  },
  {
    id: 'SUB-305',
    customerId: 'CUST-1010', // ByteCraft Solutions
    plan: 'Developer Pro',
    amount: 4999,
    billingCycle: 'monthly',
    status: 'active',
    lastPaymentStatus: 'success',
    nextBillingDate: '2026-09-21',
    failedAttempts: 0,
  },
  {
    id: 'SUB-306',
    customerId: 'CUST-1008', // Vanguard Media House
    plan: 'Agency Standard',
    amount: 18500,
    billingCycle: 'monthly',
    status: 'active',
    lastPaymentStatus: 'success',
    nextBillingDate: '2026-09-21',
    failedAttempts: 0,
  },
  {
    id: 'SUB-307',
    customerId: 'CUST-1012', // OmniReach Marketing
    plan: 'Growth Suite',
    amount: 8499,
    billingCycle: 'monthly',
    status: 'active',
    lastPaymentStatus: 'success',
    nextBillingDate: '2026-09-21',
    failedAttempts: 0,
  },
  {
    id: 'SUB-308',
    customerId: 'CUST-1014', // FinCore Labs
    plan: 'Fintech Pro Suite',
    amount: 32000,
    billingCycle: 'monthly',
    status: 'past_due',
    lastPaymentStatus: 'failed',
    nextBillingDate: '2026-08-21',
    failedAttempts: 1,
  },
  {
    id: 'SUB-309',
    customerId: 'CUST-1001', // Rahul Enterprises
    plan: 'Enterprise Add-On',
    amount: 25000,
    billingCycle: 'quarterly',
    status: 'active',
    lastPaymentStatus: 'success',
    nextBillingDate: '2026-11-15',
    failedAttempts: 0,
  },
  {
    id: 'SUB-310',
    customerId: 'CUST-1007', // CloudScale Technologies
    plan: 'Analytics Module',
    amount: 42000,
    billingCycle: 'monthly',
    status: 'past_due',
    lastPaymentStatus: 'failed',
    nextBillingDate: '2026-08-17',
    failedAttempts: 1,
  },
  {
    id: 'SUB-311',
    customerId: 'CUST-1015', // UrbanCraft Commerce
    plan: 'Commerce Starter',
    amount: 6800,
    billingCycle: 'monthly',
    status: 'active',
    lastPaymentStatus: 'success',
    nextBillingDate: '2026-09-21',
    failedAttempts: 0,
  },
  {
    id: 'SUB-312',
    customerId: 'CUST-1013', // Astra Logistics Ltd
    plan: 'Fleet Tracking SaaS',
    amount: 52000,
    billingCycle: 'monthly',
    status: 'past_due',
    lastPaymentStatus: 'failed',
    nextBillingDate: '2026-08-19',
    failedAttempts: 1,
  },
];
