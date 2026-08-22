import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  CreditCard,
  Sparkles,
  Phone,
  Mail,
  Building
} from 'lucide-react';
import { CUSTOMERS_DATA, Customer } from '../../data/customers';
import { INVOICES_DATA, Invoice } from '../../data/invoices';
import { TRANSACTIONS_DATA, Transaction } from '../../data/transactions';
import { useRecovery } from '../../context/RecoveryContext';
import { generateAiRecommendation } from '../../utils/searchUtils';

export const CustomersView: React.FC = () => {
  const { opportunities, addAuditLogEntry, updateOpportunityStatusAndAction } = useRecovery();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditingAction, setIsEditingAction] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('Send Reminder');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCustomer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredCustomers = useMemo(() => {
    return CUSTOMERS_DATA.filter((customer) => {
      if (riskFilter !== 'all' && customer.riskLevel !== riskFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = customer.name.toLowerCase().includes(q);
        const matchesCompany = customer.company.toLowerCase().includes(q);
        const matchesId = customer.id.toLowerCase().includes(q);
        const matchesEmail = customer.email.toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesId && !matchesEmail) return false;
      }
      return true;
    });
  }, [searchQuery, riskFilter]);

  // Helper to cross-reference recovery context status & amounts for a customer company
  const getCustomerRecoveryContext = (company: string, customerId: string) => {
    const matchedOpp = opportunities.find(
      (o) => o.customer === company || o.customer.includes(company)
    );
    if (!matchedOpp) {
      return {
        status: 'Good Standing',
        amountAtRisk: '₹0',
        recoveredAmount: '₹0',
        action: 'None Needed',
      };
    }
    return {
      status: matchedOpp.status,
      amountAtRisk: matchedOpp.status === 'Recovered' ? '₹0' : matchedOpp.amountAtRisk,
      recoveredAmount: matchedOpp.status === 'Recovered' ? matchedOpp.amountAtRisk : '₹0',
      action: matchedOpp.recommendedAction,
    };
  };

  // Selected customer relational data
  const customerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return INVOICES_DATA.filter((inv) => inv.customerId === selectedCustomer.id);
  }, [selectedCustomer]);

  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return TRANSACTIONS_DATA.filter((t) => t.customerId === selectedCustomer.id);
  }, [selectedCustomer]);

  const selectedOpp = useMemo(() => {
    if (!selectedCustomer) return null;
    return (
      opportunities.find(
        (o) =>
          o.customer === selectedCustomer.company ||
          o.customer.includes(selectedCustomer.name) ||
          o.customer.includes(selectedCustomer.company)
      ) || null
    );
  }, [selectedCustomer, opportunities]);

  const currentRecommendation = useMemo(() => {
    if (!selectedCustomer) return null;
    const inv = customerInvoices[0];
    const amount = inv ? inv.amount : 50000;
    const overdue = inv ? inv.daysOverdue : 5;
    const status = inv ? inv.status : 'overdue';
    return generateAiRecommendation(amount, overdue, status, selectedCustomer.riskLevel);
  }, [selectedCustomer, customerInvoices]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-950/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-400" />
              Customer Payment Health & Accounts
            </h2>
            <p className="text-sm text-slate-300">
              Subscriber risk profiles, lifetime value, payment failure history, and active recovery statuses.
            </p>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <span>Total Accounts: {CUSTOMERS_DATA.length}</span>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name, company, email, or ID (e.g. CUST-1001)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Risk Filter:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Levels</option>
              <option value="high" className="bg-slate-900">High Risk</option>
              <option value="medium" className="bg-slate-900">Medium Risk</option>
              <option value="low" className="bg-slate-900">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Customer & ID</th>
                <th className="py-3.5 px-5">Company / Type</th>
                <th className="py-3.5 px-5">Payment History</th>
                <th className="py-3.5 px-5">Lifetime Value</th>
                <th className="py-3.5 px-5">Recovery Status</th>
                <th className="py-3.5 px-5">Amount at Risk</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cus) => {
                  const ctx = getCustomerRecoveryContext(cus.company, cus.id);
                  return (
                    <tr key={cus.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{cus.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{cus.id} • {cus.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200">{cus.company}</span>
                          <span className="text-[10px] text-indigo-300 font-mono">{cus.customerType}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono text-slate-300">
                          {cus.successfulPayments} / {cus.totalTransactions} Settled ({cus.failedPayments} Failed)
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-emerald-400">
                        ₹{cus.lifetimeValue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] border ${
                            ctx.status === 'Recovered'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : ctx.status === 'Escalated'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : ctx.status === 'In Progress' || ctx.status === 'New'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {ctx.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-rose-400">
                        {ctx.amountAtRisk}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setSelectedCustomer(cus)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customers found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Full Detail Relational Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
          <div className="glass-card w-full max-w-3xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold font-mono">
                  {selectedCustomer.id.slice(-4)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{selectedCustomer.name}</h3>
                    <span className="font-mono text-xs text-indigo-300 font-bold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800">
                      {selectedCustomer.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedCustomer.company} • {selectedCustomer.customerType} Profile
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {toastMessage && (
                <div className="p-3.5 rounded-xl bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 flex items-center justify-between space-x-3 shadow-lg">
                  <span className="font-semibold text-xs">{toastMessage}</span>
                  <button
                    onClick={() => setToastMessage(null)}
                    className="text-indigo-400 hover:text-white text-xs font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Complete Relational Summary Chain */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between font-mono text-[11px] gap-2">
                <span className="text-indigo-300 font-bold">{selectedCustomer.id}</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <span className="text-white font-bold">
                  {customerInvoices.length > 0
                    ? `${customerInvoices.length} Invoices (${customerInvoices[0].id})`
                    : 'No Invoice'}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <span className="text-rose-400 font-bold">
                  {customerTransactions.length > 0
                    ? `${customerTransactions.length} Transactions`
                    : 'No Txn'}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <span className="text-emerald-400 font-bold">
                  {selectedOpp ? selectedOpp.status : 'Good Standing'}
                </span>
              </div>

              {/* Core Demographic Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Lifetime Value</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    ₹{selectedCustomer.lifetimeValue.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Payment Risk</span>
                  <span
                    className={`font-bold text-xs capitalize ${
                      selectedCustomer.riskLevel === 'high'
                        ? 'text-rose-400'
                        : selectedCustomer.riskLevel === 'medium'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedCustomer.riskLevel.toUpperCase()} RISK
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Settled Payments</span>
                  <span className="font-mono font-bold text-sm text-slate-200">
                    {selectedCustomer.successfulPayments} / {selectedCustomer.totalTransactions}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Failed Attempts</span>
                  <span className="font-mono font-bold text-sm text-rose-400">
                    {selectedCustomer.failedPayments} Failed
                  </span>
                </div>
              </div>

              {/* Contact Information & Metadata Bar */}
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-slate-300 font-mono text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Phone className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500">Joined: {selectedCustomer.joinedDate}</span>
                </div>
              </div>

              {/* Step 9 & 10 AI Recovery Recommendation Card */}
              {currentRecommendation && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/50 border border-indigo-500/30 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                      AI Recovery Recommendation
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-200 border border-indigo-700/50">
                      {currentRecommendation.confidence}% Confidence
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-medium">Recommended Action:</span>
                      <span className="font-bold text-amber-300 bg-amber-950/70 px-2.5 py-0.5 rounded border border-amber-800/60 font-mono text-xs">
                        {currentRecommendation.action}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block text-[11px]">Reason:</span>
                      <p className="text-xs text-indigo-200/90 font-medium bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-800/30 italic leading-relaxed">
                        "{currentRecommendation.reason}"
                      </p>
                    </div>
                  </div>

                  {/* Inline Action Edit Selector */}
                  {isEditingAction && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-indigo-500/40 space-y-2.5 text-xs animate-in fade-in">
                      <label className="block font-semibold text-slate-200">
                        Select Alternate Recovery Action:
                      </label>
                      <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        <option value="Send Reminder">Send Reminder</option>
                        <option value="Send Email">Send Email</option>
                        <option value="Call Customer">Call Customer</option>
                        <option value="Offer Payment Plan">Offer Payment Plan</option>
                        <option value="Escalate Case">Escalate Case</option>
                        <option value="Mark as High Priority">Mark as High Priority</option>
                      </select>
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={() => setIsEditingAction(false)}
                          className="px-3 py-1 text-slate-400 hover:text-white rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (selectedOpp) {
                              updateOpportunityStatusAndAction(
                                selectedOpp.id,
                                'Action Accepted',
                                selectedAction
                              );
                            }
                            addAuditLogEntry({
                              event: 'AI Action Override',
                              details: `Customer ${selectedCustomer.name} recovery action updated to "${selectedAction}".`,
                              performedBy: 'RevOps Lead (Manual Override)',
                              type: 'user',
                              customer: selectedCustomer.name,
                              issue: 'Customer Health Review',
                              actionTaken: selectedAction,
                              amount: `₹${selectedCustomer.lifetimeValue.toLocaleString('en-IN')}`,
                              previousStatus: selectedOpp?.status || 'New',
                              newStatus: 'Action Accepted',
                              result: 'Successful',
                            });
                            setIsEditingAction(false);
                            setToastMessage(`Action updated to "${selectedAction}" and saved!`);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-sm"
                        >
                          Save Action
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!isEditingAction && (
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => {
                          if (selectedOpp) {
                            updateOpportunityStatusAndAction(
                              selectedOpp.id,
                              'Action Accepted',
                              currentRecommendation.action
                            );
                          }
                          addAuditLogEntry({
                            event: 'AI Recommendation Accepted',
                            details: `Action "${currentRecommendation.action}" accepted for Customer ${selectedCustomer.name}.`,
                            performedBy: 'RevOps Lead (Manual Approval)',
                            type: 'user',
                            customer: selectedCustomer.name,
                            issue: 'Customer Health Review',
                            actionTaken: currentRecommendation.action,
                            amount: `₹${selectedCustomer.lifetimeValue.toLocaleString('en-IN')}`,
                            previousStatus: selectedOpp?.status || 'New',
                            newStatus: 'Action Accepted',
                            result: 'Successful',
                          });
                          setToastMessage(`Recommendation "${currentRecommendation.action}" Accepted!`);
                        }}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Accept Recommendation</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAction(currentRecommendation.action);
                          setIsEditingAction(true);
                        }}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-semibold rounded-xl transition-all"
                      >
                        Edit Action
                      </button>

                      <button
                        onClick={() => {
                          if (selectedOpp) {
                            updateOpportunityStatusAndAction(selectedOpp.id, 'Dismissed');
                          }
                          addAuditLogEntry({
                            event: 'AI Recommendation Dismissed',
                            details: `Recommendation for Customer ${selectedCustomer.name} dismissed by RevOps lead.`,
                            performedBy: 'RevOps Lead',
                            type: 'user',
                            customer: selectedCustomer.name,
                            issue: 'Customer Health Review',
                            actionTaken: 'Dismissed',
                            amount: `₹${selectedCustomer.lifetimeValue.toLocaleString('en-IN')}`,
                            previousStatus: selectedOpp?.status || 'New',
                            newStatus: 'Dismissed',
                            result: 'Failed',
                          });
                          setToastMessage('Recommendation Dismissed.');
                        }}
                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-medium rounded-xl transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Related Invoices Section */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Connected Billing Invoices
                </span>
                {customerInvoices.length > 0 ? (
                  <div className="space-y-2">
                    {customerInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                          <div>
                            <span className="font-mono font-bold text-white block">{inv.id}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Due: {inv.dueDate} {inv.daysOverdue > 0 && `(${inv.daysOverdue}d overdue)`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-rose-400">
                            ₹{inv.amount.toLocaleString('en-IN')}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              inv.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : inv.status === 'overdue'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {inv.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 font-mono text-xs">
                    No invoice recorded
                  </div>
                )}
              </div>

              {/* Related Transactions Section */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Connected Gateway Transactions
                </span>
                {customerTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {customerTransactions.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-4 w-4 text-indigo-400 shrink-0" />
                          <div>
                            <span className="font-mono font-bold text-white block">{t.id}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {t.gateway || 'Razorpay'} • {t.paymentMethod.toUpperCase()} • {t.createdAt.slice(0, 10)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-rose-400">
                            ₹{t.amount.toLocaleString('en-IN')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.status === 'success'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : t.status === 'failed'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 font-mono text-xs">
                    No transaction recorded
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
