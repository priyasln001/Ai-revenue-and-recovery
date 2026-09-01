import React, { createContext, useContext, useState, useMemo } from 'react';
import { OpportunityItem, ActivityRecord, RECENT_RECOVERY_ACTIVITY } from '../data/mockData';
import { getScoredRecoveryOpportunities, getRecoveryGuardrails } from '../utils/recoveryScoring';
import { AuditLogEntry } from '../types';

export interface RecoveryExecutionResult {
  success: boolean;
  message: string;
  error?: string;
  opportunity?: OpportunityItem;
}

export interface BatchRecoverySummary {
  opportunitiesAnalyzed: number;
  highPriorityCases: number;
  actionsExecuted: number;
  successfullyRecoveredCases: number;
  revenueAtRisk: number;
  revenueRecovered: number;
  recoveryRate: number;
  casesEscalated: number;
  casesStoppedByGuardrails: number;
  formattedRevenueAtRisk: string;
  formattedRevenueRecovered: string;
  formattedRecoveryRate: string;
  batchTimestamp: string;
}

export interface RecoveryMetrics {
  revenueAtRisk: number;
  revenueRecovered: number;
  recoveryRate: number;
  activeCasesCount: number;
  formattedAtRisk: string;
  formattedRecovered: string;
  formattedRate: string;
}

interface RecoveryContextType {
  opportunities: OpportunityItem[];
  recentActivities: ActivityRecord[];
  auditLogs: AuditLogEntry[];
  totalRecoveredDelta: number;
  metrics: RecoveryMetrics;
  lastBatchSummary: BatchRecoverySummary | null;
  executeRecovery: (opportunityId: string, simulateFailure?: boolean) => RecoveryExecutionResult;
  runBatchRecovery: () => BatchRecoverySummary;
  getOpportunityById: (id: string) => OpportunityItem | undefined;
  addAuditLogEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  updateOpportunityStatusAndAction: (
    id: string,
    newStatus: OpportunityItem['status'],
    newAction?: string,
    reason?: string
  ) => void;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-08-21 22:30:12',
    event: 'Payment Retry Executed',
    details: 'Automatic 3DS soft retry initiated for Rahul Enterprises (CUST-1001 / INV-10001). Response: 200 OK',
    performedBy: 'Recover AI Agent',
    type: 'ai',
    customer: 'Rahul Enterprises',
    customerId: 'CUST-1001',
    invoiceId: 'INV-10001',
    issue: 'Payment Failure',
    actionTaken: 'Retry Payment',
    amount: '₹48,500',
    previousStatus: 'New',
    newStatus: 'Recovered',
    result: 'Successful',
  },
  {
    id: 'AUD-902',
    timestamp: '2026-08-21 22:15:45',
    event: 'Payment Link Sent',
    details: 'Custom checkout recovery link generated & emailed to Apex Solutions (CUST-1002 / INV-10002).',
    performedBy: 'Recover AI Agent',
    type: 'system',
    customer: 'Apex Solutions',
    customerId: 'CUST-1002',
    invoiceId: 'INV-10002',
    issue: 'Checkout Abandonment',
    actionTaken: 'Send Payment Link',
    amount: '₹12,999',
    previousStatus: 'New',
    newStatus: 'Recovered',
    result: 'Successful',
  },
  {
    id: 'AUD-903',
    timestamp: '2026-08-21 21:50:00',
    event: 'Invoice Reminder Sent',
    details: 'Automated invoice overdue notification sent to TechNova AP team (CUST-1003 / INV-10003).',
    performedBy: 'Recover AI Agent',
    type: 'ai',
    customer: 'TechNova Pvt Ltd',
    customerId: 'CUST-1003',
    invoiceId: 'INV-10003',
    issue: 'Overdue Invoice',
    actionTaken: 'Send Reminder',
    amount: '₹75,000',
    previousStatus: 'New',
    newStatus: 'In Progress',
    result: 'Failed',
  },
  {
    id: 'AUD-904',
    timestamp: '2026-08-21 21:10:30',
    event: 'Subscription Retry Executed',
    details: 'Off-peak window retry for GreenCart (CUST-1004) subscription charge. Settlement successful.',
    performedBy: 'Recover AI Agent',
    type: 'ai',
    customer: 'GreenCart',
    customerId: 'CUST-1004',
    issue: 'Subscription Failure',
    actionTaken: 'Retry Subscription Payment',
    amount: '₹2,499',
    previousStatus: 'New',
    newStatus: 'Recovered',
    result: 'Successful',
  },
  {
    id: 'AUD-905',
    timestamp: '2026-08-21 20:30:00',
    event: 'Escalation Enforced',
    details: 'Stolen/Lost card flag detected for Hyperion Capital (CUST-1011 / INV-10006). Compliance override.',
    performedBy: 'Recover AI Agent',
    type: 'user',
    customer: 'Hyperion Capital Services',
    customerId: 'CUST-1011',
    invoiceId: 'INV-10006',
    issue: 'Payment Failure',
    actionTaken: 'Escalate / Stop',
    amount: '₹1,50,000',
    previousStatus: 'In Progress',
    newStatus: 'Escalated',
    result: 'Escalated',
  },
];

export const INITIAL_REVENUE_AT_RISK_BASELINE = 1840000;

/**
 * Centralized Single Recovery Rate Formula Evaluator
 * Formula: Recovery Rate = (Revenue Recovered / Initial Revenue at Risk) * 100
 * where Initial Revenue at Risk = ₹18,40,000 baseline (remains constant and does not decrease when revenue is recovered)
 */
export const calculateRecoveryRate = (
  revenueRecovered: number,
  initialRevenueAtRisk: number = INITIAL_REVENUE_AT_RISK_BASELINE
): number => {
  if (initialRevenueAtRisk <= 0) return 0;
  const rawRate = (revenueRecovered / initialRevenueAtRisk) * 100;
  return parseFloat(rawRate.toFixed(1));
};

const RecoveryContext = createContext<RecoveryContextType | undefined>(undefined);

export const RecoveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(() =>
    getScoredRecoveryOpportunities()
  );
  const [recentActivities, setRecentActivities] = useState<ActivityRecord[]>(RECENT_RECOVERY_ACTIVITY);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [totalRecoveredDelta, setTotalRecoveredDelta] = useState<number>(0);

  const getOpportunityById = (id: string): OpportunityItem | undefined => {
    return opportunities.find((o) => o.id === id);
  };

  /**
   * Simple Smart Recovery Action Execution Engine (Step 8)
   * Follows simple, explainable rule-based recovery logic:
   * Payment Failure -> Retry Payment
   * Checkout Abandonment -> Send Payment Link
   * Overdue Invoice -> Send Reminder
   * Subscription Failure -> Retry Subscription Payment
   */
  /**
   * Simple Smart Recovery Action Execution Engine (Step 11 — Bounded Recovery)
   * Handles:
   * 1. Successful recovery: status -> 'Recovered', totalRecoveredDelta += amount
   * 2. Failed recovery: status -> 'In Progress', totalRecoveredDelta unchanged
   * 3. Simple Escalation: attempts >= 3 -> status -> 'Escalated'
   * 4. Stopping Rule: prevents duplicate recovery or retrying already recovered/escalated cases
   */
  const executeRecovery = (
    opportunityId: string,
    simulateFailure = false
  ): RecoveryExecutionResult => {
    const opp = opportunities.find((o) => o.id === opportunityId);

    // Error Handling Check 1: Missing opportunity information
    if (!opp) {
      return {
        success: false,
        message: 'Opportunity not found.',
        error: 'Invalid Opportunity ID',
      };
    }

    // Error Handling Check 2: Invalid Amount
    if (!opp.rawAmount || opp.rawAmount <= 0) {
      return {
        success: false,
        message: 'Cannot process recovery for zero or invalid amount.',
        error: 'Invalid Amount',
      };
    }

    const isHardFailure =
      opp.recommendedAction === 'Stop' ||
      opp.issue.toLowerCase().includes('stolen') ||
      opp.issue.toLowerCase().includes('lost') ||
      opp.issue.toLowerCase().includes('hard decline') ||
      opp.issue.toLowerCase().includes('fraud');

    // Error Handling Check 3: Stopping Rule - Already Recovered or Escalated/Stopped
    if (opp.status === 'Recovered') {
      return {
        success: false,
        message: `[RECOVERY GUARDRAIL ENFORCED] Opportunity ${opp.id} (${opp.customer}) is already recovered. Endless retries are prohibited by safety stopping rules.`,
        error: 'Already Recovered',
      };
    }

    if (isHardFailure) {
      return {
        success: false,
        message: `[RECOVERY GUARDRAIL ENFORCED] Opportunity ${opp.id} has a hard/permanent failure flag (${opp.issue}). Automated retries halted; manual RevOps escalation required.`,
        error: 'Hard Failure - Manual Review Required',
      };
    }

    if (opp.status === 'Escalated' || opp.attempts >= 3) {
      return {
        success: false,
        message: `[RECOVERY GUARDRAIL ENFORCED] Opportunity ${opp.id} has reached maximum retry attempt threshold (3/3). Escalated to RevOps team; retries halted by stopping rule.`,
        error: 'Maximum Attempts Reached (3/3)',
      };
    }

    const previousStatus = opp.status;
    const actionTaken = opp.recommendedAction;
    const nextAttempts = opp.attempts + 1;
    const now = new Date();
    const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    // Handle Simulated Failure / Simple Escalation Rule
    if (simulateFailure) {
      const isEscalating = nextAttempts >= 3;
      const newStatus = isEscalating ? 'Escalated' : 'In Progress';
      const resultState: 'Failed' | 'Escalated' = isEscalating ? 'Escalated' : 'Failed';

      const updatedOpp: OpportunityItem = {
        ...opp,
        status: newStatus,
        attempts: nextAttempts,
        aiDiagnosis: isEscalating
          ? `[Escalated] Attempt ${nextAttempts} failed. Escalated to human RevOps team after repeated failures.`
          : `[Attempt ${nextAttempts} Failed] ${opp.aiDiagnosis}`,
      };

      setOpportunities((prev) =>
        prev.map((o) => (o.id === opportunityId ? updatedOpp : o))
      );

      // Do NOT increment totalRecoveredDelta for failed or escalated attempts

      const newActivity: ActivityRecord = {
        id: `ACT-${now.getTime().toString().slice(-4)}`,
        customer: opp.customer,
        issue: opp.issue,
        amountAtRisk: opp.amountAtRisk,
        intervention: actionTaken,
        status: newStatus === 'Escalated' ? 'Escalated' : 'Failed',
        recoveredAmount: '₹0',
        timestamp: 'Just now',
      };
      setRecentActivities((prev) => [newActivity, ...prev]);

      const newAuditEntry: AuditLogEntry = {
        id: `AUD-${now.getTime().toString().slice(-4)}`,
        timestamp: formattedTimestamp,
        event: `${actionTaken} Attempt ${nextAttempts} (${resultState})`,
        details: `Action "${actionTaken}" attempt ${nextAttempts} ${resultState.toLowerCase()} for ${opp.customer}. Status changed from ${previousStatus} to ${newStatus}.`,
        performedBy: 'Recover AI Agent',
        type: 'ai',
        customer: opp.customer,
        customerId: opp.customer.includes('Rahul') ? 'CUST-1001' : opp.customer.includes('Apex') ? 'CUST-1002' : undefined,
        invoiceId: opp.transactionId && opp.transactionId.startsWith('INV-') ? opp.transactionId : undefined,
        issue: opp.issue,
        actionTaken: actionTaken,
        amount: opp.amountAtRisk,
        previousStatus: previousStatus,
        newStatus: newStatus,
        result: resultState,
      };
      setAuditLogs((prev) => [newAuditEntry, ...prev]);

      return {
        success: false,
        message: isEscalating
          ? `Attempt ${nextAttempts} failed. Repeated failure threshold reached — Opportunity ${opp.id} escalated to RevOps team!`
          : `Attempt ${nextAttempts} failed. Opportunity ${opp.id} remains in progress for next retry window.`,
        opportunity: updatedOpp,
      };
    }

    // Handle Successful Recovery
    const calculatedRecoveredAmount = opp.rawExpectedRecovery ?? Math.round(opp.rawAmount * (opp.probability / 100));
    const formattedRecoveredAmount = `₹${calculatedRecoveredAmount.toLocaleString('en-IN')}`;

    const updatedOpp: OpportunityItem = {
      ...opp,
      status: 'Recovered',
      attempts: nextAttempts,
      expectedRecovery: formattedRecoveredAmount,
      rawExpectedRecovery: calculatedRecoveredAmount,
      aiDiagnosis: `[Recovered via ${actionTaken}] ${opp.aiDiagnosis}`,
    };

    setOpportunities((prev) =>
      prev.map((o) => (o.id === opportunityId ? updatedOpp : o))
    );

    // Update Measured Recovery Totals (Only on Successful Recovery) using calculated recovered amount
    setTotalRecoveredDelta((prev) => prev + calculatedRecoveredAmount);

    const newActivity: ActivityRecord = {
      id: `ACT-${now.getTime().toString().slice(-4)}`,
      customer: opp.customer,
      issue: opp.issue,
      amountAtRisk: opp.amountAtRisk,
      intervention: actionTaken,
      status: 'Recovered',
      recoveredAmount: formattedRecoveredAmount,
      timestamp: 'Just now',
    };
    setRecentActivities((prev) => [newActivity, ...prev]);

    const newAuditEntry: AuditLogEntry = {
      id: `AUD-${now.getTime().toString().slice(-4)}`,
      timestamp: formattedTimestamp,
      event: `${actionTaken} Executed (Demo Simulation)`,
      details: `[DEMO SIMULATION] Action "${actionTaken}" executed for ${opp.customer}. Risk Amount: ${opp.amountAtRisk}. Recovered Amount: ${formattedRecoveredAmount} (Calculated via AI probability: ${opp.probability}%). Status changed from ${previousStatus} to Recovered.`,
      performedBy: 'Recover AI Agent',
      type: 'ai',
      customer: opp.customer,
      customerId: opp.customer.includes('Rahul') ? 'CUST-1001' : opp.customer.includes('Apex') ? 'CUST-1002' : undefined,
      invoiceId: opp.transactionId && opp.transactionId.startsWith('INV-') ? opp.transactionId : undefined,
      issue: opp.issue,
      actionTaken: actionTaken,
      amount: formattedRecoveredAmount,
      previousStatus: previousStatus,
      newStatus: 'Recovered',
      result: 'Successful',
    };
    setAuditLogs((prev) => [newAuditEntry, ...prev]);

    return {
      success: true,
      message: `[DEMO SIMULATION MODE] Successfully executed "${actionTaken}" for ${opp.customer}. Recovered ${formattedRecoveredAmount} (${opp.probability}% probability)! Audit log created (${newAuditEntry.id}).`,
      opportunity: updatedOpp,
    };
  };

  /**
   * STEP 9 — Single Consistent Metrics Data Source
   * Calculates all 4 core dashboard metrics directly from the opportunities dataset & session recoveries:
   * 1. Revenue at Risk = Base At Risk (₹18,40,000) - Session Recovered Delta
   * 2. Revenue Recovered = Base Recovered (₹7,25,000) + Session Recovered Delta
   * 3. Recovery Rate = (Revenue Recovered / Total Revenue Initially At Risk) * 100
   * 4. Active Recovery Cases = Base Active Cases (47) - Session Newly Recovered Opportunities
   */
  const metrics: RecoveryMetrics = useMemo(() => {
    const baseAtRisk = 1840000;
    const baseRecovered = 725000;
    const baseActiveCases = 47;

    const revenueRecovered = baseRecovered + totalRecoveredDelta;
    const revenueAtRisk = Math.max(0, baseAtRisk - totalRecoveredDelta);

    // Centralized Single Formula: (Revenue Recovered / Initial Revenue at Risk) * 100
    const recoveryRate = calculateRecoveryRate(revenueRecovered, baseAtRisk);

    // Active cases count: cases in progress and not successfully recovered
    const sessionNewlyRecoveredCount = opportunities.filter(
      (o) => o.status === 'Recovered' && o.id !== 'OPP-110'
    ).length;
    const activeCasesCount = Math.max(0, baseActiveCases - sessionNewlyRecoveredCount);

    return {
      revenueAtRisk,
      revenueRecovered,
      recoveryRate,
      activeCasesCount,
      formattedAtRisk: `₹${revenueAtRisk.toLocaleString('en-IN')}`,
      formattedRecovered: `₹${revenueRecovered.toLocaleString('en-IN')}`,
      formattedRate: `${recoveryRate.toFixed(1)}%`,
    };
  }, [totalRecoveredDelta, opportunities]);

  const addAuditLogEntry = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const newEntry: AuditLogEntry = {
      id: `AUD-${now.getTime().toString().slice(-4)}`,
      timestamp: formattedTimestamp,
      ...entry,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const updateOpportunityStatusAndAction = (
    id: string,
    newStatus: OpportunityItem['status'],
    newAction?: string,
    reason?: string
  ) => {
    setOpportunities((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          return {
            ...o,
            status: newStatus,
            recommendedAction: newAction || o.recommendedAction,
            aiDiagnosis: reason ? `[${newStatus}] ${reason}` : o.aiDiagnosis,
          };
        }
        return o;
      })
    );
  };

  const [lastBatchSummary, setLastBatchSummary] = useState<BatchRecoverySummary | null>(null);

  /**
   * Batch Recovery Processing Engine
   * Simulates automated batch execution across all eligible opportunities
   */
  const runBatchRecovery = (): BatchRecoverySummary => {
    let actionsExecuted = 0;
    let successfullyRecoveredCases = 0;
    let casesEscalated = 0;
    let casesStoppedByGuardrails = 0;
    let newlyRecoveredAmount = 0;

    const now = new Date();
    const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    const updatedOpps = opportunities.map((opp) => {
      const guardrails = getRecoveryGuardrails(opp);

      // Rule 2/3/4/5: Guardrails check (Already Recovered, Hard Failure, Max 3 attempts)
      if (!guardrails.isActionAllowed) {
        casesStoppedByGuardrails++;
        if (opp.status === 'Escalated' || guardrails.isHardFailure) {
          casesEscalated++;
        }
        return opp;
      }

      // Execute simulated batch recovery action
      actionsExecuted++;
      const nextAttempts = opp.attempts + 1;

      // Probability >= 60% results in successful recovery
      const isSuccess = opp.probability >= 60 && !guardrails.isHardFailure;

      if (isSuccess) {
        successfullyRecoveredCases++;
        const recoveredVal = opp.rawExpectedRecovery ?? Math.round(opp.rawAmount * (opp.probability / 100));
        newlyRecoveredAmount += recoveredVal;

        const updated: OpportunityItem = {
          ...opp,
          status: 'Recovered',
          attempts: nextAttempts,
          expectedRecovery: `₹${recoveredVal.toLocaleString('en-IN')}`,
          rawExpectedRecovery: recoveredVal,
          aiDiagnosis: `[Batch Recovered via ${opp.recommendedAction}] Recovery completed successfully on attempt ${nextAttempts}.`,
        };

        return updated;
      } else {
        const isEscalating = nextAttempts >= 3;
        if (isEscalating) casesEscalated++;

        const updated: OpportunityItem = {
          ...opp,
          status: isEscalating ? 'Escalated' : 'In Progress',
          attempts: nextAttempts,
          aiDiagnosis: isEscalating
            ? `[Batch Escalated] Attempt ${nextAttempts} failed. Escalated to RevOps team by 3-attempt guardrail.`
            : `[Batch Attempt ${nextAttempts} Failed] ${opp.aiDiagnosis}`,
        };

        return updated;
      }
    });

    // Create Audit Log Entry for the overall Batch Run
    const batchAuditEntry: AuditLogEntry = {
      id: `AUD-BATCH-${now.getTime().toString().slice(-4)}`,
      timestamp: formattedTimestamp,
      event: 'Batch Recovery Execution Completed',
      details: `[BATCH RECOVERY RUN] Analyzed ${opportunities.length} opportunities. Executed ${actionsExecuted} actions. Successfully recovered ${successfullyRecoveredCases} cases (+₹${newlyRecoveredAmount.toLocaleString('en-IN')}). ${casesStoppedByGuardrails} cases stopped by guardrails.`,
      performedBy: 'Batch AI Agent Engine',
      type: 'ai',
      customer: 'Batch Process (Multiple Accounts)',
      issue: 'Batch Revenue Recovery',
      actionTaken: 'Run Recovery Batch',
      amount: `₹${newlyRecoveredAmount.toLocaleString('en-IN')}`,
      previousStatus: 'Mixed',
      newStatus: 'Batch Processing Done',
      result: 'Successful',
    };

    const individualAuditLogs: AuditLogEntry[] = [];
    const newActivityRecords: ActivityRecord[] = [];

    updatedOpps.forEach((opp, idx) => {
      const orig = opportunities[idx];
      if (orig.status !== 'Recovered' && opp.status === 'Recovered') {
        const recoveredVal = opp.rawExpectedRecovery ?? Math.round(opp.rawAmount * (opp.probability / 100));
        individualAuditLogs.push({
          id: `AUD-B${idx}-${now.getTime().toString().slice(-4)}`,
          timestamp: formattedTimestamp,
          event: `[BATCH RECOVERY] ${opp.recommendedAction} Successful`,
          details: `[BATCH RECOVERY RUN] Action "${opp.recommendedAction}" succeeded for ${opp.customer}. Amount at Risk: ${opp.amountAtRisk}. Recovered Amount: ₹${recoveredVal.toLocaleString('en-IN')}. Stopping rule enforced; further retries disabled.`,
          performedBy: 'Batch AI Agent Engine',
          type: 'ai',
          customer: opp.customer,
          issue: opp.issue,
          actionTaken: opp.recommendedAction,
          amount: `₹${recoveredVal.toLocaleString('en-IN')}`,
          previousStatus: orig.status,
          newStatus: 'Recovered',
          result: 'Successful',
        });

        newActivityRecords.push({
          id: `ACT-B${idx}-${now.getTime().toString().slice(-4)}`,
          customer: opp.customer,
          issue: opp.issue,
          amountAtRisk: opp.amountAtRisk,
          intervention: opp.recommendedAction,
          status: 'Recovered',
          recoveredAmount: `₹${recoveredVal.toLocaleString('en-IN')}`,
          timestamp: 'Just now (Batch)',
        });
      }
    });

    setOpportunities(updatedOpps);
    if (newlyRecoveredAmount > 0) {
      setTotalRecoveredDelta((prev) => prev + newlyRecoveredAmount);
    }
    if (newActivityRecords.length > 0) {
      setRecentActivities((prev) => [...newActivityRecords, ...prev]);
    }
    setAuditLogs((prev) => [batchAuditEntry, ...individualAuditLogs, ...prev]);

    // Calculate metrics
    const baseAtRisk = 1840000;
    const baseRecovered = 725000;
    const newTotalDelta = totalRecoveredDelta + newlyRecoveredAmount;
    const newRevenueRecovered = baseRecovered + newTotalDelta;
    const newRevenueAtRisk = Math.max(0, baseAtRisk - newTotalDelta);
    const newRecoveryRate = calculateRecoveryRate(newRevenueRecovered, baseAtRisk);

    const highPriorityCount = opportunities.filter(
      (o) => (o.priorityLevel || o.priority) === 'High' || (o.priorityLevel || o.priority) === 'Critical'
    ).length;

    const summary: BatchRecoverySummary = {
      opportunitiesAnalyzed: opportunities.length,
      highPriorityCases: highPriorityCount,
      actionsExecuted,
      successfullyRecoveredCases,
      revenueAtRisk: newRevenueAtRisk,
      revenueRecovered: newRevenueRecovered,
      recoveryRate: newRecoveryRate,
      casesEscalated,
      casesStoppedByGuardrails,
      formattedRevenueAtRisk: `₹${newRevenueAtRisk.toLocaleString('en-IN')}`,
      formattedRevenueRecovered: `₹${newRevenueRecovered.toLocaleString('en-IN')}`,
      formattedRecoveryRate: `${newRecoveryRate.toFixed(1)}%`,
      batchTimestamp: formattedTimestamp,
    };

    setLastBatchSummary(summary);
    return summary;
  };

  const value = useMemo(
    () => ({
      opportunities,
      recentActivities,
      auditLogs,
      totalRecoveredDelta,
      metrics,
      lastBatchSummary,
      executeRecovery,
      runBatchRecovery,
      getOpportunityById,
      addAuditLogEntry,
      updateOpportunityStatusAndAction,
    }),
    [opportunities, recentActivities, auditLogs, totalRecoveredDelta, metrics, lastBatchSummary]
  );

  return <RecoveryContext.Provider value={value}>{children}</RecoveryContext.Provider>;
};

export const useRecovery = (): RecoveryContextType => {
  const context = useContext(RecoveryContext);
  if (!context) {
    throw new Error('useRecovery must be used within a RecoveryProvider');
  }
  return context;
};
