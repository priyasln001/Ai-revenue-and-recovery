import React from 'react';
import { NavItemKey } from '../../types';
import {
  Target,
  Bot,
  Users,
  CreditCard,
  FileText,
  ShieldCheck,
  BarChart3,
  Settings,
  Sparkles,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';

interface PlaceholderViewProps {
  tabKey: NavItemKey;
  onNavigateToDashboard: () => void;
}

const viewDetails: Record<NavItemKey, { icon: React.ElementType; title: string; desc: string; highlights: string[] }> = {
  dashboard: {
    icon: Layers,
    title: 'Dashboard View',
    desc: 'Main revenue recovery metrics & activity',
    highlights: ['Revenue at Risk', 'Revenue Recovered', 'Recovery Rate', 'Active Cases']
  },
  opportunities: {
    icon: Target,
    title: 'Recovery Opportunities',
    desc: 'Prioritized high-value failed payments awaiting AI dunning & smart retry orchestration.',
    highlights: ['High-value account scoring', 'BIN failure analysis', 'Retry window optimizer', 'Custom recovery triggers']
  },
  agent: {
    icon: Bot,
    title: 'Agent Control Center',
    desc: 'Configure autonomous AI retry logic, email tone, webhook intervals, and human-in-the-loop fallback rules.',
    highlights: ['Autonomous mode toggle', 'Smart retry delay policies', 'Dynamic email templates', 'Rule engine sandbox']
  },
  customers: {
    icon: Users,
    title: 'Customer Payment Profiles',
    desc: 'Deep customer level payment health, card update status, and historical churn risk vectors.',
    highlights: ['Subscriber risk score', 'Card updater logs', 'Custom dunning schedules', 'Direct customer outreach']
  },
  transactions: {
    icon: CreditCard,
    title: 'Transaction Logs & Gateways',
    desc: 'Real-time feed of all charge attempts across Stripe, Razorpay, Adyen, and Authorize.Net.',
    highlights: ['Multi-gateway routing', 'Decline reason parsing', 'Raw response payloads', 'Retry attempt counter']
  },
  invoices: {
    icon: FileText,
    title: 'Invoices & Billing Schedules',
    desc: 'Overview of delinquent subscription invoices, past due amounts, and automated recovery links.',
    highlights: ['Past-due invoice queue', 'Frictionless payment links', 'Partial payment options', 'Billing sync state']
  },
  audit: {
    icon: ShieldCheck,
    title: 'Audit Trail & Compliance',
    desc: 'Immutable log of every action executed by RecoverAI for compliance and transparency.',
    highlights: ['Cryptographic agent action log', 'Email delivery tracking', 'Manual override record', 'SOC2 compliance export']
  },
  analytics: {
    icon: BarChart3,
    title: 'Recovery Analytics & Insights',
    desc: 'Cohort analysis, recovery velocity metrics, and payment gateway conversion comparisons.',
    highlights: ['Recovery funnel analysis', 'Failure code distribution', 'Dunning open/conversion rate', 'LTV protection calculation']
  },
  settings: {
    icon: Settings,
    title: 'Platform Settings & Gateways',
    desc: 'Manage API keys, webhooks, team permissions, security settings, and notification channels.',
    highlights: ['Gateway API key management', 'Webhook endpoint URL', 'Role-based access control', 'Slack / Email alerts']
  }
};

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ tabKey, onNavigateToDashboard }) => {
  const details = viewDetails[tabKey] || viewDetails.dashboard;
  const Icon = details.icon;

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-8 lg:p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[500px]">
      <div className="relative">
        <div className="h-20 w-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
          <Icon className="h-10 w-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-xs font-semibold text-indigo-300">
          <span>Foundation Built</span>
          <span>•</span>
          <span>Phase 1 Module</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{details.title}</h2>
        <p className="text-sm text-slate-400 leading-relaxed">{details.desc}</p>
      </div>

      {/* Highlights List */}
      <div className="w-full max-w-lg bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-left">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
          Planned Capability Matrix
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {details.highlights.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs text-slate-400">
              <Shield className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onNavigateToDashboard}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
        >
          <span>Return to Primary Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
