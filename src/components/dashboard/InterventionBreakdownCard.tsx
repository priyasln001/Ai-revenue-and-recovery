import React from 'react';
import { Layers, ShieldCheck } from 'lucide-react';
import { INTERVENTION_BREAKDOWN_DATA } from '../../data/mockData';

export const InterventionBreakdownCard: React.FC = () => {
  const totalAmount = INTERVENTION_BREAKDOWN_DATA.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            Revenue Recovered by Intervention
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            ₹{(totalAmount / 100000).toFixed(2)}L Total
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Distribution of recovered revenue across autonomous recovery channels
        </p>

        {/* Visual progress bar stack */}
        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-800 mb-5">
          {INTERVENTION_BREAKDOWN_DATA.map((item) => (
            <div
              key={item.name}
              className="h-full rounded-xs transition-all hover:opacity-90 cursor-pointer"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color
              }}
              title={`${item.name}: ${item.formattedAmount} (${item.percentage}%)`}
            />
          ))}
        </div>

        {/* Individual Category Items */}
        <div className="space-y-3">
          {INTERVENTION_BREAKDOWN_DATA.map((item) => (
            <div
              key={item.name}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/40 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-200">{item.name}</span>
              </div>

              <div className="flex items-center space-x-3 font-mono">
                <span className="text-xs font-bold text-white">{item.formattedAmount}</span>
                <span className="text-[11px] text-slate-400 w-12 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          5 Active Intervention Channels
        </span>
        <span className="text-[11px] text-slate-500">Live Breakdown</span>
      </div>
    </div>
  );
};
