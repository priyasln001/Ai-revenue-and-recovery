import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean | null;
  timeframe: string;
  description: string;
  icon: React.ElementType;
  accentColor: 'rose' | 'emerald' | 'indigo' | 'amber';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  timeframe,
  description,
  icon: Icon,
  accentColor
}) => {
  const colorMap = {
    rose: {
      bg: 'bg-rose-950/20',
      border: 'border-rose-900/30',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'hover:border-rose-500/40',
      text: 'text-rose-400',
    },
    emerald: {
      bg: 'bg-emerald-950/20',
      border: 'border-emerald-900/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'hover:border-emerald-500/40',
      text: 'text-emerald-400',
    },
    indigo: {
      bg: 'bg-indigo-950/20',
      border: 'border-indigo-900/30',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'hover:border-indigo-500/40',
      text: 'text-indigo-400',
    },
    amber: {
      bg: 'bg-amber-950/20',
      border: 'border-amber-900/30',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'hover:border-amber-500/40',
      text: 'text-amber-400',
    },
  };

  const style = colorMap[accentColor];

  return (
    <div
      className={`glass-card p-5 rounded-2xl border ${style.border} ${style.glow} transition-all duration-300 hover:translate-y-[-2px] flex flex-col justify-between relative overflow-hidden group`}
    >
      {/* Decorative subtle background gradient blur */}
      <div className={`absolute -right-8 -bottom-8 h-28 w-28 rounded-full ${style.bg} blur-2xl pointer-events-none transition-opacity opacity-50 group-hover:opacity-100`} />

      <div>
        {/* Header Row: Title & Icon */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className={`h-10 w-10 rounded-xl ${style.iconBg} border flex items-center justify-center transition-transform group-hover:scale-105`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Main Metric Value */}
        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {value}
          </span>
        </div>
      </div>

      {/* Subtitle / Change Indicator */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 font-semibold">
          {isPositive === true && (
            <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              {change}
            </span>
          )}
          {isPositive === false && (
            <span className="inline-flex items-center text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              <ArrowDownRight className="h-3 w-3 mr-0.5" />
              {change}
            </span>
          )}
          {isPositive === null && (
            <span className="inline-flex items-center text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              <Minus className="h-3 w-3 mr-0.5" />
              {change}
            </span>
          )}
          <span className="text-slate-400 font-normal pl-1">{timeframe}</span>
        </div>
        <span className="text-[11px] text-slate-400 truncate max-w-[140px]" title={description}>
          {description}
        </span>
      </div>
    </div>
  );
};
