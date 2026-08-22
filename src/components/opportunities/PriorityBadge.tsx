import React from 'react';
import { PriorityLevel } from '../../data/mockData';
import { AlertCircle, Flame, ArrowUp, Minus } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel | 'Critical';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-600/20 text-red-400 border border-red-500/40 shadow-sm animate-pulse">
          <Flame className="h-3 w-3 text-red-400" />
          Critical
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm">
          <AlertCircle className="h-3 w-3" />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <ArrowUp className="h-3 w-3" />
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <Minus className="h-3 w-3" />
          Low
        </span>
      );
    default:
      return null;
  }
};

