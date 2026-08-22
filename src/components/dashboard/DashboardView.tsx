import React, { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Bot
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { RevenueChartCard } from './RevenueChartCard';
import { FunnelCard } from './FunnelCard';
import { InterventionBreakdownCard } from './InterventionBreakdownCard';
import { RecentActivityTable } from './RecentActivityTable';
import { KpiMetric } from '../../data/mockData';
import { NavItemKey } from '../../types';
import { useRecovery } from '../../context/RecoveryContext';

interface DashboardViewProps {
  onSelectTab?: (tab: NavItemKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectTab }) => {
  const { metrics, recentActivities, totalRecoveredDelta } = useRecovery();

  const dynamicKpis: KpiMetric[] = useMemo(() => {
    return [
      {
        id: 'kpi-at-risk',
        title: 'Revenue at Risk',
        value: metrics.formattedAtRisk,
        description: 'Potential revenue currently at risk',
        trend: totalRecoveredDelta > 0 ? `-${((totalRecoveredDelta / 1840000) * 100).toFixed(1)}%` : '+4.2%',
        isPositive: totalRecoveredDelta > 0,
        accentColor: 'rose',
      },
      {
        id: 'kpi-recovered',
        title: 'Revenue Recovered',
        value: metrics.formattedRecovered,
        description: 'Successfully recovered revenue',
        trend: totalRecoveredDelta > 0 ? `+${((totalRecoveredDelta / 725000) * 100).toFixed(1)}%` : '+12.8%',
        isPositive: true,
        accentColor: 'emerald',
      },
      {
        id: 'kpi-rate',
        title: 'Recovery Rate',
        value: metrics.formattedRate,
        description: 'Recovered / Revenue at Risk × 100',
        trend: totalRecoveredDelta > 0 ? 'Measured' : '+3.1%',
        isPositive: true,
        accentColor: 'indigo',
      },
      {
        id: 'kpi-cases',
        title: 'Active Recovery Cases',
        value: `${metrics.activeCasesCount}`,
        description: 'Cases currently requiring action',
        trend: 'Active',
        isPositive: undefined,
        accentColor: 'amber',
      },
    ];
  }, [metrics, totalRecoveredDelta]);

  const getIcon = (id: string) => {
    switch (id) {
      case 'kpi-at-risk':
        return AlertTriangle;
      case 'kpi-recovered':
        return CheckCircle2;
      case 'kpi-rate':
        return TrendingUp;
      case 'kpi-cases':
        return Activity;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header */}
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-950/90 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight">
              Revenue Recovery Dashboard
            </h2>
            <p className="text-sm text-slate-300">
              Monitor revenue at risk, recovery performance, and active recovery opportunities.
            </p>
          </div>

          {/* AI Agent Status Visual Indicator */}
          <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold self-start md:self-auto shrink-0 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Bot className="h-3.5 w-3.5" />
            <span>AI Agent: Monitoring</span>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Measured Recovery KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {dynamicKpis.map((metric) => (
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

      {/* 3. Revenue Recovery Chart (7-Day) */}
      <RevenueChartCard />

      {/* 4. Recovery Funnel & Intervention Breakdown (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelCard />
        <InterventionBreakdownCard />
      </div>

      {/* 5. Recent Recovery Activity Table */}
      <RecentActivityTable
        activities={recentActivities}
        onNavigateToTransactions={() => onSelectTab?.('transactions')}
      />
    </div>
  );
};
