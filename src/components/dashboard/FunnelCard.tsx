import React from 'react';
import { Filter, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RECOVERY_FUNNEL_DATA } from '../../data/mockData';

export const FunnelCard: React.FC = () => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-cyan-400" />
            Recovery Funnel
          </h3>
          <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            Conversion: 42.9%
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          End-to-end pipeline progression from initial failure detection to successful recovery
        </p>

        {/* Stepped Funnel Stage Items */}
        <div className="space-y-3">
          {RECOVERY_FUNNEL_DATA.map((stage, idx) => {
            const isLast = idx === RECOVERY_FUNNEL_DATA.length - 1;
            return (
              <div key={stage.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-slate-500 font-bold w-4">
                      0{idx + 1}
                    </span>
                    <span className={`font-semibold ${isLast ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {stage.stage}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-white text-sm">{stage.count}</span>
                    <span className="text-[11px] text-slate-400 w-12 text-right font-mono">
                      ({stage.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar fill */}
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLast
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                    }`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          61 total recoveries resolved
        </span>
        <span className="text-[11px] text-slate-500">Auto-calculated</span>
      </div>
    </div>
  );
};
