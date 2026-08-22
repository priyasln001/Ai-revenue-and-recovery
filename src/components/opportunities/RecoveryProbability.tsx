import React from 'react';

interface RecoveryProbabilityProps {
  probability: number;
}

export const RecoveryProbability: React.FC<RecoveryProbabilityProps> = ({ probability }) => {
  let barColor = 'bg-emerald-400';
  let textColor = 'text-emerald-400';

  if (probability < 50) {
    barColor = 'bg-rose-400';
    textColor = 'text-rose-400';
  } else if (probability < 75) {
    barColor = 'bg-amber-400';
    textColor = 'text-amber-400';
  }

  return (
    <div className="flex items-center space-x-2 min-w-[90px]">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${probability}%` }}
        />
      </div>
      <span className={`font-mono font-bold text-xs ${textColor}`}>
        {probability}%
      </span>
    </div>
  );
};
