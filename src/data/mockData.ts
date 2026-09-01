export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  description: string;
  trend?: string;
  isPositive?: boolean;
  accentColor: 'rose' | 'emerald' | 'indigo' | 'amber';
}

export interface WeeklyChartPoint {
  day: string;
  rawAtRisk: number;
  rawRecovered: number;
  atRisk: string;
  recovered: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface InterventionItem {
  name: string;
  amount: number;
  formattedAmount: string;
  percentage: number;
  color: string;
}

export type ActivityStatus = 'Recovered' | 'In Progress' | 'Escalated' | 'Failed';

export interface ActivityRecord {
  id: string;
  customer: string;
  issue: string;
  amountAtRisk: string;
  intervention: string;
  status: ActivityStatus;
  recoveredAmount: string;
  timestamp: string;
}

export type RecoveryTypeFilter = 'All' | 'Payment Failure' | 'Checkout Abandonment' | 'Subscription Failure' | 'Overdue Invoice';
export type RiskLevelFilter = 'All' | 'High' | 'Medium' | 'Low';
export type OpportunityStatusFilter = 'All' | 'New' | 'In Progress' | 'Action Accepted' | 'Recovered' | 'Escalated' | 'Dismissed';
export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface OpportunityItem {
  id: string;
  transactionId: string;
  customer: string;
  customerType: string;
  issue: string;
  recoveryType: 'Payment Failure' | 'Checkout Abandonment' | 'Subscription Failure' | 'Overdue Invoice';
  amountAtRisk: string;
  rawAmount: number;
  riskScore: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  probability: number;
  expectedRecovery?: string;
  rawExpectedRecovery?: number;
  whyThisAction?: string;
  priority: PriorityLevel;
  priorityScore?: number;
  priorityLevel?: PriorityLevel;
  recommendedAction: string;
  attempts: number;
  status: 'New' | 'In Progress' | 'Action Accepted' | 'Recovered' | 'Escalated' | 'Dismissed';
  aiDiagnosis: string;
  createdAt: string;
  factors?: {
    paymentFailureHistory: number;
    failedAttempts: number;
    amountAtRisk: number;
    daysOverdue: number;
    customerPaymentHistory: number;
    eventSeverity: number;
  };
}

export const KPI_METRICS: KpiMetric[] = [
  {
    id: 'kpi-at-risk',
    title: 'Revenue at Risk',
    value: '₹18,40,000',
    description: 'Potential revenue currently at risk',
    trend: '+4.2%',
    isPositive: false,
    accentColor: 'rose',
  },
  {
    id: 'kpi-recovered',
    title: 'Revenue Recovered',
    value: '₹7,25,000',
    description: 'Revenue recovered through interventions',
    trend: '+12.8%',
    isPositive: true,
    accentColor: 'emerald',
  },
  {
    id: 'kpi-rate',
    title: 'Recovery Rate',
    value: '39.4%',
    description: 'Recovered / Initial Revenue at Risk',
    trend: '+3.1%',
    isPositive: true,
    accentColor: 'indigo',
  },
  {
    id: 'kpi-cases',
    title: 'Active Recovery Cases',
    value: '47',
    description: 'Cases currently being monitored',
    trend: 'Active',
    isPositive: undefined,
    accentColor: 'amber',
  },
];

export const OPPORTUNITIES_SUMMARY_KPIS: KpiMetric[] = [
  {
    id: 'opp-total',
    title: 'Total Opportunities',
    value: '142',
    description: 'Total detected recovery cases',
    trend: 'Active',
    isPositive: undefined,
    accentColor: 'indigo',
  },
  {
    id: 'opp-high-priority',
    title: 'High Priority',
    value: '38',
    description: 'Requiring immediate intervention',
    trend: 'Urgent',
    isPositive: false,
    accentColor: 'rose',
  },
  {
    id: 'opp-revenue-risk',
    title: 'Revenue at Risk',
    value: '₹18,40,000',
    description: 'Aggregate value of open cases',
    trend: 'Monitored',
    isPositive: false,
    accentColor: 'amber',
  },
  {
    id: 'opp-potential-recovery',
    title: 'Potential Recovery',
    value: '₹9,65,000',
    description: 'Estimated recoverable revenue',
    trend: '52.4% Est.',
    isPositive: true,
    accentColor: 'emerald',
  },
];

export const WEEKLY_RECOVERY_DATA: WeeklyChartPoint[] = [
  { day: 'Mon', rawAtRisk: 210000, rawRecovered: 72000, atRisk: '₹2,10,000', recovered: '₹72,000' },
  { day: 'Tue', rawAtRisk: 280000, rawRecovered: 105000, atRisk: '₹2,80,000', recovered: '₹1,05,000' },
  { day: 'Wed', rawAtRisk: 240000, rawRecovered: 92000, atRisk: '₹2,40,000', recovered: '₹92,000' },
  { day: 'Thu', rawAtRisk: 310000, rawRecovered: 120000, atRisk: '₹3,10,000', recovered: '₹1,20,000' },
  { day: 'Fri', rawAtRisk: 270000, rawRecovered: 98000, atRisk: '₹2,70,000', recovered: '₹98,000' },
  { day: 'Sat', rawAtRisk: 260000, rawRecovered: 105000, atRisk: '₹2,60,000', recovered: '₹1,05,000' },
  { day: 'Sun', rawAtRisk: 270000, rawRecovered: 133000, atRisk: '₹2,70,000', recovered: '₹1,33,000' },
];

export const RECOVERY_FUNNEL_DATA: FunnelStage[] = [
  { stage: 'Detected', count: 142, percentage: 100 },
  { stage: 'Diagnosed', count: 126, percentage: 88.7 },
  { stage: 'Action Selected', count: 113, percentage: 79.5 },
  { stage: 'Action Executed', count: 91, percentage: 64.0 },
  { stage: 'Recovered', count: 61, percentage: 42.9 },
];

export const INTERVENTION_BREAKDOWN_DATA: InterventionItem[] = [
  { name: 'Payment Retry', amount: 240000, formattedAmount: '₹2,40,000', percentage: 33.1, color: '#6366F1' },
  { name: 'Checkout Recovery', amount: 155000, formattedAmount: '₹1,55,000', percentage: 21.4, color: '#0EA5E9' },
  { name: 'Subscription Recovery', amount: 130000, formattedAmount: '₹1,30,000', percentage: 17.9, color: '#10B981' },
  { name: 'Payment Link', amount: 105000, formattedAmount: '₹1,05,000', percentage: 14.5, color: '#F59E0B' },
  { name: 'Invoice Reminder', amount: 95000, formattedAmount: '₹95,000', percentage: 13.1, color: '#8B5CF6' },
];

export const RECENT_RECOVERY_ACTIVITY: ActivityRecord[] = [
  {
    id: 'ACT-101',
    customer: 'Rahul Enterprises',
    issue: 'Payment Failed',
    amountAtRisk: '₹48,500',
    intervention: 'Payment Retry',
    status: 'Recovered',
    recoveredAmount: '₹48,500',
    timestamp: '10 mins ago',
  },
  {
    id: 'ACT-102',
    customer: 'Apex Solutions',
    issue: 'Checkout Abandoned',
    amountAtRisk: '₹12,999',
    intervention: 'Payment Link',
    status: 'Recovered',
    recoveredAmount: '₹12,999',
    timestamp: '32 mins ago',
  },
  {
    id: 'ACT-103',
    customer: 'TechNova Pvt Ltd',
    issue: 'Invoice Overdue',
    amountAtRisk: '₹75,000',
    intervention: 'Reminder',
    status: 'In Progress',
    recoveredAmount: '₹0',
    timestamp: '1 hour ago',
  },
  {
    id: 'ACT-104',
    customer: 'GreenCart',
    issue: 'Subscription Failed',
    amountAtRisk: '₹2,499',
    intervention: 'Retry',
    status: 'Recovered',
    recoveredAmount: '₹2,499',
    timestamp: '2 hours ago',
  },
  {
    id: 'ACT-105',
    customer: 'Horizon Dynamics',
    issue: 'Card Expired',
    amountAtRisk: '₹1,25,000',
    intervention: 'Account Updater',
    status: 'Escalated',
    recoveredAmount: '₹0',
    timestamp: '4 hours ago',
  },
  {
    id: 'ACT-106',
    customer: 'UrbanCraft Retail',
    issue: 'Gateway Timeout',
    amountAtRisk: '₹34,200',
    intervention: 'Payment Link',
    status: 'Failed',
    recoveredAmount: '₹0',
    timestamp: '6 hours ago',
  },
];

export const RECOVERY_OPPORTUNITIES_DATA: OpportunityItem[] = [
  {
    id: 'OPP-101',
    transactionId: 'TXN-984210',
    customer: 'Rahul Enterprises',
    customerType: 'Enterprise B2B',
    issue: 'Temporary Payment Failure',
    recoveryType: 'Payment Failure',
    amountAtRisk: '₹48,500',
    rawAmount: 48500,
    riskScore: 91,
    riskLevel: 'High',
    probability: 84,
    expectedRecovery: '₹40,740',
    rawExpectedRecovery: 40740,
    whyThisAction: 'Customer has a strong payment history and the failure appears temporary.',
    priority: 'High',
    recommendedAction: 'Retry Payment',
    attempts: 0,
    status: 'New',
    aiDiagnosis: 'Payment appears to have failed due to a temporary bank decline. The customer has a strong recent payment history, making a retry a potentially suitable recovery action.',
    createdAt: '12 mins ago',
  },
  {
    id: 'OPP-102',
    transactionId: 'TXN-984211',
    customer: 'Apex Solutions',
    customerType: 'SaaS Pro',
    issue: 'Checkout Abandoned',
    recoveryType: 'Checkout Abandonment',
    amountAtRisk: '₹12,999',
    rawAmount: 12999,
    riskScore: 78,
    riskLevel: 'Medium',
    probability: 72,
    expectedRecovery: '₹9,359',
    rawExpectedRecovery: 9359,
    whyThisAction: 'Interrupted at 3DS verification with high purchase intent; payment link enables quick completion.',
    priority: 'High',
    recommendedAction: 'Send Payment Link',
    attempts: 0,
    status: 'New',
    aiDiagnosis: 'Checkout process was interrupted right at 3DS verification stage. High intent user; personalized payment link with 24h validity is advised.',
    createdAt: '25 mins ago',
  },
  {
    id: 'OPP-103',
    transactionId: 'TXN-984212',
    customer: 'TechNova Pvt Ltd',
    customerType: 'Corporate B2B',
    issue: 'Overdue Invoice',
    recoveryType: 'Overdue Invoice',
    amountAtRisk: '₹75,000',
    rawAmount: 75000,
    riskScore: 86,
    riskLevel: 'High',
    probability: 69,
    expectedRecovery: '₹51,750',
    rawExpectedRecovery: 51750,
    whyThisAction: 'Invoice is 7 days past due and accounts team consistently opens email notifications.',
    priority: 'High',
    recommendedAction: 'Send Reminder',
    attempts: 1,
    status: 'In Progress',
    aiDiagnosis: 'Invoice #INV-2024-88 past due by 7 days. Customer accounts team opens emails reliably; gentle automated reminder sequence recommended.',
    createdAt: '45 mins ago',
  },
  {
    id: 'OPP-104',
    transactionId: 'TXN-984213',
    customer: 'GreenCart',
    customerType: 'E-commerce Subscriber',
    issue: 'Subscription Failed',
    recoveryType: 'Subscription Failure',
    amountAtRisk: '₹2,499',
    rawAmount: 2499,
    riskScore: 42,
    riskLevel: 'Low',
    probability: 88,
    expectedRecovery: '₹2,199',
    rawExpectedRecovery: 2199,
    whyThisAction: 'Failed due to a soft card limit; off-peak retry predicted to succeed.',
    priority: 'Low',
    recommendedAction: 'Retry Payment',
    attempts: 0,
    status: 'New',
    aiDiagnosis: 'Recurring subscription renewal failed due to soft card limit. Intelligent off-peak retry window predicted high success rate.',
    createdAt: '1 hour ago',
  },
  {
    id: 'OPP-105',
    transactionId: 'TXN-984214',
    customer: 'Zenith Global Systems',
    customerType: 'Enterprise',
    issue: 'Card Expired',
    recoveryType: 'Subscription Failure',
    amountAtRisk: '₹1,20,000',
    rawAmount: 120000,
    riskScore: 84,
    riskLevel: 'High',
    probability: 78,
    expectedRecovery: '₹93,600',
    rawExpectedRecovery: 93600,
    whyThisAction: 'Corporate card expired last month; updating payment method resolves underlying failure.',
    priority: 'High',
    recommendedAction: 'Request Payment Method Update',
    attempts: 1,
    status: 'In Progress',
    aiDiagnosis: 'Primary corporate card on file expired last month. Automated account updater service engaged alongside card update portal prompt.',
    createdAt: '2 hours ago',
  },
  {
    id: 'OPP-106',
    transactionId: 'TXN-984215',
    customer: 'Nexus Logistics',
    customerType: 'Mid-Market B2B',
    issue: 'Authentication Timeout',
    recoveryType: 'Payment Failure',
    amountAtRisk: '₹34,500',
    rawAmount: 34500,
    riskScore: 68,
    riskLevel: 'Medium',
    probability: 65,
    expectedRecovery: '₹22,425',
    rawExpectedRecovery: 22425,
    whyThisAction: 'Issuer 3DS server timed out; scheduling retry in next window avoids immediate re-decline.',
    priority: 'Medium',
    recommendedAction: 'Retry Later',
    attempts: 0,
    status: 'New',
    aiDiagnosis: 'Issuer 3DS server experienced temporary 504 gateway timeout. Waiting 4 hours before secondary retry window recommended.',
    createdAt: '3 hours ago',
  },
  {
    id: 'OPP-107',
    transactionId: 'TXN-984216',
    customer: 'CloudScale Technologies',
    customerType: 'Scaleup SaaS',
    issue: 'Insufficient Funds',
    recoveryType: 'Payment Failure',
    amountAtRisk: '₹55,000',
    rawAmount: 55000,
    riskScore: 92,
    riskLevel: 'High',
    probability: 81,
    expectedRecovery: '₹44,550',
    rawExpectedRecovery: 44550,
    whyThisAction: 'Decline is related to month-end cycle timing; liquidity resets on 1st of month.',
    priority: 'High',
    recommendedAction: 'Retry Payment',
    attempts: 2,
    status: 'In Progress',
    aiDiagnosis: 'Soft decline due to monthly billing cycle alignment. Historical data indicates liquidity resets on 1st of month.',
    createdAt: '4 hours ago',
  },
  {
    id: 'OPP-108',
    transactionId: 'TXN-984217',
    customer: 'Vanguard Media House',
    customerType: 'Agency',
    issue: 'Abandoned Cart',
    recoveryType: 'Checkout Abandonment',
    amountAtRisk: '₹18,500',
    rawAmount: 18500,
    riskScore: 56,
    riskLevel: 'Medium',
    probability: 58,
    expectedRecovery: '₹10,730',
    rawExpectedRecovery: 10730,
    whyThisAction: 'Cart exited at tax calculation step; direct payment link clarifies final total.',
    priority: 'Medium',
    recommendedAction: 'Send Payment Link',
    attempts: 0,
    status: 'New',
    aiDiagnosis: 'User exited checkout at tax calculation step. Sending a direct invoice link with clear itemized pricing is suggested.',
    createdAt: '5 hours ago',
  },
  {
    id: 'OPP-109',
    transactionId: 'TXN-984218',
    customer: 'Pulse Health Technologies',
    customerType: 'Healthcare SaaS',
    issue: 'Invoice Overdue 30+ Days',
    recoveryType: 'Overdue Invoice',
    amountAtRisk: '₹2,10,000',
    rawAmount: 210000,
    riskScore: 95,
    riskLevel: 'High',
    probability: 45,
    expectedRecovery: '₹94,500',
    rawExpectedRecovery: 94500,
    whyThisAction: 'Multiple automated reminders unanswered on high-value invoice; manual call required.',
    priority: 'High',
    recommendedAction: 'Escalate',
    attempts: 3,
    status: 'Escalated',
    aiDiagnosis: 'Multiple automated reminders unacknowledged. High revenue impact; escalating to account manager for direct call.',
    createdAt: '6 hours ago',
  },
  {
    id: 'OPP-110',
    transactionId: 'TXN-984219',
    customer: 'ByteCraft Solutions',
    customerType: 'Startup Plan',
    issue: 'Recurring Payment Declined',
    recoveryType: 'Subscription Failure',
    amountAtRisk: '₹4,999',
    rawAmount: 4999,
    riskScore: 35,
    riskLevel: 'Low',
    probability: 91,
    expectedRecovery: '₹4,549',
    rawExpectedRecovery: 4549,
    whyThisAction: 'Early morning retry window has strong historical success for soft declines.',
    priority: 'Low',
    recommendedAction: 'Retry Payment',
    attempts: 1,
    status: 'Recovered',
    aiDiagnosis: 'Automatic soft retry succeeded on second attempt during early morning window.',
    createdAt: '7 hours ago',
  },
  {
    id: 'OPP-111',
    transactionId: 'TXN-984220',
    customer: 'Hyperion Capital Services',
    customerType: 'Fintech Corporate',
    issue: 'Stolen/Lost Card Flag',
    recoveryType: 'Payment Failure',
    amountAtRisk: '₹1,50,000',
    rawAmount: 150000,
    riskScore: 98,
    riskLevel: 'High',
    probability: 30,
    expectedRecovery: '₹45,000',
    rawExpectedRecovery: 45000,
    whyThisAction: 'Hard decline code received; automated retries halted for compliance.',
    priority: 'High',
    recommendedAction: 'Stop',
    attempts: 1,
    status: 'Escalated',
    aiDiagnosis: 'Hard decline response received (Stolen/Lost Card code). All automatic retries halted immediately to prevent compliance flags.',
    createdAt: '8 hours ago',
  },
  {
    id: 'OPP-112',
    transactionId: 'TXN-984221',
    customer: 'OmniReach Marketing',
    customerType: 'E-commerce SMB',
    issue: 'Checkout Dropoff',
    recoveryType: 'Checkout Abandonment',
    amountAtRisk: '₹8,499',
    rawAmount: 8499,
    riskScore: 48,
    riskLevel: 'Low',
    probability: 62,
    expectedRecovery: '₹5,269',
    rawExpectedRecovery: 5269,
    whyThisAction: 'Dropoff caused by network disruption; saved basket email facilitates instant recovery.',
    priority: 'Low',
    recommendedAction: 'Send Payment Link',
    attempts: 0,
    status: 'New',
    aiDiagnosis: 'Customer abandoned cart due to network disruption. Instant email reminder with saved basket link recommended.',
    createdAt: '9 hours ago',
  },
];

// Re-export relational synthetic entities and utilities for centralized access
export * from './customers';
export * from './transactions';
export * from './recoveryCases';
export * from './invoices';
export * from './subscriptions';
export * from './utils';

