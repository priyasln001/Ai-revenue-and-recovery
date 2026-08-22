import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { WEEKLY_RECOVERY_DATA } from '../../data/mockData';
import { Calendar, TrendingUp } from 'lucide-react';

const formatINR = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}k`;
  }
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs space-y-1.5">
        <p className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-normal">7-Day Snapshot</span>
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-slate-100">
              ₹{entry.value.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const RevenueChartCard: React.FC = () => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            Revenue Recovery Trend (7 Days)
          </h3>
          <p className="text-xs text-slate-400">
            Comparison of total revenue at risk vs. revenue successfully recovered daily
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
          <span>Monday – Sunday</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={WEEKLY_RECOVERY_DATA}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickFormatter={formatINR}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
              formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
            />
            <Bar
              dataKey="rawAtRisk"
              name="Revenue at Risk"
              fill="#F43F5E"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="rawRecovered"
              name="Revenue Recovered"
              fill="#10B981"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
