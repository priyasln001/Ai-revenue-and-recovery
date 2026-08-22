import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Building2,
  X,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { INVOICES_DATA, Invoice } from '../../data/invoices';
import { CUSTOMERS_DATA } from '../../data/customers';
import { TRANSACTIONS_DATA, Transaction } from '../../data/transactions';
import { useRecovery } from '../../context/RecoveryContext';
import { generateAiRecommendation } from '../../utils/searchUtils';
import { getSimpleOpportunityExplanation } from '../../utils/recoveryScoring';

export const InvoicesView: React.FC = () => {
  const { opportunities, addAuditLogEntry, updateOpportunityStatusAndAction } = useRecovery();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditingAction, setIsEditingAction] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('Send Reminder');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedInvoice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter invoices based on search query
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return INVOICES_DATA;
    const q = searchQuery.toLowerCase();
    return INVOICES_DATA.filter((inv) => {
      const customer = CUSTOMERS_DATA.find((c) => c.id === inv.customerId);
      const customerName = customer ? customer.name.toLowerCase() : '';
      const companyName = customer ? customer.company.toLowerCase() : '';
      return (
        inv.id.toLowerCase().includes(q) ||
        inv.customerId.toLowerCase().includes(q) ||
        customerName.includes(q) ||
        companyName.includes(q) ||
        inv.status.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  // Find customer details for an invoice
  const getCustomerForInvoice = (customerId: string) => {
    return CUSTOMERS_DATA.find((c) => c.id === customerId);
  };

  // Find related transactions for an invoice/customer
  const getTransactionsForInvoice = (invoiceId: string, customerId: string): Transaction[] => {
    const directTxns = TRANSACTIONS_DATA.filter((t) => t.invoiceId === invoiceId);
    if (directTxns.length > 0) return directTxns;
    return TRANSACTIONS_DATA.filter((t) => t.customerId === customerId);
  };

  // Find live recovery status from RecoveryContext
  const getRecoveryStatusForInvoice = (invoiceId: string, customerId: string) => {
    const customer = CUSTOMERS_DATA.find((c) => c.id === customerId);
    const opp = opportunities.find(
      (o) =>
        o.transactionId === invoiceId ||
        (customer && (o.customer.includes(customer.name) || o.customer.includes(customer.company)))
    );
    return opp ? opp.status : 'New';
  };

  // Selected Invoice Relational Details
  const selectedCustomer = selectedInvoice ? getCustomerForInvoice(selectedInvoice.customerId) : null;
  const selectedTransactions = selectedInvoice
    ? getTransactionsForInvoice(selectedInvoice.id, selectedInvoice.customerId)
    : [];
  const selectedOpp = selectedInvoice
    ? opportunities.find(
        (o) =>
          o.transactionId === selectedInvoice.id ||
          (selectedCustomer &&
            (o.customer.includes(selectedCustomer.name) || o.customer.includes(selectedCustomer.company)))
      )
    : null;

  const currentRecommendation = selectedInvoice
    ? generateAiRecommendation(
        selectedInvoice.amount,
        selectedInvoice.daysOverdue,
        selectedInvoice.status,
        selectedCustomer?.riskLevel || 'medium'
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-950/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-400" />
              Invoice Center & Billing Schedules
            </h2>
            <p className="text-sm text-slate-300">
              Overview of delinquent subscription invoices, past-due balances, and automated AI recovery triggers.
            </p>
          </div>
          <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>{INVOICES_DATA.length} Invoices Tracked</span>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Invoice ID (INV-10001), Customer ID (CUST-1001), Name, or Status..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Invoice ID & Due Date</th>
                <th className="py-3.5 px-5">Customer Name & ID</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Payment Status</th>
                <th className="py-3.5 px-5">Related Transactions</th>
                <th className="py-3.5 px-5 text-right">Recovery Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const customer = getCustomerForInvoice(inv.customerId);
                  const txns = getTransactionsForInvoice(inv.id, inv.customerId);
                  const recoveryStatus = getRecoveryStatusForInvoice(inv.id, inv.customerId);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-indigo-300 text-xs">{inv.id}</span>
                          <span className="text-[10px] text-slate-400">
                            Due: {inv.dueDate} {inv.daysOverdue > 0 && `(${inv.daysOverdue}d overdue)`}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">
                            {customer?.name || 'Unknown Customer'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {inv.customerId} • {customer?.company}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-rose-400 text-sm">
                        ₹{inv.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : inv.status === 'overdue'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : inv.status === 'promise_to_pay'
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {inv.status === 'paid'
                            ? 'Paid'
                            : inv.status === 'overdue'
                            ? 'Overdue'
                            : inv.status === 'promise_to_pay'
                            ? 'Promise to Pay'
                            : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        {txns.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {txns.slice(0, 2).map((t) => (
                              <span
                                key={t.id}
                                className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 font-semibold"
                              >
                                {t.id} ({t.status})
                              </span>
                            ))}
                            {txns.length > 2 && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                +{txns.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic font-mono">
                            No transaction recorded
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            recoveryStatus === 'Recovered'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : recoveryStatus === 'Action Accepted'
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                              : recoveryStatus === 'Dismissed'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {recoveryStatus}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
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
                    No invoices match your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal with Relational Tree & Step 9 AI Recommendation */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{selectedInvoice.id}</h3>
                    <span className="font-mono text-xs text-indigo-300 font-bold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800">
                      {selectedInvoice.customerId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedCustomer?.name} ({selectedCustomer?.company})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInvoice(null)}
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

              {/* Relational Summary Tree Bar */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                <span className="text-indigo-300 font-bold">{selectedInvoice.customerId}</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <span className="text-white font-bold">{selectedInvoice.id}</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <span className="text-rose-400 font-bold">
                  {selectedTransactions.length > 0 ? `${selectedTransactions.length} Txns` : 'No Txn'}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
                <span className="text-emerald-400 font-bold">
                  {selectedOpp ? selectedOpp.status : 'New'}
                </span>
              </div>

              {/* Core Invoice Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Invoice Amount</span>
                  <span className="text-base font-extrabold text-rose-400 font-mono">
                    ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Due Date</span>
                  <span className="font-mono font-bold text-sm text-slate-200">
                    {selectedInvoice.dueDate}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Days Overdue</span>
                  <span className="font-mono font-bold text-sm text-amber-300">
                    {selectedInvoice.daysOverdue} Days
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Payment Status</span>
                  <span className="font-bold text-xs capitalize text-white">
                    {selectedInvoice.status}
                  </span>
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
                              details: `Invoice ${selectedInvoice.id} recovery action updated to "${selectedAction}".`,
                              performedBy: 'RevOps Lead (Manual Override)',
                              type: 'user',
                              customer: selectedCustomer?.name || selectedInvoice.customerId,
                              issue: 'Invoice Recovery',
                              actionTaken: selectedAction,
                              amount: `₹${selectedInvoice.amount.toLocaleString('en-IN')}`,
                              previousStatus: selectedInvoice.status,
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
                            details: `Action "${currentRecommendation.action}" accepted for Invoice ${selectedInvoice.id}.`,
                            performedBy: 'RevOps Lead (Manual Approval)',
                            type: 'user',
                            customer: selectedCustomer?.name || selectedInvoice.customerId,
                            issue: 'Invoice Recovery',
                            actionTaken: currentRecommendation.action,
                            amount: `₹${selectedInvoice.amount.toLocaleString('en-IN')}`,
                            previousStatus: selectedInvoice.status,
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
                            details: `Recommendation for Invoice ${selectedInvoice.id} dismissed by RevOps lead.`,
                            performedBy: 'RevOps Lead',
                            type: 'user',
                            customer: selectedCustomer?.name || selectedInvoice.customerId,
                            issue: 'Invoice Recovery',
                            actionTaken: 'Dismissed',
                            amount: `₹${selectedInvoice.amount.toLocaleString('en-IN')}`,
                            previousStatus: selectedInvoice.status,
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

              {/* Related Transactions List Section */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Associated Gateway Transactions
                </span>
                {selectedTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTransactions.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-4 w-4 text-indigo-400 shrink-0" />
                          <div>
                            <span className="font-mono font-bold text-white block">{t.id}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {t.gateway} • Method: {t.paymentMethod.toUpperCase()} • {t.createdAt.slice(0, 10)}
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
                    No transaction recorded for this invoice.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
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
