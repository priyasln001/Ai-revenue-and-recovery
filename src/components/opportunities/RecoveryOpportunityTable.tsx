import React from 'react';
import { Eye, SearchX } from 'lucide-react';
import { OpportunityItem } from '../../data/mockData';
import { RiskScore } from './RiskScore';
import { PriorityBadge } from './PriorityBadge';
import { RecoveryProbability } from './RecoveryProbability';

interface RecoveryOpportunityTableProps {
  opportunities: OpportunityItem[];
  totalCount: number;
  onSelectOpportunity: (opportunity: OpportunityItem) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const RecoveryOpportunityTable: React.FC<RecoveryOpportunityTableProps> = ({
  opportunities,
  totalCount,
  onSelectOpportunity,
  onResetFilters,
  hasActiveFilters
}) => {
  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <span className="text-xs font-semibold text-slate-300">
          Showing <span className="text-white font-bold">{opportunities.length}</span> of{' '}
          {totalCount} opportunities
        </span>
        <span className="text-[11px] text-slate-400">Sorted by Priority & Risk Score</span>
      </div>

      {/* Table Content */}
      {opportunities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Issue</th>
                <th className="py-3.5 px-5">Amount at Risk</th>
                <th className="py-3.5 px-5">Risk Score</th>
                <th className="py-3.5 px-5">Recovery Probability</th>
                <th className="py-3.5 px-5">Priority</th>
                <th className="py-3.5 px-5">Recommended Action</th>
                <th className="py-3.5 px-5">Attempts</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {opportunities.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Customer */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-sm">{item.customer}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.id} • {item.customerType}
                      </span>
                    </div>
                  </td>

                  {/* Issue */}
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-200 font-medium text-[11px]">
                      {item.issue}
                    </span>
                  </td>

                  {/* Amount at Risk */}
                  <td className="py-4 px-5 font-mono font-bold text-rose-400 text-sm">
                    {item.amountAtRisk}
                  </td>

                  {/* Risk Score */}
                  <td className="py-4 px-5">
                    <RiskScore score={item.riskScore} />
                  </td>

                  {/* Recovery Probability */}
                  <td className="py-4 px-5">
                    <RecoveryProbability probability={item.probability} />
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-5">
                    <PriorityBadge priority={item.priority} />
                  </td>

                  {/* Recommended Action */}
                  <td className="py-4 px-5">
                    <span className="font-semibold text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/40 text-[11px] inline-block">
                      {item.recommendedAction}
                    </span>
                  </td>

                  {/* Attempts */}
                  <td className="py-4 px-5 font-mono font-semibold text-slate-300">
                    {item.attempts}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        item.status === 'New'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : item.status === 'In Progress'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : item.status === 'Recovered'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => onSelectOpportunity(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center space-x-1.5 shadow-sm"
                    >
                      <Eye className="h-3.5 w-3.5 text-indigo-400" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <SearchX className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-base font-bold text-white">No new recovery opportunities</h3>
            <p className="text-xs text-slate-400">
              Try changing your filters or search query.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
