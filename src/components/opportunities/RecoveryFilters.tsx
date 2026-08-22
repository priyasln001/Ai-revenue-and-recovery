import React from 'react';
import { Search, Filter, RotateCcw, ArrowUpDown } from 'lucide-react';
import {
  RecoveryTypeFilter,
  RiskLevelFilter,
  OpportunityStatusFilter
} from '../../data/mockData';

export type SortByOption = 'priority_desc' | 'amount_desc' | 'risk_desc';

interface RecoveryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  recoveryType: RecoveryTypeFilter;
  onRecoveryTypeChange: (type: RecoveryTypeFilter) => void;
  riskLevel: RiskLevelFilter;
  onRiskLevelChange: (level: RiskLevelFilter) => void;
  status: OpportunityStatusFilter;
  onStatusChange: (status: OpportunityStatusFilter) => void;
  sortBy?: SortByOption;
  onSortByChange?: (sort: SortByOption) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const RecoveryFilters: React.FC<RecoveryFiltersProps> = ({
  searchQuery,
  onSearchChange,
  recoveryType,
  onRecoveryTypeChange,
  riskLevel,
  onRiskLevelChange,
  status,
  onStatusChange,
  sortBy = 'priority_desc',
  onSortByChange,
  onResetFilters,
  hasActiveFilters
}) => {
  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search customer or transaction..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        {/* Dropdown Filters & Sort Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Recovery Type Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium hidden sm:inline">Type:</span>
            <select
              value={recoveryType}
              onChange={(e) => onRecoveryTypeChange(e.target.value as RecoveryTypeFilter)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All</option>
              <option value="Payment Failure" className="bg-slate-900 text-slate-200">Payment Failure</option>
              <option value="Checkout Abandonment" className="bg-slate-900 text-slate-200">Checkout Abandonment</option>
              <option value="Subscription Failure" className="bg-slate-900 text-slate-200">Subscription Failure</option>
              <option value="Overdue Invoice" className="bg-slate-900 text-slate-200">Overdue Invoice</option>
            </select>
          </div>

          {/* Risk Level Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Risk Level:</span>
            <select
              value={riskLevel}
              onChange={(e) => onRiskLevelChange(e.target.value as RiskLevelFilter)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All</option>
              <option value="High" className="bg-slate-900 text-slate-200">High</option>
              <option value="Medium" className="bg-slate-900 text-slate-200">Medium</option>
              <option value="Low" className="bg-slate-900 text-slate-200">Low</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Status:</span>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as OpportunityStatusFilter)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-200">All</option>
              <option value="New" className="bg-slate-900 text-slate-200">New</option>
              <option value="In Progress" className="bg-slate-900 text-slate-200">In Progress</option>
              <option value="Recovered" className="bg-slate-900 text-slate-200">Recovered</option>
              <option value="Escalated" className="bg-slate-900 text-slate-200">Escalated</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          {onSortByChange && (
            <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as SortByOption)}
                className="bg-transparent text-indigo-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="priority_desc" className="bg-slate-900 text-slate-200">Priority: Highest First</option>
                <option value="amount_desc" className="bg-slate-900 text-slate-200">Amount at Risk: Highest First</option>
                <option value="risk_desc" className="bg-slate-900 text-slate-200">Risk Score: Highest First</option>
              </select>
            </div>
          )}

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1"
              title="Clear all filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

