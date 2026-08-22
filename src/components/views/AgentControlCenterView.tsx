import React, { useState, useMemo } from 'react';
import {
  Bot,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Activity,
  Clock,
  Sliders,
  Target
} from 'lucide-react';
import { useRecovery } from '../../context/RecoveryContext';
import { MetricCard } from '../dashboard/MetricCard';

export const AgentControlCenterView: React.FC = () => {
  const { opportunities, auditLogs, addAuditLogEntry } = useRecovery();

  // Agent State
  const [isAgentActive, setIsAgentActive] = useState<boolean>(true);
  const [lastScanTime, setLastScanTime] = useState<string>('Just now');
  const [lastScanSummary, setLastScanSummary] = useState<string>(
    'Initial automated scan active. All gateways monitored.'
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Dynamic calculations from centralized RecoveryContext
  const totalOpportunities = opportunities.length;
  const highPriorityCount = useMemo(() => {
    return opportunities.filter(
      (o) => (o.priorityLevel || o.priority) === 'High' || (o.priorityLevel || o.priority) === 'Critical'
    ).length;
  }, [opportunities]);

  const newOpportunitiesCount = useMemo(() => {
    return opportunities.filter((o) => o.status === 'New').length;
  }, [opportunities]);

  const pendingActionsCount = useMemo(() => {
    return opportunities.filter((o) => o.status === 'New' || o.status === 'In Progress').length;
  }, [opportunities]);

  // Run Scan Handler
  const handleRunScan = () => {
    if (!isAgentActive) {
      setToastNotice('Agent is paused. Resume the agent to run a scan.');
      setTimeout(() => setToastNotice(null), 4000);
      return;
    }

    setIsScanning(true);
    setToastNotice('Running agent scan...');

    setTimeout(() => {
      setIsScanning(false);
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastScanTime(`Today at ${timeString}`);
      
      const summaryMsg = `Scan completed — ${totalOpportunities} opportunities reviewed (${highPriorityCount} high priority).`;
      setLastScanSummary(summaryMsg);

      // Log scan execution event to Audit Trail
      addAuditLogEntry({
        event: 'Agent Scan Completed',
        details: `Agent scan completed across ${totalOpportunities} active recovery opportunities (${highPriorityCount} high priority).`,
        performedBy: 'Recover AI Agent',
        type: 'ai',
        customer: 'All Accounts',
        issue: 'System Scan',
        actionTaken: 'Agent Scan Completed',
        amount: `₹${opportunities.reduce((acc, curr) => acc + curr.rawAmount, 0).toLocaleString('en-IN')}`,
        previousStatus: 'Active',
        newStatus: 'Monitoring',
        result: 'Successful',
      });

      setToastNotice(summaryMsg);
      setTimeout(() => setToastNotice(null), 4500);
    }, 900);
  };

  // Toggle Agent Active/Pause Handler
  const handleToggleAgent = () => {
    const nextState = !isAgentActive;
    setIsAgentActive(nextState);
    
    const actionText = nextState ? 'Resumed' : 'Paused';
    const statusMsg = `Agent monitoring state set to ${actionText.toUpperCase()}.`;
    setLastScanSummary(statusMsg);

    addAuditLogEntry({
      event: `Agent State ${actionText}`,
      details: `Autonomous recovery agent was ${actionText.toLowerCase()} by RevOps Lead.`,
      performedBy: 'RevOps Lead',
      type: 'user',
      customer: 'System Control',
      issue: 'Agent Configuration',
      actionTaken: `Agent ${actionText}`,
      amount: 'N/A',
      previousStatus: isAgentActive ? 'Active' : 'Paused',
      newStatus: nextState ? 'Active' : 'Paused',
      result: 'Successful',
    });

    setToastNotice(`Agent status changed to ${nextState ? 'ACTIVE' : 'PAUSED'}.`);
    setTimeout(() => setToastNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Agent Status Control Card */}
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/50 via-slate-900/90 to-slate-950 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  Agent Control Center
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono font-normal">
                    Rule Engine v1.4
                  </span>
                </h2>
                <p className="text-sm text-slate-300">
                  Monitor autonomous dunning workflows, gateway retry rules, and failure notifications.
                </p>
              </div>
            </div>
          </div>

          {/* Status Indicator & Start/Pause Toggle */}
          <div className="flex items-center space-x-4 shrink-0 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  {isAgentActive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      isAgentActive ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  ></span>
                </span>
                <span className="text-sm font-extrabold text-white">
                  {isAgentActive ? 'Agent Active' : 'Agent Paused'}
                </span>
              </div>
              <span className="text-xs text-slate-400 pl-5 font-mono">
                {isAgentActive ? 'Monitoring active' : 'Monitoring paused'}
              </span>
            </div>

            <button
              onClick={handleToggleAgent}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center space-x-2 ${
                isAgentActive
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {isAgentActive ? (
                <>
                  <Pause className="h-4 w-4 fill-amber-300" />
                  <span>Pause Agent</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Resume Agent</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Callout Banner */}
      {toastNotice && (
        <div className="p-4 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 flex items-center justify-between shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-5 w-5 text-indigo-400 animate-spin" />
            <span className="font-semibold text-xs">{toastNotice}</span>
          </div>
          <button
            onClick={() => setToastNotice(null)}
            className="text-xs text-indigo-300 hover:text-white font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Key Dynamic Agent Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard
          title="Opportunities Detected"
          value={`${totalOpportunities}`}
          change="Real-time"
          isPositive={undefined}
          timeframe=""
          description="Total detected recovery cases"
          icon={Target}
          accentColor="indigo"
        />

        <MetricCard
          title="High Priority"
          value={`${highPriorityCount}`}
          change="Urgent"
          isPositive={false}
          timeframe=""
          description="Cases requiring immediate action"
          icon={AlertCircle}
          accentColor="rose"
        />

        <MetricCard
          title="New Opportunities"
          value={`${newOpportunitiesCount}`}
          change="Queue"
          isPositive={undefined}
          timeframe=""
          description="Awaiting initial recommendation"
          icon={Sparkles}
          accentColor="amber"
        />

        <MetricCard
          title="Actions Pending"
          value={`${pendingActionsCount}`}
          change="Active"
          isPositive={true}
          timeframe=""
          description="In progress or newly flagged"
          icon={Activity}
          accentColor="emerald"
        />
      </div>

      {/* 3. Agent Action & Monitoring Status Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Last Scan: <strong className="text-slate-200">{lastScanTime}</strong></span>
          </div>
          <p className="text-xs font-semibold text-white font-mono">
            {lastScanSummary}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center space-x-2 ${
              !isAgentActive
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-70'
                : isScanning
                ? 'bg-indigo-900 text-indigo-300 cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Run Scan'}</span>
          </button>
        </div>
      </div>

      {/* 4. Active Rules & Event Stream Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Recovery Rules Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Active Autonomous Rules</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Rule Engine Enabled</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>Rule 1: 3DS Soft Decline Retry</span>
                <span className="text-emerald-400 font-mono">Active</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Automatically schedule retry within 48h optimal window for temporary bank declines.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>Rule 2: High Risk Priority Escalation</span>
                <span className="text-emerald-400 font-mono">Active</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Flag accounts with Risk Score ≥ 80 or overdue &gt; 15 days as High Priority.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span>Rule 3: RevOps Intervention Threshold</span>
                <span className="text-amber-400 font-mono">Stopping Rule</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Halt automated retries after 3 failed attempts to avoid card network penalties.
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Agent Events Log Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-indigo-400 animate-pulse" />
              <h3 className="text-base font-bold text-white">Agent Activity Feed</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Live Session Log</span>
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 text-xs">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between space-x-3"
              >
                <div className="space-y-1">
                  <span className="font-bold text-white block">{log.event}</span>
                  <p className="text-[11px] text-slate-300">{log.details}</p>
                  <span className="text-[10px] text-slate-500 font-mono block pt-0.5">
                    {log.timestamp} • Performed by {log.performedBy}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 shrink-0">
                  {log.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Monitored Cases Summary Table (Sync check for CUST-1001, CUST-1002, INV-10001, INV-10002) */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Monitored Case Inspector</h3>
            <p className="text-xs text-slate-400">
              Live status synchronization with Customer Search & Recovery Opportunities.
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-300 px-3 py-1 rounded-lg bg-indigo-950 border border-indigo-800">
            Synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Opportunity ID</th>
                <th className="py-3 px-4">Customer Name / ID</th>
                <th className="py-3 px-4">Issue</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Recommended Action</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {opportunities.slice(0, 6).map((opp) => (
                <tr key={opp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-300">{opp.id}</td>
                  <td className="py-3 px-4 text-white">
                    {opp.customer}{' '}
                    <span className="text-slate-400 font-mono text-[10px]">
                      ({opp.transactionId})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{opp.issue}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        opp.priority === 'High' || opp.priorityLevel === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : opp.priority === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {opp.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-indigo-200 font-semibold">{opp.recommendedAction}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        opp.status === 'Recovered'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : opp.status === 'Action Accepted'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : opp.status === 'Dismissed'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {opp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
