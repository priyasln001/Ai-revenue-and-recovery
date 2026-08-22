export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'promise_to_pay';

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  daysOverdue: number;
  status: InvoiceStatus;
  promiseToPayDate: string | null;
}

export const INVOICES_DATA: Invoice[] = [
  {
    id: 'INV-10001',
    customerId: 'CUST-1001', // Rahul Enterprises
    amount: 95000,
    issueDate: '2026-07-01',
    dueDate: '2026-07-31',
    daysOverdue: 0,
    status: 'paid',
    promiseToPayDate: null,
  },
  {
    id: 'INV-10002',
    customerId: 'CUST-1002', // Apex Solutions
    amount: 145000,
    issueDate: '2026-08-01',
    dueDate: '2026-08-10',
    daysOverdue: 12,
    status: 'overdue',
    promiseToPayDate: null,
  },
  {
    id: 'INV-10003',
    customerId: 'CUST-1003', // TechNova Pvt Ltd
    amount: 75000,
    issueDate: '2026-07-15',
    dueDate: '2026-08-14',
    daysOverdue: 7,
    status: 'overdue',
    promiseToPayDate: null,
  },
  {
    id: 'INV-10004',
    customerId: 'CUST-1005', // Zenith Global Systems
    amount: 240000,
    issueDate: '2026-06-15',
    dueDate: '2026-07-15',
    daysOverdue: 0,
    status: 'paid',
    promiseToPayDate: null,
  },
  {
    id: 'INV-10005',
    customerId: 'CUST-1009', // Pulse Health Technologies
    amount: 210000,
    issueDate: '2026-06-20',
    dueDate: '2026-07-20',
    daysOverdue: 32,
    status: 'overdue',
    promiseToPayDate: null,
  },
  {
    id: 'INV-10006',
    customerId: 'CUST-1011', // Hyperion Capital Services
    amount: 350000,
    issueDate: '2026-07-10',
    dueDate: '2026-08-10',
    daysOverdue: 11,
    status: 'promise_to_pay',
    promiseToPayDate: '2026-08-25',
  },
  {
    id: 'INV-10007',
    customerId: 'CUST-1013', // Astra Logistics Ltd
    amount: 82000,
    issueDate: '2026-07-20',
    dueDate: '2026-08-19',
    daysOverdue: 2,
    status: 'promise_to_pay',
    promiseToPayDate: '2026-08-23',
  },
  {
    id: 'INV-10008',
    customerId: 'CUST-1007', // CloudScale Technologies
    amount: 115000,
    issueDate: '2026-08-01',
    dueDate: '2026-08-31',
    daysOverdue: 0,
    status: 'pending',
    promiseToPayDate: null,
  },
  {
    id: 'INV-10009',
    customerId: 'CUST-1016', // Titan Industrial Supplies
    amount: 98000,
    issueDate: '2026-07-05',
    dueDate: '2026-08-05',
    daysOverdue: 16,
    status: 'overdue',
    promiseToPayDate: null,
  },
  {
    id: 'INV-10010',
    customerId: 'CUST-1005', // Zenith Global Systems
    amount: 180000,
    issueDate: '2026-06-30',
    dueDate: '2026-07-30',
    daysOverdue: 22,
    status: 'overdue',
    promiseToPayDate: null,
  },
  {
    id: 'INV-10011',
    customerId: 'CUST-1003', // TechNova Pvt Ltd
    amount: 125000,
    issueDate: '2026-05-10',
    dueDate: '2026-06-10',
    daysOverdue: 0,
    status: 'paid',
    promiseToPayDate: null,
  },
  {
    id: 'INV-10012',
    customerId: 'CUST-1014', // FinCore Labs
    amount: 64000,
    issueDate: '2026-08-05',
    dueDate: '2026-09-05',
    daysOverdue: 0,
    status: 'pending',
    promiseToPayDate: null,
  },
  {
    id: 'INV-10013',
    customerId: 'CUST-1006', // Nexus Logistics
    amount: 45000,
    issueDate: '2026-07-25',
    dueDate: '2026-08-25',
    daysOverdue: 0,
    status: 'pending',
    promiseToPayDate: null,
  },
];

