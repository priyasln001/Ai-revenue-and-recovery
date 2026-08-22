import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { NavItemKey } from '../../types';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  onSelectTab
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-fintech-bg text-slate-100 flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Layout Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-68'
        }`}
      >
        {/* Top Navigation */}
        <TopNav
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onSelectTab={onSelectTab}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Footer info bar */}
        <footer className="py-4 px-6 border-t border-fintech-border text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">RecoverAI Engine v1.4.0</span>
            <span>•</span>
            <span className="text-slate-400">Autonomous Dunning & Smart Retry Active</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">API Docs</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Security Audit</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Status Page</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
