import React, { createContext, useContext, useState, useMemo } from 'react';
import { OpportunityItem, ActivityRecord, RECENT_RECOVERY_ACTIVITY } from '../data/mockData';
import { getScoredRecoveryOpportunities } from '../utils/recoveryScoring';
import { AuditLogEntry } from '../types';

export interface RecoveryExecutionResult {
  success: boolean;
  message: string;
  error?: string;
  opportunity?: OpportunityItem;
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
  executeRecovery: (opportunityId: string, simulateFailure?: boolean) => RecoveryExecutionResult;
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

    // Error Handling Check 3: Stopping Rule - Already Recovered or Escalated/Stopped
    if (opp.status === 'Recovered') {
      return {
        success: false,
        message: `Opportunity ${opp.id} (${opp.customer}) is already recovered. Endless retries are prohibited by the stopping rule.`,
        error: 'Already Recovered',
      };
    }

    if (opp.status === 'Escalated' || opp.recommendedAction === 'Stop' || opp.attempts >= 4) {
      return {
        success: false,
        message: `Opportunity ${opp.id} has reached maximum retry attempt threshold. Escalated to RevOps team; retries halted by stopping rule.`,
        error: 'Escalated / Limit Reached',
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
    const updatedOpp: OpportunityItem = {
      ...opp,
      status: 'Recovered',
      attempts: nextAttempts,
      aiDiagnosis: `[Recovered via ${actionTaken}] ${opp.aiDiagnosis}`,
    };

    setOpportunities((prev) =>
      prev.map((o) => (o.id === opportunityId ? updatedOpp : o))
    );

    // Update Measured Recovery Totals (Only on Successful Recovery)
    setTotalRecoveredDelta((prev) => prev + opp.rawAmount);

    const newActivity: ActivityRecord = {
      id: `ACT-${now.getTime().toString().slice(-4)}`,
      customer: opp.customer,
      issue: opp.issue,
      amountAtRisk: opp.amountAtRisk,
      intervention: actionTaken,
      status: 'Recovered',
      recoveredAmount: opp.amountAtRisk,
      timestamp: 'Just now',
    };
    setRecentActivities((prev) => [newActivity, ...prev]);

    const newAuditEntry: AuditLogEntry = {
      id: `AUD-${now.getTime().toString().slice(-4)}`,
      timestamp: formattedTimestamp,
      event: `${actionTaken} Executed`,
      details: `Action "${actionTaken}" executed for ${opp.customer} (${opp.customerType}). Recovered amount ${opp.amountAtRisk}. Status changed from ${previousStatus} to Recovered.`,
      performedBy: 'Recover AI Agent',
      type: 'ai',
      customer: opp.customer,
      customerId: opp.customer.includes('Rahul') ? 'CUST-1001' : opp.customer.includes('Apex') ? 'CUST-1002' : undefined,
      invoiceId: opp.transactionId && opp.transactionId.startsWith('INV-') ? opp.transactionId : undefined,
      issue: opp.issue,
      actionTaken: actionTaken,
      amount: opp.amountAtRisk,
      previousStatus: previousStatus,
      newStatus: 'Recovered',
      result: 'Successful',
    };
    setAuditLogs((prev) => [newAuditEntry, ...prev]);

    return {
      success: true,
      message: `Successfully executed "${actionTaken}" for ${opp.customer}. Recovered ${opp.amountAtRisk}! Audit log created (${newAuditEntry.id}).`,
      opportunity: updatedOpp,
    };
  };

  /**
   * STEP 9 — Single Consistent Metrics Data Source
   * Calculates all 4 core dashboard metrics directly from the opportunities dataset & session recoveries:
   * 1. Revenue at Risk = Base At Risk (₹18,40,000) - Session Recovered Delta
   * 2. Revenue Recovered = Base Recovered (₹7,25,000) + Session Recovered Delta
   * 3. Recovery Rate = (Revenue Recovered / Revenue at Risk) * 100
   * 4. Active Recovery Cases = Base Active Cases (47) - Session Newly Recovered Opportunities
   */
  const metrics: RecoveryMetrics = useMemo(() => {
    const baseAtRisk = 1840000;
    const baseRecovered = 725000;
    const baseActiveCases = 47;

    const revenueRecovered = baseRecovered + totalRecoveredDelta;
    const revenueAtRisk = Math.max(0, baseAtRisk - totalRecoveredDelta);

    // Exact Step 9 Formula: Recovery Rate = (Revenue Recovered / Revenue at Risk) * 100
    const recoveryRateRaw = revenueAtRisk > 0 ? (revenueRecovered / revenueAtRisk) * 100 : 0;
    const recoveryRate = parseFloat(recoveryRateRaw.toFixed(1));

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

  const value = useMemo(
    () => ({
      opportunities,
      recentActivities,
      auditLogs,
      totalRecoveredDelta,
      metrics,
      executeRecovery,
      getOpportunityById,
      addAuditLogEntry,
      updateOpportunityStatusAndAction,
    }),
    [opportunities, recentActivities, auditLogs, totalRecoveredDelta, metrics]
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
