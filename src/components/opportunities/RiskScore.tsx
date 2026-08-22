import React from 'react';

interface RiskScoreProps {
  score: number;
}

export const RiskScore: React.FC<RiskScoreProps> = ({ score }) => {
  let tier: 'High' | 'Medium' | 'Low';
  let badgeStyle = '';

  if (score >= 80) {
    tier = 'High';
    badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (score >= 50) {
    tier = 'Medium';
    badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else {
    tier = 'Low';
    badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  }

  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${badgeStyle}`}>
        {score}/100
      </span>
      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
        {tier}
      </span>
    </div>
  );
};
