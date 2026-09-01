import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { OpportunityItem } from '../../data/mockData';
import { RiskScore } from './RiskScore';
import { PriorityBadge } from './PriorityBadge';
import { RecoveryProbability } from './RecoveryProbability';
import { useRecovery, RecoveryExecutionResult } from '../../context/RecoveryContext';
import { getSimpleOpportunityExplanation, getRecoveryGuardrails } from '../../utils/recoveryScoring';

interface OpportunityDetailsModalProps {
  opportunity: OpportunityItem | null;
  onClose: () => void;
}

export const OpportunityDetailsModal: React.FC<OpportunityDetailsModalProps> = ({
  opportunity,
  onClose
}) => {
  const {
    executeRecovery,
    getOpportunityById,
    addAuditLogEntry,
    updateOpportunityStatusAndAction
  } = useRecovery();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditingAction, setIsEditingAction] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('Send Email');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<RecoveryExecutionResult | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!opportunity) return null;

  // Retrieve latest reactive version from context if updated
  const currentOpp = getOpportunityById(opportunity.id) || opportunity;

  // Evaluate Recovery Guardrails & Stopping Rules
  const guardrails = getRecoveryGuardrails(currentOpp);

  const isRecovered = currentOpp.status === 'Recovered';
  const isStopped = !guardrails.isActionAllowed;

  const handleRunRecovery = () => {
    if (!guardrails.isActionAllowed) return;
    if (!showConfirm && !isSimulating) {
      setShowConfirm(true);
      return;
    }
    setShowConfirm(false);
    setIsSimulating(true);

    // Simulate real-time Gateway Sandbox & AI dunning trigger execution
    setTimeout(() => {
      const res = executeRecovery(currentOpp.id);
      setIsSimulating(false);
      setSimulationResult(res);
      setToastMessage(res.message);
      setTimeout(() => {
        setToastMessage(null);
      }, 6000);
    }, 1200);
  };

  const handleSimulateFailure = () => {
    if (isSimulating || !guardrails.isActionAllowed) return;
    setIsSimulating(true);
    setShowConfirm(false);

    setTimeout(() => {
      const res = executeRecovery(currentOpp.id, true);
      setIsSimulating(false);
      setSimulationResult(res);
      setToastMessage(res.message);
      setTimeout(() => {
        setToastMessage(null);
      }, 6000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div className="glass-card w-full max-w-2xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">{currentOpp.customer}</h3>
                <PriorityBadge priority={currentOpp.priority} />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {currentOpp.customerType} • Transaction {currentOpp.transactionId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Toast Notification Callout */}
          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 flex items-center justify-between space-x-3 shadow-lg animate-in slide-in-from-top-2">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="font-semibold text-xs">{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-indigo-400 hover:text-white text-xs font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Simulation Loading Banner */}
          {isSimulating && (
            <div className="p-4 rounded-xl bg-indigo-950/90 border border-indigo-500/60 space-y-3 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 text-indigo-200 font-bold text-xs">
                  <Loader2 className="h-5 w-5 text-indigo-400 animate-spin shrink-0" />
                  <span className="uppercase tracking-wider">
                    SIMULATING EXECUTION: {currentOpp.recommendedAction}...
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DEMO MODE MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Dispatching simulated request for <span className="text-white font-semibold">{currentOpp.customer}</span> ({currentOpp.amountAtRisk} at risk)...
              </p>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full animate-pulse w-full" />
              </div>
            </div>
          )}

          {/* Stopping Rule Callout Banner */}
          {isRecovered && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-xs">Revenue Successfully Recovered!</p>
                <p className="text-[11px] text-emerald-400/90">
                  Stopping Rule Enforced: Action completed. Endless retries are prohibited by safety rules.
                </p>
              </div>
            </div>
          )}

          {isStopped && !isRecovered && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 flex items-center space-x-3">
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold text-xs">Recovery Action Halted (Stopping Rule)</p>
                <p className="text-[11px] text-rose-300/90">
                  Maximum retry attempt threshold reached. Escalated to manual RevOps team.
                </p>
              </div>
            </div>
          )}

          {/* AI Recovery Decision Engine Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/70 border border-indigo-500/40 space-y-4 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    AI Recovery Decision Engine
                  </h4>
                  <span className="text-[10px] text-indigo-300">
                    Automated Diagnostic & Recovery Recommendation Matrix
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-900/90 text-indigo-200 border border-indigo-700/50">
                Confidence: {currentOpp.probability}%
              </span>
            </div>

            {/* 7 Decision Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* 1. Risk Score */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block">Risk Score</span>
                <RiskScore score={currentOpp.riskScore} />
              </div>

              {/* 2. Recovery Probability */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block">Recovery Probability</span>
                <RecoveryProbability probability={currentOpp.probability} />
              </div>

              {/* 3. Amount at Risk */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block">Amount at Risk</span>
                <span className="text-sm font-extrabold text-rose-400 font-mono block">
                  {currentOpp.amountAtRisk}
                </span>
              </div>

              {/* 7. Expected Recovery Amount */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] text-emerald-300 font-medium block">Expected Recovery</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono block">
                  {currentOpp.expectedRecovery || `₹${Math.round(currentOpp.rawAmount * (currentOpp.probability / 100)).toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            {/* Issue & Recommended Action Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* 4. Detected/Diagnosed Issue */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block">Diagnosed Issue</span>
                <span className="font-bold text-slate-100 text-xs inline-block bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                  {currentOpp.issue}
                </span>
              </div>

              {/* 5. Recommended Recovery Action */}
              <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-800/50 space-y-1">
                <span className="text-[10px] text-indigo-300 font-medium block">Recommended Action</span>
                <span className="font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800/60 font-mono text-xs inline-block">
                  {currentOpp.recommendedAction}
                </span>
              </div>
            </div>

            {/* 6. Why this action? Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-indigo-400" />
                Why this action?
              </span>
              <p className="text-xs text-slate-200 font-medium leading-relaxed italic bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-800/30">
                "{currentOpp.whyThisAction || currentOpp.aiDiagnosis || getSimpleOpportunityExplanation(currentOpp.issue, currentOpp.recommendedAction)}"
              </p>
            </div>
          </div>

          {/* Recovery Guardrails UI Section */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Recovery Guardrails & Stopping Rules
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  guardrails.statusBadge === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : guardrails.statusBadge === 'danger'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : guardrails.statusBadge === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}
              >
                {guardrails.statusText}
              </span>
            </div>

            {/* Guardrail Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Maximum Attempts</span>
                <span className="font-mono font-bold text-slate-200">{guardrails.maxAttempts}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Current Attempts</span>
                <span className="font-mono font-bold text-amber-400">
                  {guardrails.currentAttempts} / {guardrails.maxAttempts}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Remaining Attempts</span>
                <span className="font-mono font-bold text-indigo-300">
                  {guardrails.remainingAttempts}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Current Recovery Status</span>
                <span className="font-semibold text-white truncate block">{guardrails.statusText}</span>
              </div>
            </div>

            {/* Next Action & Stopping Reason */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] font-medium">Next Allowed Action:</span>
                <span className="font-bold text-indigo-300 font-mono">{guardrails.nextAllowedAction}</span>
              </div>

              {guardrails.stoppingReason && (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>
                    <strong>Stopping Reason:</strong> {guardrails.stoppingReason}
                  </span>
                </div>
              )}
            </div>

            {/* Inline Action Edit Selector */}
            {isEditingAction && (
              <div className="p-3 bg-slate-900 rounded-xl border border-indigo-500/40 space-y-2.5 text-xs animate-in fade-in">
                <label className="block font-semibold text-slate-200">
                  Select Alternate Recovery Action:
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Send Reminder">Send Reminder</option>
                  <option value="Send Email">Send Email</option>
                  <option value="Call Customer">Call Customer</option>
                  <option value="Offer Payment Plan">Offer Payment Plan</option>
                  <option value="Escalate Case">Escalate Case</option>
                  <option value="Mark as High Priority">Mark as High Priority</option>
                </select>
                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    onClick={() => setIsEditingAction(false)}
                    className="px-3 py-1 text-slate-400 hover:text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateOpportunityStatusAndAction(
                        currentOpp.id,
                        'Action Accepted',
                        selectedAction
                      );
                      const custId = currentOpp.customer.includes('Rahul') ? 'CUST-1001' : currentOpp.customer.includes('Apex') ? 'CUST-1002' : undefined;
                      const invId = currentOpp.transactionId && currentOpp.transactionId.startsWith('INV-') ? currentOpp.transactionId : (custId === 'CUST-1001' ? 'INV-10001' : custId === 'CUST-1002' ? 'INV-10002' : undefined);

                      addAuditLogEntry({
                        event: 'AI Action Override',
                        details: `Action updated to "${selectedAction}" for ${currentOpp.customer} (${custId || 'Account'}).`,
                        performedBy: 'Recover AI Agent',
                        type: 'user',
                        customer: currentOpp.customer,
                        customerId: custId,
                        invoiceId: invId,
                        issue: currentOpp.issue,
                        actionTaken: selectedAction,
                        amount: currentOpp.amountAtRisk,
                        previousStatus: currentOpp.status,
                        newStatus: 'Action Accepted',
                        result: 'Successful',
                      });
                      setIsEditingAction(false);
                      setToastMessage(`Action updated to "${selectedAction}" and saved!`);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-sm"
                  >
                    Save Action
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {currentOpp.status !== 'Dismissed' && currentOpp.status !== 'Action Accepted' && !isEditingAction && (
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => {
                    const custId = currentOpp.customer.includes('Rahul') ? 'CUST-1001' : currentOpp.customer.includes('Apex') ? 'CUST-1002' : undefined;
                    const invId = currentOpp.transactionId && currentOpp.transactionId.startsWith('INV-') ? currentOpp.transactionId : (custId === 'CUST-1001' ? 'INV-10001' : custId === 'CUST-1002' ? 'INV-10002' : undefined);

                    updateOpportunityStatusAndAction(
                      currentOpp.id,
                      'Action Accepted',
                      currentOpp.recommendedAction
                    );
                    addAuditLogEntry({
                      event: 'AI Recommendation Accepted',
                      details: `Action "${currentOpp.recommendedAction}" accepted for ${currentOpp.customer} (${custId || 'Account'}).`,
                      performedBy: 'Recover AI Agent',
                      type: 'user',
                      customer: currentOpp.customer,
                      customerId: custId,
                      invoiceId: invId,
                      issue: currentOpp.issue,
                      actionTaken: currentOpp.recommendedAction,
                      amount: currentOpp.amountAtRisk,
                      previousStatus: currentOpp.status,
                      newStatus: 'Action Accepted',
                      result: 'Successful',
                    });
                    setToastMessage(`Recommendation "${currentOpp.recommendedAction}" Accepted!`);
                  }}
                  className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Accept Recommendation</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedAction(currentOpp.recommendedAction);
                    setIsEditingAction(true);
                  }}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-semibold rounded-xl transition-all"
                >
                  Edit Action
                </button>

                <button
                  onClick={() => {
                    const custId = currentOpp.customer.includes('Rahul') ? 'CUST-1001' : currentOpp.customer.includes('Apex') ? 'CUST-1002' : undefined;
                    const invId = currentOpp.transactionId && currentOpp.transactionId.startsWith('INV-') ? currentOpp.transactionId : (custId === 'CUST-1001' ? 'INV-10001' : custId === 'CUST-1002' ? 'INV-10002' : undefined);

                    updateOpportunityStatusAndAction(currentOpp.id, 'Dismissed');
                    addAuditLogEntry({
                      event: 'AI Recommendation Dismissed',
                      details: `Recommendation for ${currentOpp.customer} (${custId || 'Account'}) dismissed by RevOps lead.`,
                      performedBy: 'Recover AI Agent',
                      type: 'user',
                      customer: currentOpp.customer,
                      customerId: custId,
                      invoiceId: invId,
                      issue: currentOpp.issue,
                      actionTaken: 'Dismissed',
                      amount: currentOpp.amountAtRisk,
                      previousStatus: currentOpp.status,
                      newStatus: 'Dismissed',
                      result: 'Failed',
                    });
                    setToastMessage('Recommendation Dismissed.');
                  }}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-medium rounded-xl transition-all"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Detail Attributes List */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden divide-y divide-slate-800/80">
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Customer:</span>
              <span className="font-semibold text-white">{currentOpp.customer}</span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Customer Type:</span>
              <span className="font-semibold text-slate-200">{currentOpp.customerType}</span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Transaction ID:</span>
              <span className="font-mono text-slate-200 font-semibold">{currentOpp.transactionId}</span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Previous Attempts:</span>
              <span className="font-mono text-slate-200 font-semibold">{currentOpp.attempts} Attempts</span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Current Status:</span>
              <span
                className={`font-semibold px-2.5 py-0.5 rounded text-[11px] ${
                  isRecovered
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : currentOpp.status === 'Action Accepted'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : currentOpp.status === 'Dismissed'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-200'
                }`}
              >
                {currentOpp.status}
              </span>
            </div>
          </div>

          {/* Factor Breakdown Section */}
          {currentOpp.factors && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Deterministic Factor Weights Breakdown
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px]">
                <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block truncate">Fail Ratio</span>
                  <span className="font-mono font-bold text-indigo-300">{currentOpp.factors.paymentFailureHistory}/100</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block truncate">Attempts</span>
                  <span className="font-mono font-bold text-indigo-300">{currentOpp.factors.failedAttempts}/100</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block truncate">Amount</span>
                  <span className="font-mono font-bold text-indigo-300">{currentOpp.factors.amountAtRisk}/100</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block truncate">Overdue</span>
                  <span className="font-mono font-bold text-indigo-300">{currentOpp.factors.daysOverdue}/100</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block truncate">History</span>
                  <span className="font-mono font-bold text-indigo-300">{currentOpp.factors.customerPaymentHistory}/100</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 block truncate">Severity</span>
                  <span className="font-mono font-bold text-indigo-300">{currentOpp.factors.eventSeverity}/100</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Diagnosis Block */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                AI Diagnosis & Strategy Recommendation
              </span>
              <span className="text-[10px] text-indigo-300 font-mono">Autonomous Model v1.4</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {currentOpp.aiDiagnosis}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between min-h-[64px]">
          {showConfirm ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full animate-in fade-in">
              <div className="flex items-center space-x-2 text-xs">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-slate-200 font-medium">
                  Confirm action <span className="text-indigo-300 font-bold">"{currentOpp.recommendedAction}"</span> for <span className="text-white font-bold">{currentOpp.customer}</span> ({currentOpp.amountAtRisk})?
                </span>
              </div>
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunRecovery}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Confirm & Execute</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Close Details
              </button>

              <div className="flex items-center space-x-2">
                {guardrails.isActionAllowed && !isRecovered && (
                  <button
                    onClick={handleSimulateFailure}
                    disabled={isSimulating}
                    className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 text-xs font-bold border border-amber-800/50 transition-all flex items-center space-x-1.5 shadow-sm"
                    title="Simulate a failed retry attempt to test 3-attempt guardrail escalation"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Simulate Retry Failure ({guardrails.currentAttempts}/3)</span>
                  </button>
                )}

                <button
                  onClick={handleRunRecovery}
                  disabled={!guardrails.isActionAllowed || isSimulating}
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center space-x-2 ${
                    isRecovered
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50 cursor-not-allowed opacity-80'
                      : !guardrails.isActionAllowed
                      ? 'bg-rose-950 text-rose-400 border border-rose-800/50 cursor-not-allowed opacity-80'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  {isRecovered ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Recovered ✓</span>
                    </>
                  ) : guardrails.isHardFailure ? (
                    <>
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                      <span>Halted (Hard Failure)</span>
                    </>
                  ) : !guardrails.isActionAllowed ? (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                      <span>Halted (Max Attempts Reached)</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-white" />
                      <span>Execute Recovery</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

