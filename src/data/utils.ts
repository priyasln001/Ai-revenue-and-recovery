import { Customer, CUSTOMERS_DATA } from './customers';
import { Transaction, TRANSACTIONS_DATA } from './transactions';
import { RecoveryCaseData, RECOVERY_CASES_DATA } from './recoveryCases';
import { Invoice, INVOICES_DATA } from './invoices';
import { Subscription, SUBSCRIPTIONS_DATA } from './subscriptions';

/**
 * Retrieve a customer by their unique ID
 */
export const getCustomerById = (id: string): Customer | undefined => {
  return CUSTOMERS_DATA.find((c) => c.id === id);
};

/**
 * Retrieve a transaction by its unique ID
 */
export const getTransactionById = (id: string): Transaction | undefined => {
  return TRANSACTIONS_DATA.find((t) => t.id === id);
};

/**
 * Retrieve a recovery case by its unique ID
 */
export const getRecoveryCaseById = (id: string): RecoveryCaseData | undefined => {
  return RECOVERY_CASES_DATA.find((rc) => rc.id === id);
};

/**
 * Retrieve an invoice by its unique ID
 */
export const getInvoiceById = (id: string): Invoice | undefined => {
  return INVOICES_DATA.find((inv) => inv.id === id);
};

/**
 * Retrieve a subscription by its unique ID
 */
export const getSubscriptionById = (id: string): Subscription | undefined => {
  return SUBSCRIPTIONS_DATA.find((sub) => sub.id === id);
};

/**
 * Get all transactions belonging to a specific customer
 */
export const getCustomerTransactions = (customerId: string): Transaction[] => {
  return TRANSACTIONS_DATA.filter((t) => t.customerId === customerId);
};

/**
 * Get all recovery cases associated with a specific customer
 */
export const getCustomerRecoveryCases = (customerId: string): RecoveryCaseData[] => {
  return RECOVERY_CASES_DATA.filter((rc) => rc.customerId === customerId);
};

/**
 * Get all invoices associated with a specific customer
 */
export const getCustomerInvoices = (customerId: string): Invoice[] => {
  return INVOICES_DATA.filter((inv) => inv.customerId === customerId);
};

/**
 * Get all subscriptions associated with a specific customer
 */
export const getCustomerSubscriptions = (customerId: string): Subscription[] => {
  return SUBSCRIPTIONS_DATA.filter((sub) => sub.customerId === customerId);
};
