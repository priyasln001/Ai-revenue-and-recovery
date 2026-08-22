import React, { useState, useMemo } from 'react';
import {
  Target,
  AlertCircle,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Activity,
  ShieldAlert,
  Flame,
  CheckCircle2
} from 'lucide-react';
import {
  OpportunityItem,
  RecoveryTypeFilter,
  RiskLevelFilter,
  OpportunityStatusFilter,
  KpiMetric
} from '../../data';
import { useRecovery } from '../../context/RecoveryContext';
import { MetricCard } from '../dashboard/MetricCard';
import { RecoveryFilters, SortByOption } from './RecoveryFilters';
import { RecoveryOpportunityTable } from './RecoveryOpportunityTable';
import { OpportunityDetailsModal } from './OpportunityDetailsModal';

export const OpportunitiesView: React.FC = () => {
  // Dynamically scored opportunities from centralized RecoveryContext
  const { opportunities: scoredOpportunities, metrics } = useRecovery();

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [recoveryType, setRecoveryType] = useState<RecoveryTypeFilter>('All');
  const [riskLevel, setRiskLevel] = useState<RiskLevelFilter>('All');
  const [status, setStatus] = useState<OpportunityStatusFilter>('All');
  const [sortBy, setSortBy] = useState<SortByOption>('priority_desc');

  // Modal State
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityItem | null>(null);

  // Dynamic Summary KPIs based on current reactive opportunities
  const newOpportunitiesCount = useMemo(() => {
    return scoredOpportunities.filter((o) => o.status === 'New').length;
  }, [scoredOpportunities]);

  const opportunitiesSummaryKpis: KpiMetric[] = useMemo(() => {
    const totalCount = scoredOpportunities.length;
    const highPriorityCount = scoredOpportunities.filter(
      (o) => (o.priorityLevel || o.priority) === 'High' || (o.priorityLevel || o.priority) === 'Critical'
    ).length;

    return [
      {
        id: 'opp-total',
        title: 'Total Opportunities',
        value: `${totalCount}`,
        description: 'Total detected recovery cases',
        trend: 'Active',
        isPositive: undefined,
        accentColor: 'indigo',
      },
      {
        id: 'opp-high-priority',
        title: 'High Priority',
        value: `${highPriorityCount}`,
        description: 'Requiring immediate intervention',
        trend: 'Urgent',
        isPositive: false,
        accentColor: 'rose',
      },
      {
        id: 'opp-revenue-risk',
        title: 'Revenue at Risk',
        value: metrics.formattedAtRisk,
        description: 'Aggregate value of open cases',
        trend: 'Monitored',
        isPositive: false,
        accentColor: 'amber',
      },
      {
        id: 'opp-potential-recovery',
        title: 'Recovered Revenue',
        value: metrics.formattedRecovered,
        description: 'Total revenue successfully recovered',
        trend: 'Real-time',
        isPositive: true,
        accentColor: 'emerald',
      },
    ];
  }, [scoredOpportunities, metrics]);

  // Dynamic Scoring Summary calculations
  const scoringSummary = useMemo(() => {
    return {
      highRisk: scoredOpportunities.filter((o) => o.riskLevel === 'High').length,
      mediumRisk: scoredOpportunities.filter((o) => o.riskLevel === 'Medium').length,
      lowRisk: scoredOpportunities.filter((o) => o.riskLevel === 'Low').length,
      criticalPriority: scoredOpportunities.filter((o) => (o.priorityLevel || o.priority) === 'Critical').length,
      highPriority: scoredOpportunities.filter((o) => (o.priorityLevel || o.priority) === 'High').length,
      mediumPriority: scoredOpportunities.filter((o) => (o.priorityLevel || o.priority) === 'Medium').length,
      lowPriority: scoredOpportunities.filter((o) => (o.priorityLevel || o.priority) === 'Low').length,
    };
  }, [scoredOpportunities]);

  // Icon mapper for KPI cards
  const getIcon = (id: string) => {
    switch (id) {
      case 'opp-total':
        return Target;
      case 'opp-high-priority':
        return AlertCircle;
      case 'opp-revenue-risk':
        return AlertTriangle;
      case 'opp-potential-recovery':
        return TrendingUp;
      default:
        return Activity;
    }
  };

  // Local filtering & sorting calculation
  const filteredAndSortedOpportunities = useMemo(() => {
    const filtered = scoredOpportunities.filter((item) => {
      // Search query filter (matches customer name, transaction ID, or issue)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesCustomer = item.customer.toLowerCase().includes(query);
        const matchesTxn = item.transactionId.toLowerCase().includes(query);
        const matchesIssue = item.issue.toLowerCase().includes(query);
        if (!matchesCustomer && !matchesTxn && !matchesIssue) return false;
      }

      // Recovery Type filter
      if (recoveryType !== 'All' && item.recoveryType !== recoveryType) {
        return false;
      }

      // Risk Level filter
      if (riskLevel !== 'All' && item.riskLevel !== riskLevel) {
        return false;
      }

      // Status filter
      if (status !== 'All' && item.status !== status) {
        return false;
      }

      return true;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'priority_desc') {
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      }
      if (sortBy === 'amount_desc') {
        return b.rawAmount - a.rawAmount;
      }
      if (sortBy === 'risk_desc') {
        return b.riskScore - a.riskScore;
      }
      return 0;
    });
  }, [scoredOpportunities, searchQuery, recoveryType, riskLevel, status, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' || recoveryType !== 'All' || riskLevel !== 'All' || status !== 'All';

  const handleResetFilters = () => {
    setSearchQuery('');
    setRecoveryType('All');
    setRiskLevel('All');
    setStatus('All');
    setSortBy('priority_desc');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-950/90 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight">
              Recovery Opportunities
            </h2>
            <p className="text-sm text-slate-300">
              Identify and prioritize revenue that may be recovered.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold self-start md:self-auto shrink-0 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>{newOpportunitiesCount} New Opportunities</span>
          </div>
        </div>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {opportunitiesSummaryKpis.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            change={metric.trend || ''}
            isPositive={metric.isPositive}
            timeframe=""
            description={metric.description}
            icon={getIcon(metric.id)}
            accentColor={metric.accentColor}
          />
        ))}
      </div>

      {/* 3. Scoring Engine Distribution Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risk Distribution Card */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Risk Engine Distribution
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Calculated from synthetic cases</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] text-rose-300 font-medium block">High Risk (80-100)</span>
              <span className="text-base font-extrabold text-rose-400 font-mono">
                {scoringSummary.highRisk}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-amber-300 font-medium block">Medium Risk (50-79)</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {scoringSummary.mediumRisk}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-300 font-medium block">Low Risk (0-49)</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {scoringSummary.lowRisk}
              </span>
            </div>
          </div>
        </div>

        {/* Priority Distribution Card */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Recovery Priority Tiers
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Ranked by Priority Score</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-red-600/15 border border-red-500/30">
              <span className="text-[10px] text-red-300 font-medium block">Critical</span>
              <span className="text-base font-extrabold text-red-400 font-mono">
                {scoringSummary.criticalPriority}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] text-rose-300 font-medium block">High</span>
              <span className="text-base font-extrabold text-rose-400 font-mono">
                {scoringSummary.highPriority}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-amber-300 font-medium block">Medium</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {scoringSummary.mediumPriority}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 font-medium block">Low</span>
              <span className="text-base font-extrabold text-slate-300 font-mono">
                {scoringSummary.lowPriority}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filters & Sorting Bar */}
      <RecoveryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        recoveryType={recoveryType}
        onRecoveryTypeChange={setRecoveryType}
        riskLevel={riskLevel}
        onRiskLevelChange={setRiskLevel}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 5. Opportunities Data Table */}
      <RecoveryOpportunityTable
        opportunities={filteredAndSortedOpportunities}
        totalCount={scoredOpportunities.length}
        onSelectOpportunity={setSelectedOpportunity}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 6. Opportunity Details Modal */}
      <OpportunityDetailsModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
    </div>
  );
};


