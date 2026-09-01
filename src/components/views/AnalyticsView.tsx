import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Percent,
  FileText,
  CreditCard,
  Target,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { useRecovery } from '../../context/RecoveryContext';
import { CUSTOMERS_DATA } from '../../data/customers';
import { INVOICES_DATA } from '../../data/invoices';
import { TRANSACTIONS_DATA } from '../../data/transactions';

// Colors for Recharts
const RISK_COLORS = {
  High: '#F43F5E',
  Medium: '#F59E0B',
  Low: '#10B981',
};

const STATUS_COLORS: Record<string, string> = {
  Paid: '#10B981',
  Overdue: '#F43F5E',
  Pending: '#F59E0B',
  'Promise to Pay': '#6366F1',
};

const RECOVERY_STATUS_COLORS: Record<string, string> = {
  Recovered: '#10B981',
  'In Progress': '#F59E0B',
  New: '#6366F1',
  Escalated: '#F43F5E',
  Dismissed: '#64748B',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs space-y-1.5 font-sans">
        <p className="font-bold text-white border-b border-slate-800 pb-1">
          {label || payload[0].name}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color || entry.fill }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name || 'Count'}:
            </span>
            <span className="font-mono font-bold text-slate-100">
              {typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsView: React.FC = () => {
  const { opportunities, metrics, auditLogs } = useRecovery();

  // 1. KPI Calculations (Calculated dynamically from real state & datasets)
  const totalOutstanding = useMemo(() => {
    return INVOICES_DATA.filter((inv) => inv.status !== 'paid').reduce((acc, inv) => acc + inv.amount, 0);
  }, []);

  const totalInvoicesCount = INVOICES_DATA.length;
  const paidInvoicesCount = INVOICES_DATA.filter((inv) => inv.status === 'paid').length;
  const pendingInvoicesCount = INVOICES_DATA.filter((inv) => inv.status === 'pending').length;
  const overdueInvoicesCount = INVOICES_DATA.filter((inv) => inv.status === 'overdue').length;
  const failedTxnsCount = TRANSACTIONS_DATA.filter((t) => t.status === 'failed').length;

  const newOpportunitiesCount = opportunities.filter((o) => o.status === 'New').length;
  const highPriorityOpportunitiesCount = opportunities.filter(
    (o) => (o.priorityLevel || o.priority) === 'High' || (o.priorityLevel || o.priority) === 'Critical'
  ).length;
  const totalCustomersCount = CUSTOMERS_DATA.length;

  // Centralized Recovery Rate: (Revenue Recovered / Total Revenue Initially At Risk) * 100
  const computedRecoveryRate = useMemo(() => {
    return metrics.formattedRate;
  }, [metrics]);

  // 2. Chart 1 — Recovery Status Distribution
  const recoveryStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      Recovered: 0,
      'In Progress': 0,
      New: 0,
      Escalated: 0,
      Dismissed: 0,
    };
    opportunities.forEach((o) => {
      const statusKey =
        o.status === 'Action Accepted' ? 'In Progress' : o.status;
      if (counts[statusKey] !== undefined) {
        counts[statusKey] += 1;
      } else {
        counts[statusKey] = 1;
      }
    });
    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
      fill: RECOVERY_STATUS_COLORS[key] || '#6366F1',
    }));
  }, [opportunities]);

  // 3. Chart 2 — Customer Risk Distribution
  const riskDistributionData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    CUSTOMERS_DATA.forEach((c) => {
      if (c.riskLevel === 'high') counts.High += 1;
      else if (c.riskLevel === 'medium') counts.Medium += 1;
      else if (c.riskLevel === 'low') counts.Low += 1;
    });
    return [
      { name: 'High Risk', count: counts.High, fill: RISK_COLORS.High },
      { name: 'Medium Risk', count: counts.Medium, fill: RISK_COLORS.Medium },
      { name: 'Low Risk', count: counts.Low, fill: RISK_COLORS.Low },
    ];
  }, []);

  // 4. Chart 3 — Invoice Payment Status Distribution
  const paymentStatusData = useMemo(() => {
    const counts = { Paid: 0, Overdue: 0, Pending: 0, 'Promise to Pay': 0 };
    INVOICES_DATA.forEach((inv) => {
      if (inv.status === 'paid') counts.Paid += 1;
      else if (inv.status === 'overdue') counts.Overdue += 1;
      else if (inv.status === 'pending') counts.Pending += 1;
      else if (inv.status === 'promise_to_pay') counts['Promise to Pay'] += 1;
    });
    return [
      { name: 'Paid', count: counts.Paid, fill: STATUS_COLORS.Paid },
      { name: 'Overdue', count: counts.Overdue, fill: STATUS_COLORS.Overdue },
      { name: 'Pending', count: counts.Pending, fill: STATUS_COLORS.Pending },
      { name: 'Promise to Pay', count: counts['Promise to Pay'], fill: STATUS_COLORS['Promise to Pay'] },
    ];
  }, []);

  // 5. Top Recovery Opportunities (Sorted High/Critical Priority first)
  const topOpportunities = useMemo(() => {
    return [...opportunities]
      .filter((o) => o.status !== 'Recovered' && o.status !== 'Dismissed')
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
      .slice(0, 5);
  }, [opportunities]);

  // 6. Recent Audit Recovery Activity (Step 13 Integration)
  const recentActivities = useMemo(() => {
    return auditLogs.slice(0, 5);
  }, [auditLogs]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-950/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-indigo-400" />
              Recovery Performance & Revenue Analytics
            </h2>
            <p className="text-sm text-slate-300">
              Live calculated analytics from active customer accounts, overdue invoices, gateway transactions, and AI recovery operations.
            </p>
          </div>
          <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Dynamic Data Sync Active</span>
          </div>
        </div>
      </div>

      {/* 2. Core KPI Cards Grid (Dynamic Calculations) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Outstanding</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-amber-400 font-semibold">{overdueInvoicesCount} Overdue</span>
          </div>
          <p className="text-[11px] text-slate-400">Sum of all unsettled invoice balances</p>
        </div>

        {/* Amount at Risk */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Amount at Risk</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-400 font-mono">
              {metrics.formattedAtRisk}
            </span>
            <span className="text-[11px] text-rose-400 font-semibold">{newOpportunitiesCount} Open Cases</span>
          </div>
          <p className="text-[11px] text-slate-400">Total revenue at risk across active cases</p>
        </div>

        {/* Recovered Amount */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Recovered Amount</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {metrics.formattedRecovered}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">Live Session Total</span>
          </div>
          <p className="text-[11px] text-slate-400">Successfully settled via AI dunning</p>
        </div>

        {/* Recovery Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Recovery Rate</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-indigo-300 font-mono">
              {computedRecoveryRate}
            </span>
            <span className="text-[11px] text-indigo-300 font-semibold">Calculated Math</span>
          </div>
          <p className="text-[11px] text-slate-400">Recovered / Total Recoverable Amount</p>
        </div>
      </div>

      {/* 3. Secondary Metrics Bar (8 Dynamic Data Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-slate-400 font-medium block">Total Invoices</span>
          <span className="font-mono font-bold text-sm text-white">{totalInvoicesCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-emerald-400 font-medium block">Paid Invoices</span>
          <span className="font-mono font-bold text-sm text-emerald-400">{paidInvoicesCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-amber-400 font-medium block">Pending Invoices</span>
          <span className="font-mono font-bold text-sm text-amber-400">{pendingInvoicesCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-rose-400 font-medium block">Overdue Invoices</span>
          <span className="font-mono font-bold text-sm text-rose-400">{overdueInvoicesCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-rose-400 font-medium block">Failed Txns</span>
          <span className="font-mono font-bold text-sm text-rose-400">{failedTxnsCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-indigo-300 font-medium block">New Opps</span>
          <span className="font-mono font-bold text-sm text-indigo-300">{newOpportunitiesCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-amber-400 font-medium block">High Priority</span>
          <span className="font-mono font-bold text-sm text-amber-400">{highPriorityOpportunitiesCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-0.5">
          <span className="text-[10px] text-slate-400 font-medium block">Total Accounts</span>
          <span className="font-mono font-bold text-sm text-white">{totalCustomersCount}</span>
        </div>
      </div>

      {/* 4. Charts Section (3 Dynamic Charts built using Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1 — Recovery Case Status Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-400" />
                Recovery Case Statuses
              </h3>
              <p className="text-[11px] text-slate-400">Distribution of active recovery cases</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              {opportunities.length} Cases
            </span>
          </div>

          <div className="h-56 w-full">
            {recoveryStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recoveryStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Cases" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {recoveryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                No analytics data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 2 — Customer Risk Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                Customer Risk Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Account risk profile segmentation</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              {totalCustomersCount} Accounts
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {riskDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                No analytics data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 3 — Invoice Payment Status Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                Invoice Payment Statuses
              </h3>
              <p className="text-[11px] text-slate-400">Billing schedule status counts</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              {totalInvoicesCount} Invoices
            </span>
          </div>

          <div className="h-56 w-full">
            {paymentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Invoices" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                No analytics data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Relational Section — Top Recovery Opportunities & Recent Recovery Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recovery Opportunities (Step 10 Data) */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Top Priority Recovery Opportunities
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Step 10 Ranked Queue</span>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Customer / ID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Risk</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {topOpportunities.length > 0 ? (
                  topOpportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{opp.customer}</span>
                          <span className="font-mono text-[10px] text-indigo-300">
                            {opp.id} • {opp.transactionId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-400">
                        {opp.amountAtRisk}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            opp.riskLevel === 'High'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : opp.riskLevel === 'Medium'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {opp.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {opp.priorityLevel || opp.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono text-[11px] font-semibold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/60">
                          {opp.recommendedAction}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                      No active opportunities
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Recovery Activity (Step 13 Audit Trail Data) */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Recovery Activity
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Step 13 Audit Stream</span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between space-x-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 font-mono font-bold shrink-0">
                      {act.id.slice(-3)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{act.customer || 'Account'}</span>
                        {act.customerId && (
                          <span className="font-mono text-[10px] text-indigo-300 font-semibold px-1.5 py-0.2 rounded bg-indigo-950">
                            {act.customerId}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Action: {act.actionTaken || act.event} • {act.timestamp}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      act.result === 'Successful' || act.newStatus === 'Recovered' || act.newStatus === 'Action Accepted'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : act.result === 'Escalated' || act.newStatus === 'Escalated'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {act.result || 'Executed'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No activity recorded yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
