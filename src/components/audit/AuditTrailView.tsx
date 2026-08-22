import React, { useState, useMemo } from 'react';
import { ShieldCheck, Search, Filter, Bot, User, Cpu, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { useRecovery } from '../../context/RecoveryContext';
import { AuditLogEntry } from '../../types';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useRecovery();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'recovery' | 'agent' | 'invoice'>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Category filtering
      if (categoryFilter === 'recovery') {
        const isRecovery =
          log.event.toLowerCase().includes('recommendation') ||
          log.event.toLowerCase().includes('retry') ||
          log.event.toLowerCase().includes('recovery') ||
          log.event.toLowerCase().includes('link') ||
          (log.actionTaken && log.actionTaken.toLowerCase().includes('recommendation'));
        if (!isRecovery) return false;
      } else if (categoryFilter === 'agent') {
        const isAgent =
          log.type === 'ai' ||
          log.event.toLowerCase().includes('agent') ||
          log.event.toLowerCase().includes('scan') ||
          log.performedBy.toLowerCase().includes('agent');
        if (!isAgent) return false;
      } else if (categoryFilter === 'invoice') {
        const isInvoice =
          !!log.invoiceId ||
          log.event.toLowerCase().includes('invoice') ||
          log.event.toLowerCase().includes('payment') ||
          log.issue?.toLowerCase().includes('invoice') ||
          log.issue?.toLowerCase().includes('payment');
        if (!isInvoice) return false;
      }

      // Search Query Filtering
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesCustomer = (log.customer || '').toLowerCase().includes(q);
        const matchesCustomerId = (log.customerId || '').toLowerCase().includes(q);
        const matchesInvoiceId = (log.invoiceId || '').toLowerCase().includes(q);
        const matchesAction = (log.actionTaken || log.event).toLowerCase().includes(q);
        const matchesEvent = log.event.toLowerCase().includes(q);
        const matchesDetails = log.details.toLowerCase().includes(q);
        const matchesId = log.id.toLowerCase().includes(q);
        const matchesPerformedBy = log.performedBy.toLowerCase().includes(q);

        if (
          !matchesCustomer &&
          !matchesCustomerId &&
          !matchesInvoiceId &&
          !matchesAction &&
          !matchesEvent &&
          !matchesDetails &&
          !matchesId &&
          !matchesPerformedBy
        ) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, searchQuery, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-950/90 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
              Audit Trail & Compliance History
            </h2>
            <p className="text-sm text-slate-300">
              Clear, session-persistent history of AI recommendations, dunning triggers, status changes, and agent actions.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold self-start md:self-auto shrink-0 shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Audit Trail Active</span>
          </div>
        </div>
      </div>

      {/* 2. Audit Trail KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Logged Actions</span>
            <span className="text-2xl font-extrabold text-white font-mono">{auditLogs.length}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">AI Agent Actions</span>
            <span className="text-2xl font-extrabold text-indigo-400 font-mono">
              {auditLogs.filter((l) => l.type === 'ai' || l.performedBy.includes('Agent')).length}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Successful Operations</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {auditLogs.filter((l) => l.result === 'Successful' || l.newStatus === 'Recovered').length}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Query */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Customer ID (CUST-1001), Invoice ID (INV-10001), Action, or Performed By..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        {/* Action Category Filter */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs flex-wrap sm:flex-nowrap gap-1 sm:gap-0">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({auditLogs.length})
          </button>
          <button
            onClick={() => setCategoryFilter('recovery')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              categoryFilter === 'recovery'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recovery Actions
          </button>
          <button
            onClick={() => setCategoryFilter('agent')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              categoryFilter === 'agent'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Agent Actions
          </button>
          <button
            onClick={() => setCategoryFilter('invoice')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              categoryFilter === 'invoice'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Invoice/Payment Actions
          </button>
        </div>
      </div>

      {/* 4. Audit Log Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Showing <span className="text-white font-bold">{filteredLogs.length}</span> audit records
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Session Audit History</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">ID & Timestamp</th>
                <th className="py-3.5 px-5">Customer & Invoice</th>
                <th className="py-3.5 px-5">Issue</th>
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Status Transition</th>
                <th className="py-3.5 px-5">Result</th>
                <th className="py-3.5 px-5">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* ID & Timestamp */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-indigo-300 text-xs">{log.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                      </div>
                    </td>

                    {/* Customer & Invoice IDs */}
                    <td className="py-4 px-5 font-semibold text-white">
                      <div className="flex flex-col">
                        <span className="text-white">{log.customer || 'All Accounts'}</span>
                        <div className="flex items-center space-x-1.5 mt-0.5 font-mono text-[10px]">
                          {log.customerId && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                              {log.customerId}
                            </span>
                          )}
                          {log.invoiceId && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                              {log.invoiceId}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Issue */}
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                        {log.issue || 'Payment Failure'}
                      </span>
                    </td>

                    {/* Action Taken */}
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-800/40 text-indigo-300 font-semibold text-[11px] inline-block">
                        {log.actionTaken || log.event}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-5 font-mono font-bold text-rose-400 text-xs">
                      {log.amount || 'N/A'}
                    </td>

                    {/* Status Transition (Previous -> New) */}
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {log.previousStatus || 'New'}
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-500" />
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold ${
                            log.newStatus === 'Recovered' || log.newStatus === 'Action Accepted'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : log.newStatus === 'Escalated' || log.newStatus === 'Dismissed'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {log.newStatus || 'Updated'}
                        </span>
                      </div>
                    </td>

                    {/* Result */}
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          log.result === 'Successful' || log.newStatus === 'Recovered' || log.newStatus === 'Action Accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : log.result === 'Escalated' || log.newStatus === 'Escalated' || log.newStatus === 'Dismissed'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {log.result || (log.newStatus === 'Recovered' ? 'Successful' : 'In Progress')}
                      </span>
                    </td>

                    {/* Performed By */}
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-1.5">
                        {log.type === 'ai' || log.performedBy.includes('Agent') ? (
                          <Bot className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        ) : log.type === 'user' ? (
                          <User className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <Cpu className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        )}
                        <span className="text-slate-300 font-medium truncate max-w-[140px]">
                          {log.performedBy}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No activity recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
