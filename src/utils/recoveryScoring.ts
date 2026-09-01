import {
  Customer,
  Transaction,
  RecoveryCaseData,
  Invoice,
  Subscription,
  RECOVERY_CASES_DATA,
  getCustomerById,
  getTransactionById,
  getInvoiceById,
  getSubscriptionById,
  RecoveryRecommendedAction,
  OpportunityItem
} from '../data';

/**
 * Centralized configurable weights for the Risk Score model
 */
export interface RiskWeightsConfig {
  paymentFailureHistoryWeight: number; // Default: 25%
  failedAttemptsWeight: number;        // Default: 15%
  amountAtRiskWeight: number;          // Default: 20%
  daysOverdueWeight: number;           // Default: 15%
  customerPaymentHistoryWeight: number;// Default: 15%
  eventSeverityWeight: number;         // Default: 10%
}

export const DEFAULT_RISK_WEIGHTS: RiskWeightsConfig = {
  paymentFailureHistoryWeight: 0.25,
  failedAttemptsWeight: 0.15,
  amountAtRiskWeight: 0.20,
  daysOverdueWeight: 0.15,
  customerPaymentHistoryWeight: 0.15,
  eventSeverityWeight: 0.10,
};

export type RiskLevel = 'High' | 'Medium' | 'Low';
export type PriorityTier = 'Critical' | 'High' | 'Medium' | 'Low';

export interface FactorBreakdown {
  paymentFailureHistory: number;
  failedAttempts: number;
  amountAtRisk: number;
  daysOverdue: number;
  customerPaymentHistory: number;
  eventSeverity: number;
}

export interface ScoringResult {
  riskScore: number;
  riskLevel: RiskLevel;
  recoveryProbability: number;
  expectedRecoveryAmount: number;
  whyThisAction: string;
  priorityScore: number;
  priorityLevel: PriorityTier;
  recommendedAction: string;
  explanation: string;
  factors: FactorBreakdown;
}

export interface GuardrailDetails {
  maxAttempts: number;
  currentAttempts: number;
  remainingAttempts: number;
  statusText: string;
  statusBadge: 'success' | 'warning' | 'danger' | 'info';
  nextAllowedAction: string;
  stoppingReason?: string;
  isActionAllowed: boolean;
  isHardFailure: boolean;
}

/**
 * Recovery Guardrails & Stopping Rules Evaluator
 */
export const getRecoveryGuardrails = (opp: {
  attempts: number;
  status: string;
  recommendedAction: string;
  issue: string;
}): GuardrailDetails => {
  const maxAttempts = 3;
  const currentAttempts = opp.attempts || 0;
  const remainingAttempts = Math.max(0, maxAttempts - currentAttempts);
  
  const isHardFailure =
    opp.recommendedAction === 'Stop' ||
    opp.issue.toLowerCase().includes('stolen') ||
    opp.issue.toLowerCase().includes('lost') ||
    opp.issue.toLowerCase().includes('hard decline') ||
    opp.issue.toLowerCase().includes('fraud');

  if (opp.status === 'Recovered') {
    return {
      maxAttempts,
      currentAttempts,
      remainingAttempts: 0,
      statusText: 'Recovered ✓',
      statusBadge: 'success',
      nextAllowedAction: 'None (Recovery Completed)',
      stoppingReason: 'Recovery completed successfully. Further retries disabled.',
      isActionAllowed: false,
      isHardFailure: false,
    };
  }

  if (isHardFailure) {
    return {
      maxAttempts,
      currentAttempts,
      remainingAttempts: 0,
      statusText: 'Escalation Required (Hard Failure)',
      statusBadge: 'danger',
      nextAllowedAction: 'Manual RevOps Review / Escalation',
      stoppingReason: 'Hard/permanent failure detected (Stolen/Lost Card code). Automated retries halted for compliance.',
      isActionAllowed: false,
      isHardFailure: true,
    };
  }

  if (currentAttempts >= maxAttempts || opp.status === 'Escalated') {
    return {
      maxAttempts,
      currentAttempts: Math.max(maxAttempts, currentAttempts),
      remainingAttempts: 0,
      statusText: 'Escalation Required',
      statusBadge: 'danger',
      nextAllowedAction: 'Escalate to RevOps Team for Direct Call',
      stoppingReason: 'Maximum recovery attempts reached (3/3). Automated retries halted.',
      isActionAllowed: false,
      isHardFailure: false,
    };
  }

  return {
    maxAttempts,
    currentAttempts,
    remainingAttempts,
    statusText: currentAttempts === 0 ? 'Retry Available' : `Retry Available (${remainingAttempts} left)`,
    statusBadge: currentAttempts === 0 ? 'info' : 'warning',
    nextAllowedAction: opp.recommendedAction,
    stoppingReason: undefined,
    isActionAllowed: true,
    isHardFailure: false,
  };
};

/**
 * Clamp helper to ensure values remain strictly within [min, max]
 */
export const clamp = (value: number, min = 0, max = 100): number => {
  if (Number.isNaN(value) || !Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
};

/**
 * 1. Normalize Amount At Risk to 0–100 scale using progressive/capped formula
 * Avoids single massive transactions from overwhelming the entire calculation.
 */
export const normalizeAmountFactor = (amount: number): number => {
  if (amount <= 0) return 0;
  if (amount < 5000) {
    return clamp((amount / 5000) * 20); // 0 to 20
  }
  if (amount < 25000) {
    return clamp(20 + ((amount - 5000) / 20000) * 30); // 20 to 50
  }
  if (amount < 100000) {
    return clamp(50 + ((amount - 25000) / 75000) * 30); // 50 to 80
  }
  // Above 100k, capped progression up to 100
  return clamp(80 + Math.min(20, ((amount - 100000) / 150000) * 20)); // 80 to 100
};

/**
 * 2. Normalize Days Overdue & Recency (0–100)
 */
export const normalizeDaysOverdueFactor = (days: number, caseType?: string): number => {
  if (caseType === 'overdue_invoice') {
    if (days <= 0) return 20;
    if (days <= 7) return 45;
    if (days <= 14) return 70;
    if (days <= 30) return 85;
    return 100;
  }
  // For payment failure, checkout abandonment, and subscription renewal,
  // recency represents immediate risk of permanent churn (0-48h window is critical)
  if (days <= 1) return 55; // fresh failure in active recovery window
  if (days <= 3) return 70;
  if (days <= 7) return 85;
  return 100;
};

/**
 * 3. Normalize Attempt Count Factor (0–100)
 */
export const normalizeAttemptsFactor = (attempts: number): number => {
  if (attempts <= 0) return 10;
  if (attempts === 1) return 40;
  if (attempts === 2) return 70;
  return 100;
};

/**
 * 4. Normalize Event Severity Factor (0–100)
 */
export const normalizeEventSeverity = (
  failureReason: string | null | undefined,
  caseType: string
): number => {
  if (!failureReason) {
    if (caseType === 'overdue_invoice') return 55;
    if (caseType === 'checkout_abandonment') return 40;
    if (caseType === 'subscription_failure') return 50;
    return 35;
  }

  switch (failureReason) {
    case 'expired_card':
      return 75;
    case 'insufficient_funds':
      return 65;
    case 'mandate_failure':
      return 60;
    case 'authentication_timeout':
    case 'temporary_bank_decline':
      return 35;
    case 'network_error':
      return 25;
    default:
      return 45;
  }
};

/**
 * Calculate Risk Score (0–100) from multi-factor weighted inputs
 */
export const calculateRiskScore = (
  caseData: Partial<RecoveryCaseData>,
  customer?: Customer,
  transaction?: Transaction,
  invoice?: Invoice,
  subscription?: Subscription,
  weights: RiskWeightsConfig = DEFAULT_RISK_WEIGHTS
): { score: number; factors: FactorBreakdown } => {
  // Factor A: Payment Failure History (Ratio of failures)
  const totalTxns = Math.max(1, customer?.totalTransactions || 1);
  const failedTxns = customer?.failedPayments || 0;
  const failureRatio = failedTxns / totalTxns;
  const paymentFailureHistory = clamp(failureRatio * 200);

  // Factor B: Failed Attempts
  const attempts = caseData.attempts ?? transaction?.attemptCount ?? 0;
  const failedAttempts = normalizeAttemptsFactor(attempts);

  // Factor C: Amount at Risk
  const rawAmount = caseData.amountAtRisk ?? transaction?.amount ?? invoice?.amount ?? subscription?.amount ?? 0;
  const amountAtRisk = normalizeAmountFactor(rawAmount);

  // Factor D: Days Overdue
  const daysOverdueRaw = invoice?.daysOverdue ?? (caseData.type === 'overdue_invoice' ? 7 : 0);
  const daysOverdue = normalizeDaysOverdueFactor(daysOverdueRaw, caseData.type);

  // Factor E: Customer Payment History (Risk Inversion)
  const successfulTxns = customer?.successfulPayments || 0;
  const successRate = successfulTxns / totalTxns;
  let customerHistoryRisk = (1 - successRate) * 100;
  if (customer?.riskLevel === 'high') customerHistoryRisk += 25;
  if (customer?.riskLevel === 'medium') customerHistoryRisk += 10;
  const customerPaymentHistory = clamp(customerHistoryRisk);

  // Factor F: Event Severity
  const failureReason = transaction?.failureReason ?? null;
  const caseType = caseData.type || 'payment_failure';
  const eventSeverity = normalizeEventSeverity(failureReason, caseType);

  // Combine factors using configured weights
  const weightedTotal =
    paymentFailureHistory * weights.paymentFailureHistoryWeight +
    failedAttempts * weights.failedAttemptsWeight +
    amountAtRisk * weights.amountAtRiskWeight +
    daysOverdue * weights.daysOverdueWeight +
    customerPaymentHistory * weights.customerPaymentHistoryWeight +
    eventSeverity * weights.eventSeverityWeight;

  const score = clamp(weightedTotal);

  return {
    score,
    factors: {
      paymentFailureHistory,
      failedAttempts,
      amountAtRisk,
      daysOverdue,
      customerPaymentHistory,
      eventSeverity,
    },
  };
};

/**
 * Convert Risk Score into High / Medium / Low tier
 */
export const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 80) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
};

/**
 * Calculate Recovery Probability (0–100)
 */
export const calculateRecoveryProbability = (
  caseData: Partial<RecoveryCaseData>,
  customer?: Customer,
  transaction?: Transaction,
  invoice?: Invoice,
  subscription?: Subscription
): number => {
  let baseProbability = 50;

  // 1. Customer Payment Track Record (+30 max)
  const totalTxns = Math.max(1, customer?.totalTransactions || 1);
  const successfulTxns = customer?.successfulPayments || 0;
  const successRatio = successfulTxns / totalTxns;
  baseProbability += Math.round(successRatio * 25);

  // 2. Customer Type Loyalty
  if (customer?.customerType === 'Enterprise' || customer?.customerType === 'B2B') {
    baseProbability += 8;
  } else if (customer?.customerType === 'SaaS') {
    baseProbability += 5;
  }

  // 3. Failure Reason Adjustments
  const failureReason = transaction?.failureReason;
  if (failureReason === 'temporary_bank_decline' || failureReason === 'network_error') {
    baseProbability += 15;
  } else if (failureReason === 'authentication_timeout') {
    baseProbability += 10;
  } else if (failureReason === 'expired_card') {
    baseProbability += 5; // Good probability once card updater runs
  } else if (failureReason === 'insufficient_funds') {
    baseProbability += 0; // Depends on retry timing
  } else if (failureReason === 'mandate_failure') {
    baseProbability -= 5;
  }

  // 4. Overdue Penalty
  const daysOverdue = invoice?.daysOverdue || 0;
  if (daysOverdue > 30) {
    baseProbability -= 20;
  } else if (daysOverdue > 14) {
    baseProbability -= 10;
  }

  // 5. Attempt Count Penalty
  const attempts = caseData.attempts ?? 0;
  if (attempts >= 3) {
    baseProbability -= 25;
  } else if (attempts === 2) {
    baseProbability -= 10;
  } else if (attempts === 0) {
    baseProbability += 5;
  }

  // 6. Case Type Adjustments
  if (caseData.type === 'checkout_abandonment') {
    baseProbability += 2;
  }

  return clamp(baseProbability, 10, 95);
};

/**
 * Calculate Composite Recovery Priority Score (0–100)
 * Combines Risk + Financial Impact + Recovery Probability + Urgency
 */
export const calculatePriorityScore = (
  riskScore: number,
  rawAmount: number,
  recoveryProbability: number,
  daysOverdue = 0,
  attempts = 0
): number => {
  const normalizedAmount = normalizeAmountFactor(rawAmount);
  const urgency = clamp(normalizeDaysOverdueFactor(daysOverdue) * 0.6 + normalizeAttemptsFactor(attempts) * 0.4);

  // Weighted composition:
  // Risk (30%) + Financial Impact (30%) + Recovery Probability (25%) + Urgency (15%)
  const score =
    riskScore * 0.30 +
    normalizedAmount * 0.30 +
    recoveryProbability * 0.25 +
    urgency * 0.15;

  return clamp(score);
};

/**
 * Convert Priority Score to Priority Level Tier
 */
export const getPriorityLevel = (priorityScore: number): PriorityTier => {
  if (priorityScore >= 80) return 'Critical';
  if (priorityScore >= 60) return 'High';
  if (priorityScore >= 40) return 'Medium';
  return 'Low';
};

/**
 * Deterministic baseline Recommended Action selector
 */
export const getRecommendedAction = (
  caseData: Partial<RecoveryCaseData>,
  failureReason?: string | null,
  attempts = 0,
  riskScore = 50,
  daysOverdue = 0
): string => {
  // Hard stop or escalation conditions
  if (attempts >= 4 || (riskScore >= 95 && attempts >= 3)) {
    return 'Stop';
  }

  if (attempts >= 3 || daysOverdue >= 25 || (riskScore >= 90 && (caseData.amountAtRisk || 0) > 100000)) {
    return 'Escalate';
  }

  if (failureReason === 'expired_card') {
    return 'Request Payment Method Update';
  }

  if (caseData.type === 'checkout_abandonment') {
    return 'Send Payment Link';
  }

  if (caseData.type === 'overdue_invoice') {
    return 'Send Reminder';
  }

  if (
    failureReason === 'temporary_bank_decline' ||
    failureReason === 'network_error'
  ) {
    return attempts === 0 ? 'Retry Payment' : 'Retry Later';
  }

  if (failureReason === 'authentication_timeout') {
    return 'Retry Later';
  }

  if (failureReason === 'insufficient_funds') {
    return attempts === 0 ? 'Retry Payment' : 'Retry Later';
  }

  if (caseData.type === 'subscription_failure') {
    return attempts === 0 ? 'Retry Payment' : 'Request Payment Method Update';
  }

  return 'Retry Payment';
};

/**
 * Short business-oriented explanation of the score and factors
 */
export const getScoreExplanation = (
  result: { riskScore: number; riskLevel: RiskLevel; priorityScore: number; priorityLevel: PriorityTier; recommendedAction: string; factors: FactorBreakdown },
  customer?: Customer,
  caseData?: Partial<RecoveryCaseData>
): string => {
  const parts: string[] = [];
  const amountStr = `₹${(caseData?.amountAtRisk || 0).toLocaleString('en-IN')}`;

  if (result.riskScore >= 80) {
    parts.push(`High risk profile with ${amountStr} at risk`);
  } else if (result.riskScore >= 50) {
    parts.push(`Moderate risk profile involving ${amountStr}`);
  } else {
    parts.push(`Low risk case of ${amountStr}`);
  }

  if (result.factors.failedAttempts >= 70) {
    parts.push(`${caseData?.attempts || 0} failed retry attempts recorded`);
  }

  if (result.factors.daysOverdue >= 50) {
    parts.push(`extended overdue duration`);
  }

  if (customer && customer.successfulPayments / Math.max(1, customer.totalTransactions) >= 0.85) {
    parts.push(`supported by strong historical customer settlement history`);
  }

  return `${parts.join(', ')}. Recommended immediate action: ${result.recommendedAction}.`;
};

/**
 * Step 10 — Simple explainable opportunity explanation
 * Example: "Payment failure detected. A payment retry is recommended to recover the amount."
 */
export const getSimpleOpportunityExplanation = (
  issue: string,
  recommendedAction: string
): string => {
  const normalizedIssue = issue.toLowerCase().includes('payment')
    ? 'Payment failure'
    : issue.toLowerCase().includes('checkout') || issue.toLowerCase().includes('cart')
    ? 'Checkout abandonment'
    : issue.toLowerCase().includes('invoice') || issue.toLowerCase().includes('overdue')
    ? 'Invoice overdue'
    : 'Subscription failure';

  return `${normalizedIssue} detected. A ${recommendedAction.toLowerCase()} is recommended to recover the amount.`;
};


/**
 * Complete scoring pipeline for a single recovery case
 */
export const scoreRecoveryOpportunity = (
  caseData: RecoveryCaseData,
  weights: RiskWeightsConfig = DEFAULT_RISK_WEIGHTS
): ScoringResult => {
  const customer = getCustomerById(caseData.customerId);
  const transaction = caseData.transactionId ? getTransactionById(caseData.transactionId) : undefined;
  const invoice = caseData.invoiceId ? getInvoiceById(caseData.invoiceId) : undefined;
  const subscription = caseData.subscriptionId ? getSubscriptionById(caseData.subscriptionId) : undefined;

  const rawAmount = caseData.amountAtRisk || transaction?.amount || invoice?.amount || subscription?.amount || 0;
  const attempts = caseData.attempts || 0;
  const daysOverdue = invoice?.daysOverdue || (caseData.type === 'overdue_invoice' ? 7 : 0);

  // 1. Calculate Risk Score & Factors
  const { score: riskScore, factors } = calculateRiskScore(
    caseData,
    customer,
    transaction,
    invoice,
    subscription,
    weights
  );
  const riskLevel = getRiskLevel(riskScore);

  // 2. Calculate Recovery Probability
  const recoveryProbability = calculateRecoveryProbability(
    caseData,
    customer,
    transaction,
    invoice,
    subscription
  );

  // 3. Calculate Priority Score & Level
  const priorityScore = calculatePriorityScore(
    riskScore,
    rawAmount,
    recoveryProbability,
    daysOverdue,
    attempts
  );
  const priorityLevel = getPriorityLevel(priorityScore);

  // 4. Determine Recommended Action
  const recommendedAction = getRecommendedAction(
    caseData,
    transaction?.failureReason,
    attempts,
    riskScore,
    daysOverdue
  );

  // 5. Generate Explanation & Decision Engine Rationale
  const explanation = getScoreExplanation(
    {
      riskScore,
      riskLevel,
      priorityScore,
      priorityLevel,
      recommendedAction,
      factors,
    },
    customer,
    caseData
  );

  const expectedRecoveryAmount = Math.round(rawAmount * (recoveryProbability / 100));
  const whyThisAction = caseData.aiDiagnosis || `${caseData.type?.replace(/_/g, ' ')} detected; ${recommendedAction.toLowerCase()} recommended.`;

  return {
    riskScore,
    riskLevel,
    recoveryProbability,
    expectedRecoveryAmount,
    whyThisAction,
    priorityScore,
    priorityLevel,
    recommendedAction,
    explanation,
    factors,
  };
};

/**
 * Transform all synthetic Step 4 recovery cases into UI-ready scored items
 */
export const getScoredRecoveryOpportunities = (): OpportunityItem[] => {
  return RECOVERY_CASES_DATA.map((caseItem) => {
    const customer = getCustomerById(caseItem.customerId);
    const transaction = caseItem.transactionId ? getTransactionById(caseItem.transactionId) : undefined;
    const scored = scoreRecoveryOpportunity(caseItem);

    // Human-readable type label
    let typeLabel: OpportunityItem['recoveryType'] = 'Payment Failure';
    if (caseItem.type === 'checkout_abandonment') typeLabel = 'Checkout Abandonment';
    else if (caseItem.type === 'subscription_failure') typeLabel = 'Subscription Failure';
    else if (caseItem.type === 'overdue_invoice') typeLabel = 'Overdue Invoice';

    // Status mapping
    let statusLabel: OpportunityItem['status'] = 'New';
    if (caseItem.status === 'in_progress') statusLabel = 'In Progress';
    else if (caseItem.status === 'recovered') statusLabel = 'Recovered';
    else if (caseItem.status === 'escalated') statusLabel = 'Escalated';

    // Action mapping
    const actionLabel = scored.recommendedAction as OpportunityItem['recommendedAction'];

    // Priority mapping (Critical/High/Medium/Low)
    const priorityLabel = (scored.priorityLevel === 'Critical' ? 'High' : scored.priorityLevel) as OpportunityItem['priority'];

    const rawExpectedRecovery = Math.round(caseItem.amountAtRisk * (scored.recoveryProbability / 100));
    const expectedRecovery = `₹${rawExpectedRecovery.toLocaleString('en-IN')}`;
    const whyThisAction = caseItem.aiDiagnosis || scored.whyThisAction;

    return {
      id: caseItem.id,
      transactionId: caseItem.transactionId || caseItem.invoiceId || caseItem.subscriptionId || `REF-${caseItem.id}`,
      customer: customer?.company || customer?.name || 'Customer Corp',
      customerType: customer?.customerType ? `${customer.customerType} Client` : 'Enterprise B2B',
      issue: transaction?.failureReason
        ? transaction.failureReason.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : caseItem.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      recoveryType: typeLabel,
      amountAtRisk: `₹${caseItem.amountAtRisk.toLocaleString('en-IN')}`,
      rawAmount: caseItem.amountAtRisk,
      riskScore: scored.riskScore,
      riskLevel: scored.riskLevel,
      probability: scored.recoveryProbability,
      expectedRecovery,
      rawExpectedRecovery,
      whyThisAction,
      priority: priorityLabel,
      priorityScore: scored.priorityScore,
      priorityLevel: scored.priorityLevel,
      recommendedAction: actionLabel,
      attempts: caseItem.attempts,
      status: statusLabel,
      aiDiagnosis: caseItem.aiDiagnosis || scored.explanation,
      factors: scored.factors,
      createdAt: caseItem.createdAt,
    };
  });
};
