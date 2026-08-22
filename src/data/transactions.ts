export type TransactionStatus = 'success' | 'failed' | 'pending';

export type PaymentFailureReason =
  | 'temporary_bank_decline'
  | 'insufficient_funds'
  | 'expired_card'
  | 'authentication_timeout'
  | 'mandate_failure'
  | 'network_error'
  | null;

export type PaymentMethodType = 'card' | 'upi' | 'netbanking' | 'ach' | 'mandate';

export interface Transaction {
  id: string;
  customerId: string;
  invoiceId?: string;
  amount: number;
  currency: 'INR' | 'USD';
  status: TransactionStatus;
  paymentMethod: PaymentMethodType;
  failureReason: PaymentFailureReason;
  createdAt: string;
  attemptCount: number;
  gateway?: 'Razorpay' | 'Stripe' | 'Adyen';
}

export const TRANSACTIONS_DATA: Transaction[] = [
  // CUST-1001: Rahul Enterprises
  {
    id: 'TXN-1001',
    customerId: 'CUST-1001',
    invoiceId: 'INV-10001',
    amount: 48500,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'card',
    failureReason: 'temporary_bank_decline',
    createdAt: '2026-08-21T10:15:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },
  {
    id: 'TXN-1002',
    customerId: 'CUST-1001',
    invoiceId: 'INV-10001',
    amount: 48500,
    currency: 'INR',
    status: 'success',
    paymentMethod: 'card',
    failureReason: null,
    createdAt: '2026-07-21T09:30:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },
  {
    id: 'TXN-1003',
    customerId: 'CUST-1001',
    invoiceId: 'INV-10001',
    amount: 25000,
    currency: 'INR',
    status: 'success',
    paymentMethod: 'netbanking',
    failureReason: null,
    createdAt: '2026-06-15T11:20:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },

  // CUST-1002: Apex Solutions
  {
    id: 'TXN-1004',
    customerId: 'CUST-1002',
    invoiceId: 'INV-10002',
    amount: 12999,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'card',
    failureReason: 'authentication_timeout',
    createdAt: '2026-08-21T11:45:00Z',
    attemptCount: 1,
    gateway: 'Stripe',
  },
  {
    id: 'TXN-1005',
    customerId: 'CUST-1002',
    invoiceId: 'INV-10002',
    amount: 12999,
    currency: 'INR',
    status: 'success',
    paymentMethod: 'card',
    failureReason: null,
    createdAt: '2026-07-21T11:00:00Z',
    attemptCount: 1,
    gateway: 'Stripe',
  },

  // CUST-1003: TechNova Pvt Ltd
  {
    id: 'TXN-1006',
    customerId: 'CUST-1003',
    invoiceId: 'INV-10003',
    amount: 75000,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'netbanking',
    failureReason: 'insufficient_funds',
    createdAt: '2026-08-20T14:20:00Z',
    attemptCount: 2,
    gateway: 'Razorpay',
  },
  {
    id: 'TXN-1007',
    customerId: 'CUST-1003',
    invoiceId: 'INV-10003',
    amount: 75000,
    currency: 'INR',
    status: 'success',
    paymentMethod: 'netbanking',
    failureReason: null,
    createdAt: '2026-07-15T10:00:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },

  // CUST-1004: GreenCart Retail
  {
    id: 'TXN-1008',
    customerId: 'CUST-1004',
    amount: 2499,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'upi',
    failureReason: 'temporary_bank_decline',
    createdAt: '2026-08-21T08:10:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },
  {
    id: 'TXN-1009',
    customerId: 'CUST-1004',
    amount: 2499,
    currency: 'INR',
    status: 'success',
    paymentMethod: 'upi',
    failureReason: null,
    createdAt: '2026-07-21T08:00:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },

  // CUST-1005: Zenith Global Systems
  {
    id: 'TXN-1010',
    customerId: 'CUST-1005',
    invoiceId: 'INV-10010',
    amount: 120000,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'card',
    failureReason: 'expired_card',
    createdAt: '2026-08-21T06:00:00Z',
    attemptCount: 2,
    gateway: 'Adyen',
  },
  {
    id: 'TXN-1011',
    customerId: 'CUST-1005',
    invoiceId: 'INV-10004',
    amount: 240000,
    currency: 'INR',
    status: 'success',
    paymentMethod: 'card',
    failureReason: null,
    createdAt: '2026-06-15T09:00:00Z',
    attemptCount: 1,
    gateway: 'Adyen',
  },

  // CUST-1006: Nexus Logistics
  {
    id: 'TXN-1012',
    customerId: 'CUST-1006',
    amount: 34500,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'netbanking',
    failureReason: 'network_error',
    createdAt: '2026-08-21T07:30:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },
  {
    id: 'TXN-1013',
    customerId: 'CUST-1006',
    invoiceId: 'INV-10013',
    amount: 45000,
    currency: 'INR',
    status: 'success',
    paymentMethod: 'netbanking',
    failureReason: null,
    createdAt: '2026-07-25T14:00:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },

  // CUST-1007: CloudScale Technologies
  {
    id: 'TXN-1014',
    customerId: 'CUST-1007',
    amount: 55000,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'card',
    failureReason: 'insufficient_funds',
    createdAt: '2026-08-20T16:00:00Z',
    attemptCount: 3,
    gateway: 'Stripe',
  },
  {
    id: 'TXN-1015',
    customerId: 'CUST-1007',
    invoiceId: 'INV-10008',
    amount: 115000,
    currency: 'INR',
    status: 'pending',
    paymentMethod: 'card',
    failureReason: null,
    createdAt: '2026-08-01T12:00:00Z',
    attemptCount: 1,
    gateway: 'Stripe',
  },

  // CUST-1008: Vanguard Media House
  {
    id: 'TXN-1016',
    customerId: 'CUST-1008',
    amount: 18500,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'card',
    failureReason: 'authentication_timeout',
    createdAt: '2026-08-21T05:15:00Z',
    attemptCount: 1,
    gateway: 'Stripe',
  },
  {
    id: 'TXN-1017',
    customerId: 'CUST-1008',
    amount: 18500,
    currency: 'INR',
    status: 'success',
    paymentMethod: 'card',
    failureReason: null,
    createdAt: '2026-07-21T05:00:00Z',
    attemptCount: 1,
    gateway: 'Stripe',
  },

  // CUST-1009: Pulse Health Technologies
  {
    id: 'TXN-1018',
    customerId: 'CUST-1009',
    invoiceId: 'INV-10005',
    amount: 210000,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'ach',
    failureReason: 'mandate_failure',
    createdAt: '2026-08-19T13:40:00Z',
    attemptCount: 4,
    gateway: 'Razorpay',
  },
  {
    id: 'TXN-1019',
    customerId: 'CUST-1009',
    invoiceId: 'INV-10005',
    amount: 210000,
    currency: 'INR',
    status: 'success',
    paymentMethod: 'ach',
    failureReason: null,
    createdAt: '2026-06-20T10:00:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },

  // CUST-1010: ByteCraft Solutions
  {
    id: 'TXN-1020',
    customerId: 'CUST-1010',
    amount: 4999,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'upi',
    failureReason: 'temporary_bank_decline',
    createdAt: '2026-08-21T04:20:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },
  {
    id: 'TXN-1021',
    customerId: 'CUST-1010',
    amount: 4999,
    currency: 'INR',
    status: 'success',
    paymentMethod: 'upi',
    failureReason: null,
    createdAt: '2026-08-21T04:22:00Z',
    attemptCount: 2,
    gateway: 'Razorpay',
  },

  // CUST-1011: Hyperion Capital Services
  {
    id: 'TXN-1022',
    customerId: 'CUST-1011',
    amount: 150000,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'card',
    failureReason: 'expired_card',
    createdAt: '2026-08-21T02:10:00Z',
    attemptCount: 1,
    gateway: 'Adyen',
  },
  {
    id: 'TXN-1023',
    customerId: 'CUST-1011',
    invoiceId: 'INV-10006',
    amount: 350000,
    currency: 'INR',
    status: 'pending',
    paymentMethod: 'card',
    failureReason: null,
    createdAt: '2026-07-10T11:00:00Z',
    attemptCount: 1,
    gateway: 'Adyen',
  },

  // CUST-1012: OmniReach Marketing
  {
    id: 'TXN-1024',
    customerId: 'CUST-1012',
    amount: 8499,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'card',
    failureReason: 'authentication_timeout',
    createdAt: '2026-08-21T01:05:00Z',
    attemptCount: 1,
    gateway: 'Stripe',
  },
  {
    id: 'TXN-1025',
    customerId: 'CUST-1012',
    amount: 8499,
    currency: 'INR',
    status: 'success',
    paymentMethod: 'card',
    failureReason: null,
    createdAt: '2026-07-21T01:00:00Z',
    attemptCount: 1,
    gateway: 'Stripe',
  },

  // CUST-1013: Astra Logistics Ltd
  {
    id: 'TXN-1026',
    customerId: 'CUST-1013',
    invoiceId: 'INV-10007',
    amount: 82000,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'mandate',
    failureReason: 'mandate_failure',
    createdAt: '2026-08-20T09:15:00Z',
    attemptCount: 2,
    gateway: 'Razorpay',
  },
  {
    id: 'TXN-1027',
    customerId: 'CUST-1013',
    invoiceId: 'INV-10007',
    amount: 82000,
    currency: 'INR',
    status: 'pending',
    paymentMethod: 'mandate',
    failureReason: null,
    createdAt: '2026-07-20T10:00:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },

  // CUST-1014: FinCore Labs
  {
    id: 'TXN-1028',
    customerId: 'CUST-1014',
    amount: 32000,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'card',
    failureReason: 'temporary_bank_decline',
    createdAt: '2026-08-21T09:50:00Z',
    attemptCount: 1,
    gateway: 'Stripe',
  },
  {
    id: 'TXN-1029',
    customerId: 'CUST-1014',
    invoiceId: 'INV-10012',
    amount: 64000,
    currency: 'INR',
    status: 'pending',
    paymentMethod: 'card',
    failureReason: null,
    createdAt: '2026-08-05T09:00:00Z',
    attemptCount: 1,
    gateway: 'Stripe',
  },

  // CUST-1015: UrbanCraft Commerce
  {
    id: 'TXN-1030',
    customerId: 'CUST-1015',
    amount: 6800,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'upi',
    failureReason: 'authentication_timeout',
    createdAt: '2026-08-21T08:40:00Z',
    attemptCount: 1,
    gateway: 'Razorpay',
  },

  // CUST-1016: Titan Industrial Supplies
  {
    id: 'TXN-1031',
    customerId: 'CUST-1016',
    invoiceId: 'INV-10009',
    amount: 98000,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'netbanking',
    failureReason: 'insufficient_funds',
    createdAt: '2026-08-18T15:30:00Z',
    attemptCount: 3,
    gateway: 'Razorpay',
  },
];
