import React, { useState } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { formatCurrency } from '../lib/calculations';
import { exportToPdf, exportBatchInvoicesToPdf, exportToImage, exportToDocx } from '../lib/exportUtils';
import { useAuth } from '../context/AuthContext';
import { InvoicePreview } from './InvoicePreview';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit3,
  Copy,
  Trash2,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  MoreVertical,
  Eye,
  FileDown,
  Layers,
  Loader2,
  X,
  Check,
  Printer,
} from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
  dailyUsageCount: number;
  onCreateInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onOpenPricing: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  invoices,
  dailyUsageCount,
  onCreateInvoice,
  onEditInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onOpenPricing,
}) => {
  const { profile, isUnlimited } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // PDF Export and selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [batchExporting, setBatchExporting] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportSinglePdf = async (inv: Invoice) => {
    setExportingId(inv.id);
    try {
      await exportToPdf(inv);
      showToast(`Invoice #${inv.invoiceNumber} exported as PDF`);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      alert(`Could not generate PDF: ${err?.message || 'Unknown error'}`);
    } finally {
      setExportingId(null);
    }
  };

  const handleExportSelected = async (mode: 'batch_combined' | 'batch_individual') => {
    const selectedInvoices = invoices.filter((i) => selectedIds.includes(i.id));
    if (selectedInvoices.length === 0) return;

    setBatchExporting(true);
    try {
      if (mode === 'batch_combined') {
        await exportBatchInvoicesToPdf(selectedInvoices);
        showToast(`${selectedInvoices.length} invoices merged into PDF document`);
      } else {
        for (const inv of selectedInvoices) {
          await exportToPdf(inv);
        }
        showToast(`Exported ${selectedInvoices.length} individual PDFs`);
      }
    } catch (err: any) {
      console.error('Batch export error:', err);
      alert('Failed to complete batch export.');
    } finally {
      setBatchExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (invoices.length === 0) return;
    setBatchExporting(true);
    try {
      await exportBatchInvoicesToPdf(invoices);
      showToast(`All ${invoices.length} invoices exported to PDF book`);
    } catch (err: any) {
      console.error('Export all error:', err);
      alert('Could not export all invoices.');
    } finally {
      setBatchExporting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map((i) => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Metrics
  const totalInvoices = invoices.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const invoicesToday = invoices.filter((inv) => inv.createdAt?.startsWith(todayStr)).length;
  const draftInvoices = invoices.filter((inv) => inv.status === 'draft').length;
  const totalBalanceDue = invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client?.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const remainingDaily = Math.max(0, 3 - dailyUsageCount);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            Sent
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            Partially Paid
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            Overdue
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl text-white shadow-xl shadow-blue-500/10">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.displayName || 'Partner'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl">
            Manage your invoices, monitor payment statuses, and keep your business moving effortlessly.
          </p>
        </div>
        <button
          onClick={onCreateInvoice}
          className="px-5 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create New Invoice
        </button>
      </div>

      {/* Metrics Row & Daily Usage Quota Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Invoices</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {totalInvoices}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Created Today</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {invoicesToday}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Draft Invoices</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {draftInvoices}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Daily Allowance / Plan Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          {isUnlimited ? (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your Allowance</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full">
                  Unlimited
                </span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Unlimited Invoices</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {profile?.plan === 'enterprise_admin' ? 'Enterprise Admin Privilege' : 'Active Pro Subscription'}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Daily Free Allowance</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {dailyUsageCount} of 3 used
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full my-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    dailyUsageCount >= 3 ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, (dailyUsageCount / 3) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">
                  {remainingDaily} invoice{remainingDaily === 1 ? '' : 's'} remaining
                </span>
                <button
                  onClick={onOpenPricing}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Upgrade ($1/mo)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoices List / Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Saved Invoices</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredInvoices.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by invoice # or client..."
                className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Export All as PDF button */}
            {filteredInvoices.length > 0 && (
              <button
                type="button"
                onClick={handleExportAll}
                disabled={batchExporting}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                title="Export all invoices as a consolidated PDF report"
              >
                {batchExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                <span>Export All (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Bulk Action Bar (Visible when invoices are checked) */}
        {selectedIds.length > 0 && (
          <div className="bg-slate-900 text-white dark:bg-slate-850 p-3.5 px-5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-semibold">{selectedIds.length} invoice{selectedIds.length === 1 ? '' : 's'} selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportSelected('batch_combined')}
                disabled={batchExporting}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-white font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                title="Combine all selected invoices into one multi-page PDF"
              >
                {batchExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
                <span>Combined PDF</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportSelected('batch_individual')}
                disabled={batchExporting}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-750 dark:hover:bg-slate-700 disabled:opacity-50 rounded-xl text-white font-medium flex items-center gap-1.5 transition-colors"
                title="Download each invoice as separate PDF file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Separate PDFs</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Invoices Table / List */}
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {searchQuery ? 'No invoices match your search' : 'No invoices created yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Try searching with a different client name or invoice number.'
                : 'Click below to create your first professional invoice in seconds.'}
            </p>
            {!searchQuery && (
              <button
                onClick={onCreateInvoice}
                className="mt-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create First Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded accent-blue-600 cursor-pointer"
                      title="Select all invoices"
                    />
                  </th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className={`transition-colors group ${
                      selectedIds.includes(inv.id)
                        ? 'bg-blue-50/60 dark:bg-blue-950/25'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inv.id)}
                        onChange={() => toggleSelect(inv.id)}
                        className="rounded accent-blue-600 cursor-pointer"
                      />
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => onEditInvoice(inv)}
                        className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        #{inv.invoiceNumber}
                      </button>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">
                      {inv.client?.clientName || 'Untitled Client'}
                    </td>

                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      {inv.issueDate}
                    </td>

                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      {inv.dueDate}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>

                    <td className="py-4 px-4">
                      {getStatusBadge(inv.status)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Quick Preview & Export"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleExportSinglePdf(inv)}
                          disabled={exportingId === inv.id}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs ${
                            exportingId === inv.id
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-950/60 dark:text-slate-200 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700'
                          }`}
                          title="Export Invoice as Professional PDF (jsPDF)"
                        >
                          {exportingId === inv.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          )}
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => onEditInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDuplicateInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Duplicate Invoice"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Invoice?</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteInvoice(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View & Export Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Invoice #{previewInvoice.invoiceNumber}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                      {previewInvoice.templateId || 'Modern'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Billed to: {previewInvoice.client.clientName || 'Client'} • Total: {formatCurrency(previewInvoice.total, previewInvoice.currency)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportSinglePdf(previewInvoice)}
                  disabled={exportingId === previewInvoice.id}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  {exportingId === previewInvoice.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Export PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const toEdit = previewInvoice;
                    setPreviewInvoice(null);
                    onEditInvoice(toEdit);
                  }}
                  className="hidden sm:flex px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewInvoice(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Preview Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-950/60">
              <div className="max-w-3xl mx-auto shadow-lg rounded-2xl overflow-hidden">
                <InvoicePreview invoice={previewInvoice} containerId="dashboard-preview-modal-container" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
