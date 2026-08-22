import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  Globe,
  RefreshCw,
  Check,
  User,
  Shield,
  LogOut,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { NavItemKey } from '../../types';
import { useRecovery } from '../../context/RecoveryContext';
import {
  searchCustomerOrInvoice,
  SearchResultItem,
  DEMO_SEARCH_IDS,
  RecommendationAction
} from '../../utils/searchUtils';

interface TopNavProps {
  activeTab: NavItemKey;
  onOpenMobileSidebar: () => void;
  onSelectTab?: (tab: NavItemKey) => void;
}

const pageTitles: Record<NavItemKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Revenue Recovery Dashboard', subtitle: 'Real-time involuntary churn monitoring & AI recovery performance' },
  opportunities: { title: 'Recovery Opportunities', subtitle: 'High-value failed invoices prioritized for smart dunning' },
  agent: { title: 'Agent Control Center', subtitle: 'Configure autonomous retry rules, payment routing, and dunning triggers' },
  customers: { title: 'Customer Health & Accounts', subtitle: 'Manage subscriber payment risk, card update history, and recovery journeys' },
  transactions: { title: 'Transaction Stream', subtitle: 'Live record of gateway charge attempts, retries, and success logs' },
  invoices: { title: 'Invoice Center', subtitle: 'View failed invoice schedules, past due balances, and smart links' },
  audit: { title: 'Audit Trail & Compliance', subtitle: 'Immutable log of AI agent actions, email communications, and manual overrides' },
  analytics: { title: 'Recovery Performance Analytics', subtitle: 'Deep dive metrics into failure reasons, bin routing, and cohort recovery rates' },
  settings: { title: 'System & Gateway Settings', subtitle: 'Manage payment gateway API keys, webhook webhooks, and team roles' },
};

export const TopNav: React.FC<TopNavProps> = ({ activeTab, onOpenMobileSidebar, onSelectTab }) => {
  const currentView = pageTitles[activeTab] || { title: 'RecoverAI', subtitle: 'AI Revenue Recovery Platform' };
  const { addAuditLogEntry } = useRecovery();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedRecently, setSyncedRecently] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Search State (Step 8 & 9)
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResultItem | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Recommendation Workflow State (Step 9)
  const [recommendationStatus, setRecommendationStatus] = useState<'idle' | 'accepted' | 'dismissed' | 'edited'>('idle');
  const [selectedAction, setSelectedAction] = useState<RecommendationAction | null>(null);
  const [isEditingAction, setIsEditingAction] = useState(false);
  const [tempSelectedAction, setTempSelectedAction] = useState<RecommendationAction>('Send Email');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSyncWebhooks = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncedRecently(true);
      setTimeout(() => setSyncedRecently(false), 3000);
    }, 1200);
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResult(null);
      setHasSearched(false);
      setShowSearchModal(false);
      return;
    }

    const result = searchCustomerOrInvoice(query);
    setSearchResult(result);
    setHasSearched(true);
    setShowSearchModal(true);
    // Reset recommendation state for new search
    setRecommendationStatus('idle');
    setSelectedAction(null);
    setIsEditingAction(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(globalSearch);
  };

  const handleSelectDemoId = (demoId: string) => {
    setGlobalSearch(demoId);
    executeSearch(demoId);
  };

  const handleAcceptRecommendation = () => {
    if (!searchResult) return;
    const actionTaken = selectedAction || searchResult.recommendation.action;
    setRecommendationStatus('accepted');

    addAuditLogEntry({
      event: 'AI Recommendation Accepted',
      details: `Action "${actionTaken}" accepted for ${searchResult.customerName} (${searchResult.customerId}). Reason: ${searchResult.recommendation.reason}`,
      performedBy: 'RevOps Lead (Manual Approval)',
      type: 'user',
      customer: searchResult.customerName,
      issue: 'Recovery Recommendation',
      actionTaken: actionTaken,
      amount: searchResult.invoiceAmount,
      previousStatus: searchResult.recoveryStatus,
      newStatus: 'In Progress',
      result: 'Successful',
    });
  };

  const handleSaveEditedAction = () => {
    if (!searchResult) return;
    setSelectedAction(tempSelectedAction);
    setIsEditingAction(false);
    setRecommendationStatus('edited');

    addAuditLogEntry({
      event: 'AI Action Override',
      details: `Recovery Action updated to "${tempSelectedAction}" for ${searchResult.customerName} (${searchResult.customerId}).`,
      performedBy: 'RevOps Lead (Manual Override)',
      type: 'user',
      customer: searchResult.customerName,
      issue: 'Recovery Recommendation',
      actionTaken: tempSelectedAction,
      amount: searchResult.invoiceAmount,
      previousStatus: searchResult.recoveryStatus,
      newStatus: 'In Progress',
      result: 'Successful',
    });
  };

  const handleDismissRecommendation = () => {
    setRecommendationStatus('dismissed');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-fintech-panel/90 backdrop-blur-md border-b border-fintech-border px-4 lg:px-8 flex items-center justify-between transition-all">
      {/* Left side: Mobile menu & Page Title */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-base lg:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {currentView.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-400 truncate max-w-md">
            {currentView.subtitle}
          </p>
        </div>
      </div>

      {/* Right side: Global Search, AI Agent Badge, Notifications, User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4 relative">
        {/* Global Search Bar (Step 8) */}
        <div ref={searchContainerRef} className="relative w-56 lg:w-80">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (e.target.value.trim() === '') {
                  setShowSearchModal(false);
                  setHasSearched(false);
                }
              }}
              onFocus={() => {
                if (globalSearch.trim()) {
                  setShowSearchModal(true);
                }
              }}
              placeholder="Search Customer ID or Invoice ID..."
              className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-900/90 text-slate-200 placeholder-slate-500 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            <button
              type="submit"
              className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-indigo-400 transition-colors"
              title="Submit Search"
            >
              <Search className="h-3 w-3" />
            </button>
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700 pointer-events-none">
              ⌘K
            </kbd>
          </form>

          {/* Search Result Overlay / Modal (Step 8) */}
          {showSearchModal && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    Search Result
                  </span>
                </div>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Demo IDs Hint Tags (Step 8 Requirement 12) */}
              <div className="mb-3.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                <p className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Demo IDs (Click to test):</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DEMO_SEARCH_IDS.map((id) => (
                    <button
                      key={id}
                      onClick={() => handleSelectDemoId(id)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                        globalSearch.trim().toUpperCase() === id
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                          : 'bg-slate-900 text-indigo-300 border-slate-700 hover:bg-slate-800 hover:border-indigo-500/50'
                      }`}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Result Content (Step 8 Requirements 7 & 8) */}
              {searchResult ? (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {searchResult.customerName}
                      </h4>
                      <p className="text-[11px] font-mono text-indigo-400 mt-0.5">
                        Customer ID: {searchResult.customerId}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        searchResult.paymentStatus === 'Paid'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : searchResult.paymentStatus === 'Overdue'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800'
                      }`}
                    >
                      {searchResult.paymentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Invoice ID</span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {searchResult.invoiceId}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Invoice Amount</span>
                      <span className="font-semibold text-emerald-400">
                        {searchResult.invoiceAmount}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Due Date</span>
                      <span className="text-slate-200 font-medium">{searchResult.dueDate}</span>
                    </div>

                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Days Overdue</span>
                      <span
                        className={`font-semibold ${
                          searchResult.daysOverdue > 0
                            ? 'text-rose-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {searchResult.daysOverdue} days
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">Recovery Status:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        searchResult.recoveryStatus === 'Recovered'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : searchResult.recoveryStatus === 'In Progress'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : searchResult.recoveryStatus === 'Escalated'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}
                    >
                      {searchResult.recoveryStatus}
                    </span>
                  </div>

                  {/* Connected Transactions List */}
                  <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Related Transactions
                    </span>
                    {searchResult.relatedTransactions && searchResult.relatedTransactions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {searchResult.relatedTransactions.map((t) => (
                          <span
                            key={t.id}
                            className={`font-mono text-[10px] px-2 py-0.5 rounded border font-semibold ${
                              t.status === 'success'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                : t.status === 'failed'
                                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                                : 'bg-amber-950/60 text-amber-300 border-amber-800'
                            }`}
                          >
                            {t.id} ({t.status})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic font-mono">
                        No transaction recorded
                      </span>
                    )}
                  </div>

                  {/* Step 9 — AI Recovery Recommendation Card */}
                  {recommendationStatus !== 'dismissed' && (
                    <div className="pt-2 border-t border-indigo-500/20 space-y-2.5">
                      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/60 p-3 rounded-xl border border-indigo-500/30 space-y-2 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                            <span>AI Recovery Recommendation</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-200 border border-indigo-700/50">
                            {searchResult.recommendation.confidence}% Confidence
                          </span>
                        </div>

                        {/* Recommendation Details */}
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 text-[10px]">Recommended Action:</span>
                            <span className="font-bold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/60 font-mono text-[11px]">
                              {selectedAction || searchResult.recommendation.action}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-relaxed italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                            "{searchResult.recommendation.reason}"
                          </p>
                        </div>

                        {/* Edit Action Inline Selector */}
                        {isEditingAction && (
                          <div className="p-2 bg-slate-900 rounded-lg border border-indigo-500/40 space-y-2 text-[11px]">
                            <label className="block text-[10px] font-semibold text-slate-300">
                              Select Alternate Recovery Action:
                            </label>
                            <select
                              value={tempSelectedAction}
                              onChange={(e) => setTempSelectedAction(e.target.value as RecommendationAction)}
                              className="w-full bg-slate-950 text-slate-200 p-1.5 rounded-lg border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                            >
                              <option value="Send Reminder">Send Reminder</option>
                              <option value="Send Email">Send Email</option>
                              <option value="Call Customer">Call Customer</option>
                              <option value="Offer Payment Plan">Offer Payment Plan</option>
                              <option value="Escalate Case">Escalate Case</option>
                              <option value="Mark as High Priority">Mark as High Priority</option>
                            </select>
                            <div className="flex items-center justify-end gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => setIsEditingAction(false)}
                                className="px-2 py-1 text-[10px] text-slate-400 hover:text-white rounded"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEditedAction}
                                className="px-2.5 py-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-md"
                              >
                                Save Action
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Confirmation Toast Statuses */}
                        {recommendationStatus === 'accepted' && (
                          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[10px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>Action Accepted & Logged to Audit Trail!</span>
                          </div>
                        )}

                        {recommendationStatus === 'edited' && (
                          <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-[10px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                            <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span>Custom Action Saved & Logged to Audit Trail!</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {recommendationStatus === 'idle' && !isEditingAction && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={handleAcceptRecommendation}
                              className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1"
                            >
                              <Check className="h-3 w-3" />
                              <span>Accept</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTempSelectedAction(selectedAction || searchResult.recommendation.action);
                                setIsEditingAction(true);
                              }}
                              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-semibold text-[10px] rounded-lg transition-all"
                            >
                              Edit Action
                            </button>
                            <button
                              type="button"
                              onClick={handleDismissRecommendation}
                              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-medium text-[10px] rounded-lg transition-all"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {recommendationStatus === 'dismissed' && (
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Recommendation dismissed for this session.</span>
                      <button
                        onClick={() => setRecommendationStatus('idle')}
                        className="text-indigo-400 hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    </div>
                  )}

                  {/* Navigation Links for End-to-End Workflow */}
                  {onSelectTab && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Jump to View:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSearchModal(false);
                            onSelectTab('invoices');
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold"
                        >
                          Invoices
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSearchModal(false);
                            onSelectTab('audit');
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold"
                        >
                          Audit Trail
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSearchModal(false);
                            onSelectTab('analytics');
                          }}
                          className="px-2 py-1 rounded bg-indigo-950 border border-indigo-700/50 text-indigo-200 font-semibold"
                        >
                          Analytics
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : hasSearched ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-rose-950 text-center space-y-2">
                  <AlertCircle className="h-6 w-6 text-rose-400 mx-auto" />
                  <p className="text-xs font-semibold text-rose-300">
                    No matching customer or invoice found.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Please check the ID format or click one of the demo IDs above.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Environment Badge */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300">
          <Globe className="h-3.5 w-3.5 text-indigo-400" />
          <span>Production</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* AI Agent Mode Indicator Pill */}
        <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span className="hidden sm:inline">AI Autonomous</span>
          <span className="sm:hidden">AI</span>
        </div>

        {/* Refresh simulation indicator */}
        <button
          onClick={handleSyncWebhooks}
          disabled={isSyncing}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors relative"
          title="Sync gateway webhooks"
        >
          {syncedRecently ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-900"></span>
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded font-mono">3 New</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
                  <p className="text-slate-200 font-medium">Auto-recovered ₹1,45,000</p>
                  <p className="text-[10px] text-slate-400">Acme SaaS Corp • 12 mins ago</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
                  <p className="text-slate-200 font-medium">Smart Retry Executed</p>
                  <p className="text-[10px] text-slate-400">Stripe Gateway • 1 hour ago</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
                  <p className="text-slate-200 font-medium">New High-Priority Opportunity</p>
                  <p className="text-[10px] text-slate-400">Global FinTech Ltd • 3 hours ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white ring-2 ring-indigo-500/20">
              AV
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">Alex Vance</span>
              <span className="text-[10px] text-slate-400 leading-tight">RevOps Lead</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="font-bold text-white">Alex Vance</p>
                <p className="text-[10px] text-slate-400">alex.vance@recoversaas.io</p>
              </div>
              <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-indigo-400" />
                <span>Account Profile</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-300 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-indigo-400" />
                <span>Security & API Keys</span>
              </button>
              <div className="border-t border-slate-800 my-1"></div>
              <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 flex items-center gap-2">
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


