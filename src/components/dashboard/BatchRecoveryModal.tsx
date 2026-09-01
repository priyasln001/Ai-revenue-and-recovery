import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle2, AlertTriangle, Sparkles, Loader2, ShieldAlert, ArrowRight, Activity, TrendingUp, Layers } from 'lucide-react';
import { BatchRecoverySummary, useRecovery } from '../../context/RecoveryContext';

interface BatchRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAudit?: () => void;
}

export const BatchRecoveryModal: React.FC<BatchRecoveryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToAudit
}) => {
  const { runBatchRecovery, lastBatchSummary } = useRecovery();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [summary, setSummary] = useState<BatchRecoverySummary | null>(lastBatchSummary);

  useEffect(() => {
    if (isOpen && !summary && !isProcessing) {
      handleRunBatch();
    }
  }, [isOpen]);

  const handleRunBatch = () => {
    setIsProcessing(true);
    setProgressStep(1);

    setTimeout(() => setProgressStep(2), 600);
    setTimeout(() => setProgressStep(3), 1200);
    setTimeout(() => {
      const res = runBatchRecovery();
      setSummary(res);
      setIsProcessing(false);
      setProgressStep(4);
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div className="glass-card w-full max-w-2xl rounded-2xl border border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">AI Batch Recovery Engine</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  DEMO SIMULATION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated multi-case dunning & recovery simulation with Guardrail evaluation
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Animated Processing State */}
          {isProcessing && (
            <div className="p-6 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 space-y-4 text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mb-1">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Executing Recovery Batch...
                </h4>
                <p className="text-xs text-indigo-200">
                  {progressStep === 1 && 'Step 1/3: Analyzing recovery cases & risk probability...'}
                  {progressStep === 2 && 'Step 2/3: Evaluating Guardrails & 3-attempt stopping rules...'}
                  {progressStep === 3 && 'Step 3/3: Dispatching automated gateway retries & updating metrics...'}
                </p>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-indigo-900">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: progressStep === 1 ? '30%' : progressStep === 2 ? '65%' : '90%',
                  }}
                />
              </div>
            </div>
          )}

          {/* Completed State: Batch Recovery Summary Card */}
          {summary && !isProcessing && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Batch Banner */}
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Batch Recovery Completed ✓</h4>
                    <p className="text-xs text-emerald-300">
                      Processed at <span className="font-mono">{summary.batchTimestamp}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRunBatch}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all flex items-center space-x-1"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Re-Run Batch</span>
                </button>
              </div>

              {/* Main Summary Visual Grid */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                      Batch Recovery Summary
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Dynamic Calculated Results
                  </span>
                </div>

                {/* 9 Calculated Summary Metrics */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  
                  {/* Opportunities Analyzed */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium block truncate">
                      Opportunities Analyzed
                    </span>
                    <span className="text-lg font-extrabold text-white font-mono block">
                      {summary.opportunitiesAnalyzed}
                    </span>
                  </div>

                  {/* High Priority Cases */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-300 font-medium block truncate">
                      High Priority Cases
                    </span>
                    <span className="text-lg font-extrabold text-amber-400 font-mono block">
                      {summary.highPriorityCases}
                    </span>
                  </div>

                  {/* Actions Executed */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-indigo-300 font-medium block truncate">
                      Actions Executed
                    </span>
                    <span className="text-lg font-extrabold text-indigo-300 font-mono block">
                      {summary.actionsExecuted}
                    </span>
                  </div>

                  {/* Successfully Recovered */}
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 space-y-1">
                    <span className="text-[10px] text-emerald-300 font-medium block truncate">
                      Successfully Recovered
                    </span>
                    <span className="text-lg font-extrabold text-emerald-400 font-mono block">
                      {summary.successfullyRecoveredCases}
                    </span>
                  </div>

                  {/* Revenue Recovered */}
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 space-y-1">
                    <span className="text-[10px] text-emerald-300 font-medium block truncate">
                      Revenue Recovered
                    </span>
                    <span className="text-base font-extrabold text-emerald-300 font-mono block">
                      {summary.formattedRevenueRecovered}
                    </span>
                  </div>

                  {/* Recovery Rate */}
                  <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/40 space-y-1">
                    <span className="text-[10px] text-indigo-300 font-medium block truncate">
                      Recovery Rate
                    </span>
                    <span className="text-lg font-extrabold text-indigo-200 font-mono block">
                      {summary.formattedRecoveryRate}
                    </span>
                  </div>

                  {/* Revenue at Risk */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-rose-400 font-medium block truncate">
                      Revenue at Risk
                    </span>
                    <span className="text-base font-extrabold text-rose-400 font-mono block">
                      {summary.formattedRevenueAtRisk}
                    </span>
                  </div>

                  {/* Cases Escalated */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-rose-300 font-medium block truncate">
                      Cases Escalated
                    </span>
                    <span className="text-lg font-extrabold text-rose-300 font-mono block">
                      {summary.casesEscalated}
                    </span>
                  </div>

                  {/* Stopped by Guardrails */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-400 font-medium block truncate">
                      Stopped by Guardrails
                    </span>
                    <span className="text-lg font-extrabold text-amber-400 font-mono block">
                      {summary.casesStoppedByGuardrails}
                    </span>
                  </div>
                </div>

                {/* Subtext info */}
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>
                      Guardrails evaluated: Retries capped at 3 attempts & hard decline codes blocked.
                    </span>
                  </div>
                  <span className="font-mono text-indigo-300 font-semibold shrink-0">
                    Audit Trail Updated
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          {onNavigateToAudit && (
            <button
              onClick={() => {
                onClose();
                onNavigateToAudit();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <span>View Audit Trail</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all ml-auto"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};
