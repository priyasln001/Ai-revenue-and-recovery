import {
  calculateRiskScore,
  calculateRecoveryProbability,
  calculatePriorityScore,
  getPriorityLevel,
  getRiskLevel,
  getRecommendedAction,
  clamp,
  normalizeAmountFactor
} from './recoveryScoring';
import { Customer, RecoveryCaseData, Transaction, Invoice } from '../data';

export interface ValidationTestResult {
  scenario: string;
  passed: boolean;
  details: string;
}

/**
 * Runs validation suites covering all 10 required test scenarios & boundary conditions
 */
export const runScoringEngineValidation = (): ValidationTestResult[] => {
  const results: ValidationTestResult[] = [];

  // Scenario 1: High-risk failed payment
  const highRiskCase: Partial<RecoveryCaseData> = { attempts: 2, amountAtRisk: 150000, type: 'payment_failure' };
  const highRiskCustomer: Customer = {
    id: 'T-01',
    name: 'Risk Corp',
    company: 'Risk Corp',
    customerType: 'Enterprise',
    email: 'test@risk.com',
    phone: '',
    totalTransactions: 5,
    successfulPayments: 2,
    failedPayments: 3,
    lifetimeValue: 100000,
    riskLevel: 'high',
    joinedDate: '2023-01-01',
  };
  const highRiskTxn: Transaction = {
    id: 'TXN-T1',
    customerId: 'T-01',
    amount: 150000,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'card',
    failureReason: 'insufficient_funds',
    createdAt: '2026-08-21T00:00:00Z',
    attemptCount: 2,
  };
  const s1Risk = calculateRiskScore(highRiskCase, highRiskCustomer, highRiskTxn);
  results.push({
    scenario: '1. High-risk failed payment',
    passed: s1Risk.score >= 75 && s1Risk.score <= 100,
    details: `Calculated Risk Score: ${s1Risk.score}/100`,
  });

  // Scenario 2: Low-risk successful customer
  const lowRiskCustomer: Customer = {
    id: 'T-02',
    name: 'Safe User',
    company: 'Safe User',
    customerType: 'SaaS',
    email: 'safe@user.com',
    phone: '',
    totalTransactions: 20,
    successfulPayments: 20,
    failedPayments: 0,
    lifetimeValue: 300000,
    riskLevel: 'low',
    joinedDate: '2022-01-01',
  };
  const lowRiskCase: Partial<RecoveryCaseData> = { attempts: 0, amountAtRisk: 2499, type: 'payment_failure' };
  const s2Risk = calculateRiskScore(lowRiskCase, lowRiskCustomer);
  results.push({
    scenario: '2. Low-risk successful customer',
    passed: s2Risk.score <= 45 && s2Risk.score >= 0,
    details: `Calculated Risk Score: ${s2Risk.score}/100`,
  });

  // Scenario 3: Multiple payment failures
  const multiFailCase: Partial<RecoveryCaseData> = { attempts: 3, amountAtRisk: 45000, type: 'payment_failure' };
  const s3Risk = calculateRiskScore(multiFailCase, highRiskCustomer, highRiskTxn);
  results.push({
    scenario: '3. Multiple payment failures',
    passed: s3Risk.score >= 75 && s3Risk.score <= 100,
    details: `Calculated Risk Score: ${s3Risk.score}/100`,
  });

  // Scenario 4: Expired card
  const expiredCardTxn: Transaction = {
    id: 'TXN-T4',
    customerId: 'T-01',
    amount: 50000,
    currency: 'INR',
    status: 'failed',
    paymentMethod: 'card',
    failureReason: 'expired_card',
    createdAt: '2026-08-21T00:00:00Z',
    attemptCount: 1,
  };
  const s4Action = getRecommendedAction({ type: 'subscription_failure' }, 'expired_card', 1);
  results.push({
    scenario: '4. Expired card action recommendation',
    passed: s4Action === 'Request Payment Method Update',
    details: `Recommended Action: ${s4Action}`,
  });

  // Scenario 5: Checkout abandonment
  const s5Action = getRecommendedAction({ type: 'checkout_abandonment' }, null, 0);
  const s5Prob = calculateRecoveryProbability({ type: 'checkout_abandonment' }, lowRiskCustomer);
  results.push({
    scenario: '5. Checkout abandonment',
    passed: s5Action === 'Send Payment Link' && s5Prob >= 60,
    details: `Action: ${s5Action}, Probability: ${s5Prob}%`,
  });

  // Scenario 6: Overdue invoice
  const overdueInv: Invoice = {
    id: 'INV-T6',
    customerId: 'T-01',
    amount: 80000,
    issueDate: '2026-07-01',
    dueDate: '2026-07-31',
    daysOverdue: 21,
    status: 'overdue',
    promiseToPayDate: null,
  };
  const s6Risk = calculateRiskScore({ type: 'overdue_invoice', amountAtRisk: 80000 }, highRiskCustomer, undefined, overdueInv);
  const s6Action = getRecommendedAction({ type: 'overdue_invoice', amountAtRisk: 80000 }, null, 1, s6Risk.score, 21);
  results.push({
    scenario: '6. Overdue invoice',
    passed: s6Risk.score >= 60 && (s6Action === 'Send Reminder' || s6Action === 'Escalate'),
    details: `Score: ${s6Risk.score}, Action: ${s6Action}`,
  });

  // Scenario 7: Maximum retry situation
  const s7Action = getRecommendedAction({ type: 'payment_failure' }, 'insufficient_funds', 4, 96, 0);
  results.push({
    scenario: '7. Maximum retry situation',
    passed: s7Action === 'Stop',
    details: `Action: ${s7Action}`,
  });

  // Scenario 8: High-value transaction
  const highValPriority = calculatePriorityScore(85, 500000, 75, 5, 1);
  results.push({
    scenario: '8. High-value transaction priority',
    passed: highValPriority >= 75 && highValPriority <= 100,
    details: `Priority Score: ${highValPriority}/100`,
  });

  // Scenario 9: Low-value transaction
  const lowValPriority = calculatePriorityScore(30, 999, 85, 0, 0);
  results.push({
    scenario: '9. Low-value transaction priority',
    passed: lowValPriority <= 50 && lowValPriority >= 0,
    details: `Priority Score: ${lowValPriority}/100`,
  });

  // Scenario 10: Score boundaries and safety clamping
  const negativeClamped = clamp(-50);
  const overflowClamped = clamp(1500);
  const zeroAmtNorm = normalizeAmountFactor(0);
  const negAmtNorm = normalizeAmountFactor(-10000);
  const safePriority = calculatePriorityScore(120, -500, -20);
  results.push({
    scenario: '10. Score boundaries & clamping [0, 100]',
    passed:
      negativeClamped === 0 &&
      overflowClamped === 100 &&
      zeroAmtNorm === 0 &&
      negAmtNorm === 0 &&
      safePriority >= 0 &&
      safePriority <= 100,
    details: `Clamped neg: ${negativeClamped}, overflow: ${overflowClamped}, safePriority: ${safePriority}`,
  });

  return results;
};
