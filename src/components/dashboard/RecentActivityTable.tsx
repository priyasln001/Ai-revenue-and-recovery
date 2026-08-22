import React, { useState, useMemo } from 'react';
import { History, ArrowUpRight, Search, Filter } from 'lucide-react';
import { RECENT_RECOVERY_ACTIVITY, ActivityRecord } from '../../data/mockData';
import { StatusBadge } from './StatusBadge';

interface RecentActivityTableProps {
  activities?: ActivityRecord[];
  onNavigateToTransactions?: () => void;
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({
  activities = RECENT_RECOVERY_ACTIVITY,
  onNavigateToTransactions
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredActivity = useMemo(() => {
    if (!filterQuery.trim()) return activities;
    const q = filterQuery.toLowerCase();
    return activities.filter(
      (row) =>
        row.customer.toLowerCase().includes(q) ||
        row.issue.toLowerCase().includes(q) ||
        row.intervention.toLowerCase().includes(q)
    );
  }, [activities, filterQuery]);

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      {/* Table Header */}
      <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400" />
            Recent Recovery Activity
          </h3>
          <p className="text-xs text-slate-400">
            Real-time execution log of recent customer intervention events
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter customer..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 text-slate-200 placeholder-slate-500 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <button
            onClick={() => setFilterQuery('')}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center gap-1"
            title="Clear filter"
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-6">Customer</th>
              <th className="py-3.5 px-6">Issue</th>
              <th className="py-3.5 px-6">Amount at Risk</th>
              <th className="py-3.5 px-6">Intervention</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Recovered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredActivity.length > 0 ? (
              filteredActivity.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-sm">{row.customer}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{row.timestamp} • {row.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                      {row.issue}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-rose-400 text-sm">
                    {row.amountAtRisk}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-200 font-medium">{row.intervention}</span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400 text-sm">
                    {row.recoveredAmount !== '₹0' ? (
                      <span>{row.recoveredAmount}</span>
                    ) : (
                      <span className="text-slate-500 font-normal">₹0</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No activity found matching "{filterQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
        <span>Showing {filteredActivity.length} of {RECENT_RECOVERY_ACTIVITY.length} recovery records</span>
        <button
          onClick={onNavigateToTransactions}
          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
        >
          View All Transactions <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

