import React from 'react';
import {
  LayoutDashboard,
  Target,
  Bot,
  Users,
  CreditCard,
  FileText,
  ShieldCheck,
  BarChart3,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';
import { NavItemKey } from '../../types';
import { useRecovery } from '../../context/RecoveryContext';

interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavMenuItem {
  key: NavItemKey;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const { opportunities } = useRecovery();
  const newOpportunitiesCount = opportunities.filter((o) => o.status === 'New').length;

  const navItems: NavMenuItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      key: 'opportunities',
      label: 'Recovery Opportunities',
      icon: Target,
      badge: `${newOpportunitiesCount} New`,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    { key: 'agent', label: 'Agent Control Center', icon: Bot, badge: 'Live', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'transactions', label: 'Transactions', icon: CreditCard },
    { key: 'invoices', label: 'Invoices', icon: FileText },
    { key: 'audit', label: 'Audit Trail', icon: ShieldCheck },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-fintech-panel border-r border-fintech-border transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-68'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-fintech-border shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Zap className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  Recover<span className="text-indigo-400">AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Revenue Recovery
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center h-7 w-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Autonomous Agent Status Banner */}
        {!isCollapsed && (
          <div className="mx-3 my-3 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">AI Agent Active</span>
                <span className="text-[10px] text-indigo-300/80">Monitoring Webhooks</span>
              </div>
            </div>
            <Activity className="h-4 w-4 text-indigo-400 animate-pulse" />
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectTab(item.key);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/15 text-white border border-indigo-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="text-xs sm:text-sm font-medium tracking-tight whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Security & Organization Footer */}
        <div className="p-3 border-t border-fintech-border shrink-0">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="h-8 w-8 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-medium text-slate-200 truncate">Acme SaaS Corp</span>
                  <span className="text-[10px] text-slate-400">Enterprise Plan</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
