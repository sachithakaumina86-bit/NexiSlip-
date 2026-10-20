import React, { useState, useEffect } from 'react';
import { Invoice, LineItem, InvoiceTemplateId } from '../types';
import { calculateInvoiceTotals, SUPPORTED_CURRENCIES, formatCurrency } from '../lib/calculations';
import { exportToPdf, exportToImage, exportToDocx } from '../lib/exportUtils';
import { InvoicePreview } from './InvoicePreview';
import { useAuth } from '../context/AuthContext';
import {
  Save,
  Download,
  Plus,
  Trash2,
  Sparkles,
  Printer,
  Copy,
  ArrowLeft,
  Eye,
  Edit3,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileCheck,
  FileText,
  Layout,
  Check,
} from 'lucide-react';

interface InvoiceEditorProps {
  initialInvoice?: Invoice | null;
  onSave: (invoice: Invoice) => Promise<boolean>;
  onDuplicate?: (invoice: Invoice) => void;
  onBack: () => void;
  onOpenPricing: () => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  initialInvoice,
  onSave,
  onDuplicate,
  onBack,
  onOpenPricing,
}) => {
  const { currentUser, profile, isUnlimited } = useAuth();

  // Active view tab on mobile: 'editor' or 'preview'
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Generate initial invoice number
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `NI-${year}-${randomSuffix}`;
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getDueDate = (days = 14) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const defaultInvoice: Invoice = {
    id: initialInvoice?.id || `inv_${Date.now()}`,
    ownerId: currentUser?.uid || 'guest',
    invoiceNumber: initialInvoice?.invoiceNumber || generateInvoiceNumber(),
    status: initialInvoice?.status || 'draft',
    templateId: initialInvoice?.templateId || profile?.businessProfile?.defaultTemplate || 'modern',
    currency: initialInvoice?.currency || profile?.businessProfile?.defaultCurrency || 'USD',
    issueDate: initialInvoice?.issueDate || getTodayDate(),
    dueDate: initialInvoice?.dueDate || getDueDate(14),
    purchaseOrder: initialInvoice?.purchaseOrder || '',
    paymentTerms: initialInvoice?.paymentTerms || profile?.businessProfile?.defaultTerms || 'Net 14 Days',
    documentTitle: initialInvoice?.documentTitle || 'INVOICE',

    seller: {
      businessName: initialInvoice?.seller?.businessName || profile?.businessProfile?.businessName || 'My Business',
      sellerName: initialInvoice?.seller?.sellerName || profile?.businessProfile?.sellerName || profile?.displayName || '',
      email: initialInvoice?.seller?.email || profile?.businessProfile?.email || currentUser?.email || '',
      phone: initialInvoice?.seller?.phone || profile?.businessProfile?.phone || '',
      address: initialInvoice?.seller?.address || profile?.businessProfile?.address || '',
      website: initialInvoice?.seller?.website || profile?.businessProfile?.website || '',
      taxNumber: initialInvoice?.seller?.taxNumber || profile?.businessProfile?.taxNumber || '',
      logoUrl: initialInvoice?.seller?.logoUrl || profile?.businessProfile?.logoUrl || '',
    },

    client: {
      clientName: initialInvoice?.client?.clientName || '',
      email: initialInvoice?.client?.email || '',
      phone: initialInvoice?.client?.phone || '',
      address: initialInvoice?.client?.address || '',
      taxNumber: initialInvoice?.client?.taxNumber || '',
    },

    lineItems: initialInvoice?.lineItems || [
      {
        id: '1',
        description: 'Professional Consulting Services',
        quantity: 1,
        unitPrice: 150,
        total: 150,
      },
    ],

    subtotal: initialInvoice?.subtotal || 150,
    discount: initialInvoice?.discount || 0,
    taxRate: initialInvoice?.taxRate ?? (profile?.businessProfile?.defaultTaxRate || 0),
    taxAmount: initialInvoice?.taxAmount || 0,
    extraCharges: initialInvoice?.extraCharges || 0,
    total: initialInvoice?.total || 150,
    amountPaid: initialInvoice?.amountPaid || 0,
    balanceDue: initialInvoice?.balanceDue || 150,

    notes: initialInvoice?.notes || 'Thank you for your business! Please contact us if you have any questions.',
    paymentInstructions:
      initialInvoice?.paymentInstructions ||
      'Direct Bank Transfer:\nBank: Standard Commercial\nAccount: 1234-5678-9012\nRouting: 987654321',
    termsAndConditions:
      initialInvoice?.termsAndConditions ||
      'Please pay within payment term window. Overdue payments are subject to a 1.5% monthly late fee.',

    createdAt: initialInvoice?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [invoice, setInvoice] = useState<Invoice>(defaultInvoice);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  // AI low-latency line-item suggestions state
  const [aiIndustry, setAiIndustry] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // AI Logo generator state (using gemini-nano-banana-2.1 with aspect ratios)
  const [showLogoAiModal, setShowLogoAiModal] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState('');
  const [logoAspectRatio, setLogoAspectRatio] = useState<string>('1:1');
  const [logoGenerating, setLogoGenerating] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Recalculate totals whenever items, discount, tax, charges change
  useEffect(() => {
    const totals = calculateInvoiceTotals(
      invoice.lineItems,
      invoice.discount,
      invoice.taxRate,
      invoice.extraCharges,
      invoice.amountPaid
    );

    setInvoice((prev) => ({
      ...prev,
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxAmount: totals.taxAmount,
      total: totals.total,
      balanceDue: totals.balanceDue,
    }));
  }, [
    invoice.lineItems,
    invoice.discount,
    invoice.taxRate,
    invoice.extraCharges,
    invoice.amountPaid,
  ]);

  // Line Item Handlers
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setInvoice((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }));
  };

  const handleUpdateItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...invoice.lineItems];
    const current = { ...updated[index], [field]: value };
    const qty = Number(current.quantity) || 0;
    const price = Number(current.unitPrice) || 0;
    const disc = Number(current.discount) || 0;
    current.total = Math.max(0, qty * price - disc);
    updated[index] = current;
    setInvoice((prev) => ({ ...prev, lineItems: updated }));
  };

  const handleRemoveItem = (index: number) => {
    if (invoice.lineItems.length <= 1) return;
    const updated = invoice.lineItems.filter((_, i) => i !== index);
    setInvoice((prev) => ({ ...prev, lineItems: updated }));
  };

  // Save handler with backend quota verification
  const handleSaveInvoice = async (markAsSent = false) => {
    setSaving(true);
    setQuotaError(null);
    setSaveSuccess(false);

    try {
      const invoiceToSave: Invoice = {
        ...invoice,
        status: markAsSent ? 'sent' : invoice.status,
        updatedAt: new Date().toISOString(),
      };

      const success = await onSave(invoiceToSave);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error('Save error:', err);
      if (err?.message?.includes('Daily limit reached') || err?.message?.includes('free invoices')) {
        setQuotaError(err.message);
      } else {
        setQuotaError(err?.message || 'Failed to save invoice.');
      }
    } finally {
      setSaving(false);
    }
  };

  // AI Smart Suggest Items (using low-latency gemini-3.1-flash-lite)
  const handleAiSuggestItems = async () => {
    if (!aiIndustry.trim()) return;
    setAiLoading(true);
    setAiSuccessMsg(null);
    try {
      const res = await fetch('/api/ai/suggest-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industryOrDescription: aiIndustry }),
      });
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        const newItems: LineItem[] = data.items.map((it: any, idx: number) => ({
          id: `ai_${Date.now()}_${idx}`,
          description: it.description || 'Service',
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || 100,
          total: (it.quantity || 1) * (it.unitPrice || 100),
        }));
        setInvoice((prev) => ({
          ...prev,
          lineItems: [...prev.lineItems, ...newItems],
        }));
        setAiSuccessMsg(`Added ${newItems.length} items from AI suggestions!`);
        setTimeout(() => setAiSuccessMsg(null), 3000);
      }
    } catch (e: any) {
      console.error('AI Suggestion error:', e);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Notes / Terms generator
  const handleAiGenerateNotes = async (type: 'terms' | 'reminder') => {
    try {
      const res = await fetch('/api/ai/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type === 'terms' ? 'payment terms and instructions' : 'gentle payment reminder note',
          clientName: invoice.client.clientName,
          dueDate: invoice.dueDate,
          total: invoice.total,
          currency: invoice.currency,
        }),
      });
      const data = await res.json();
      if (data.text) {
        if (type === 'terms') {
          setInvoice((prev) => ({ ...prev, paymentInstructions: data.text }));
        } else {
          setInvoice((prev) => ({ ...prev, notes: data.text }));
        }
      }
    } catch (e) {
      console.error('Error generating notes with AI:', e);
    }
  };

  // AI Logo generator (using gemini-nano-banana-2.1 with custom aspect ratio)
  const handleAiGenerateLogo = async () => {
    if (!logoPrompt.trim()) return;
    setLogoGenerating(true);
    setLogoError(null);
    try {
      const res = await fetch('/api/ai/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: logoPrompt,
          aspectRatio: logoAspectRatio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to generate image');
      }
      if (data.imageUrl) {
        setInvoice((prev) => ({
          ...prev,
          seller: { ...prev.seller, logoUrl: data.imageUrl },
        }));
        setShowLogoAiModal(false);
      }
    } catch (e: any) {
      console.error('Error generating logo:', e);
      setLogoError(e.message || 'Image generation failed');
    } finally {
      setLogoGenerating(false);
    }
  };

  // Export handlers
  const handleExport = async (format: 'pdf' | 'png' | 'jpeg' | 'docx') => {
    setExportLoading(format);
    setShowExportMenu(false);
    try {
      if (format === 'pdf') {
        await exportToPdf(invoice, 'invoice-render-container');
      } else if (format === 'png' || format === 'jpeg') {
        await exportToImage(invoice, 'invoice-render-container', format);
      } else if (format === 'docx') {
        await exportToDocx(invoice);
      }
    } catch (err: any) {
      console.error(`Export to ${format} failed:`, err);
      alert(`Export error: ${err?.message || 'Could not generate file.'}`);
    } finally {
      setExportLoading(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Invoice Editor</span>
              <span className="text-xs font-mono font-normal text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                #{invoice.invoiceNumber}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Changes reflect live in preview. Download in PDF, PNG, JPG, or DOCX.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Mobile switcher tab */}
          <div className="sm:hidden flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mr-auto">
            <button
              onClick={() => setMobileTab('editor')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 ${
                mobileTab === 'editor'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Form
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 ${
                mobileTab === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(invoice)}
              className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
              title="Duplicate Invoice"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden md:inline">Duplicate</span>
            </button>
          )}

          {/* Dedicated Download PDF Button */}
          <button
            onClick={() => handleExport('pdf')}
            disabled={Boolean(exportLoading)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            title="Generate and Download PDF (via jsPDF)"
          >
            {exportLoading === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FileText className="w-4 h-4 text-white" />
            )}
            <span>{exportLoading === 'pdf' ? 'Generating...' : 'Download PDF'}</span>
          </button>

          {/* Download More Formats Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={Boolean(exportLoading)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5"
              title="More export formats"
            >
              {exportLoading && exportLoading !== 'pdf' ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              )}
              <span>Export As</span>
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95"
                onClick={() => setShowExportMenu(false)}
              >
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Download PDF (.pdf)
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold">Vector</span>
                </button>
                <button
                  onClick={() => handleExport('png')}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    Download PNG (.png)
                  </span>
                  <span className="text-[10px] text-slate-400">High-Res</span>
                </button>
                <button
                  onClick={() => handleExport('jpeg')}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    Download JPG (.jpg)
                  </span>
                  <span className="text-[10px] text-slate-400">Compressed</span>
                </button>
                <button
                  onClick={() => handleExport('docx')}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Word Document (.docx)
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Editable</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={handlePrint}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print Invoice</span>
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={() => handleSaveInvoice(false)}
            disabled={saving}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle className="w-4 h-4 text-emerald-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Quota Error Dialog if Free Daily Limit Reached */}
      {quotaError && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                Daily Free Allowance Reached
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">{quotaError}</p>
            </div>
          </div>
          <button
            onClick={onOpenPricing}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shrink-0"
          >
            Upgrade to Pro ($1/mo)
          </button>
        </div>
      )}

      {/* Main Split Layout: Editor Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: FORM CONTROLS */}
        <div className={`lg:col-span-6 space-y-6 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* Invoice Templates Selection Feature */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layout className="w-4 h-4 text-blue-600" />
                  Invoice Templates
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose between different professional layouts for your billing slips
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                {invoice.templateId || 'modern'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'modern' as InvoiceTemplateId,
                  name: 'Modern',
                  badge: 'Popular',
                  tagline: 'Clean & Contemporary',
                  description: 'Sleek rounded cards, vibrant accents & tech-forward styling.',
                },
                {
                  id: 'minimal' as InvoiceTemplateId,
                  name: 'Minimal',
                  badge: 'Clean',
                  tagline: 'Refined Whitespace',
                  description: 'Monochrome elegance, pure typography & hairline dividers.',
                },
                {
                  id: 'classic' as InvoiceTemplateId,
                  name: 'Classic',
                  badge: 'Corporate',
                  tagline: 'Formal Ledger',
                  description: 'Structured boxed grid, dark corporate headers & sign-off.',
                },
              ].map((tpl) => {
                const isSelected =
                  invoice.templateId === tpl.id ||
                  (!invoice.templateId && tpl.id === 'modern') ||
                  (invoice.templateId === 'professional' && tpl.id === 'classic') ||
                  (invoice.templateId === 'creative' && tpl.id === 'modern');

                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setInvoice({ ...invoice, templateId: tpl.id })}
                    className={`relative p-3 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tpl.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            tpl.id === 'modern'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                              : tpl.id === 'minimal'
                              ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                          }`}
                        >
                          {tpl.badge}
                        </span>
                      </div>

                      {/* Mini Visual Schematic Preview */}
                      <div className="h-14 w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80 p-1.5 mb-2 overflow-hidden flex flex-col justify-between">
                        {tpl.id === 'modern' ? (
                          <>
                            <div className="flex justify-between items-center">
                              <div className="h-2 w-7 bg-blue-600 rounded-xs" />
                              <div className="h-1.5 w-5 bg-blue-200 dark:bg-blue-900 rounded-xs" />
                            </div>
                            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-xs flex items-center px-1">
                              <div className="h-1 w-10 bg-slate-300 dark:bg-slate-600 rounded-xs" />
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="h-1.5 w-8 bg-slate-200 dark:bg-slate-700 rounded-xs" />
                              <div className="h-2 w-5 bg-blue-500 rounded-xs" />
                            </div>
                          </>
                        ) : tpl.id === 'minimal' ? (
                          <>
                            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-0.5">
                              <div className="h-1.5 w-6 bg-slate-800 dark:bg-slate-200" />
                              <div className="h-1 w-4 bg-slate-400" />
                            </div>
                            <div className="flex justify-between py-0.5">
                              <div className="h-1 w-7 bg-slate-300 dark:bg-slate-600" />
                              <div className="h-1 w-5 bg-slate-300 dark:bg-slate-600" />
                            </div>
                            <div className="border-t border-slate-900 dark:border-slate-200 pt-0.5 flex justify-end">
                              <div className="h-1.5 w-6 bg-slate-900 dark:bg-slate-100" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="h-1.5 w-full bg-slate-800 dark:bg-slate-300 mb-0.5" />
                            <div className="grid grid-cols-2 gap-1 my-0.5">
                              <div className="h-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                              <div className="h-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                            </div>
                            <div className="h-2 border-b-2 border-double border-slate-900 dark:border-slate-300 flex justify-end">
                              <div className="h-1 w-5 bg-slate-800 dark:bg-slate-200" />
                            </div>
                          </>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 dark:text-slate-500 font-medium">
                        {tpl.tagline}
                      </span>
                      {isSelected ? (
                        <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
                          <Check className="w-3.5 h-3.5" />
                          Selected
                        </span>
                      ) : (
                        <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                          Use Layout
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata Card: Doc Title, Number, Currency, Dates */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              General Invoice Details
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={invoice.documentTitle}
                  onChange={(e) => setInvoice({ ...invoice, documentTitle: e.target.value })}
                  placeholder="INVOICE"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Currency
                </label>
                <select
                  value={invoice.currency}
                  onChange={(e) => setInvoice({ ...invoice, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                    <option key={code} value={code}>
                      {info.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Payment Status
                </label>
                <select
                  value={invoice.status}
                  onChange={(e) => setInvoice({ ...invoice, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seller / Business Details */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Seller / Your Business Details
              </h3>
              {/* AI Logo Generator Trigger */}
              <button
                type="button"
                onClick={() => setShowLogoAiModal(true)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Logo / Stamp
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Business / Agency Name
                </label>
                <input
                  type="text"
                  value={invoice.seller.businessName}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      seller: { ...invoice.seller, businessName: e.target.value },
                    })
                  }
                  placeholder="Apex Studio Ltd."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Seller / Owner Name
                </label>
                <input
                  type="text"
                  value={invoice.seller.sellerName}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      seller: { ...invoice.seller, sellerName: e.target.value },
                    })
                  }
                  placeholder="Alex Morgan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={invoice.seller.email}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      seller: { ...invoice.seller, email: e.target.value },
                    })
                  }
                  placeholder="billing@apexstudio.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={invoice.seller.phone}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      seller: { ...invoice.seller, phone: e.target.value },
                    })
                  }
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Business Address
                </label>
                <input
                  type="text"
                  value={invoice.seller.address}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      seller: { ...invoice.seller, address: e.target.value },
                    })
                  }
                  placeholder="100 Market Street, Suite 400, San Francisco, CA"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tax Registration Number
                </label>
                <input
                  type="text"
                  value={invoice.seller.taxNumber || ''}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      seller: { ...invoice.seller, taxNumber: e.target.value },
                    })
                  }
                  placeholder="US-EIN 12-3456789"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Logo URL (or use AI Generator)
                </label>
                <input
                  type="text"
                  value={invoice.seller.logoUrl || ''}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      seller: { ...invoice.seller, logoUrl: e.target.value },
                    })
                  }
                  placeholder="https://... or data:image..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Billed To / Client Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Client or Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={invoice.client.clientName}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, clientName: e.target.value },
                    })
                  }
                  placeholder="Acme Corporation"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={invoice.client.email}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, email: e.target.value },
                    })
                  }
                  placeholder="accounts@acme.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Client Phone
                </label>
                <input
                  type="text"
                  value={invoice.client.phone || ''}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, phone: e.target.value },
                    })
                  }
                  placeholder="+1 (555) 345-6789"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Client Tax ID
                </label>
                <input
                  type="text"
                  value={invoice.client.taxNumber || ''}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, taxNumber: e.target.value },
                    })
                  }
                  placeholder="VAT/GST/EIN"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Client Billing Address
                </label>
                <input
                  type="text"
                  value={invoice.client.address}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      client: { ...invoice.client, address: e.target.value },
                    })
                  }
                  placeholder="500 Broadway, 12th Floor, New York, NY 10012"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Line Items Editor with AI Assistant (gemini-3.1-flash-lite) */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Line Items & Services
              </h3>

              {/* AI Suggestion Bar (gemini-3.1-flash-lite) */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={aiIndustry}
                  onChange={(e) => setAiIndustry(e.target.value)}
                  placeholder="E.g. Web Design, Photography..."
                  className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white w-44 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAiSuggestItems}
                  disabled={aiLoading || !aiIndustry.trim()}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>AI Suggest</span>
                </button>
              </div>
            </div>

            {aiSuccessMsg && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {aiSuccessMsg}
              </p>
            )}

            {/* Items List */}
            <div className="space-y-3">
              {invoice.lineItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                        placeholder="Item description or service..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={invoice.lineItems.length <= 1}
                      className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Unit Price</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Line Total</label>
                      <div className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold">
                        {formatCurrency(item.total, invoice.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Line Item
            </button>
          </div>

          {/* Calculations & Discounts */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Taxes, Discounts & Totals
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={invoice.taxRate}
                  onChange={(e) =>
                    setInvoice({ ...invoice, taxRate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Discount ({SUPPORTED_CURRENCIES[invoice.currency]?.symbol || '$'})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={invoice.discount}
                  onChange={(e) =>
                    setInvoice({ ...invoice, discount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Shipping / Extra
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={invoice.extraCharges}
                  onChange={(e) =>
                    setInvoice({ ...invoice, extraCharges: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Amount Paid
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={invoice.amountPaid}
                  onChange={(e) =>
                    setInvoice({ ...invoice, amountPaid: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">Calculated Total:</span>
              <span className="font-mono text-base font-extrabold text-blue-600 dark:text-blue-400">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
          </div>

          {/* Payment Instructions & Notes with AI Generator */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Payment Instructions & Notes
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAiGenerateNotes('terms')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> AI Terms
                </button>
                <button
                  type="button"
                  onClick={() => handleAiGenerateNotes('reminder')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> AI Note
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Payment Instructions (Bank details, wire info, PayPal, Stripe link)
                </label>
                <textarea
                  rows={3}
                  value={invoice.paymentInstructions || ''}
                  onChange={(e) => setInvoice({ ...invoice, paymentInstructions: e.target.value })}
                  placeholder="Payment methods, account numbers..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Customer Notes
                </label>
                <textarea
                  rows={2}
                  value={invoice.notes || ''}
                  onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                  placeholder="Thank you message or project reference..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  rows={2}
                  value={invoice.termsAndConditions || ''}
                  onChange={(e) => setInvoice({ ...invoice, termsAndConditions: e.target.value })}
                  placeholder="Legal disclaimers, late payment policies..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE INVOICE PREVIEW */}
        <div className={`lg:col-span-6 sticky top-24 ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Live Preview
              </span>
              {/* Quick Template Switcher Tabs */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                {(['modern', 'minimal', 'classic'] as const).map((tId) => {
                  const isActive =
                    invoice.templateId === tId ||
                    (!invoice.templateId && tId === 'modern') ||
                    (invoice.templateId === 'professional' && tId === 'classic') ||
                    (invoice.templateId === 'creative' && tId === 'modern');

                  return (
                    <button
                      key={tId}
                      type="button"
                      onClick={() => setInvoice({ ...invoice, templateId: tId })}
                      className={`px-2 py-0.5 rounded-md capitalize font-medium transition-all ${
                        isActive
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tId}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                disabled={Boolean(exportLoading)}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                title="Download PDF version of invoice"
              >
                {exportLoading === 'pdf' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-xl transition-all">
            <InvoicePreview invoice={invoice} containerId="invoice-render-container" />
          </div>
        </div>
      </div>

      {/* AI Logo Generator Modal (gemini-nano-banana-2.1 with Aspect Ratio Selection) */}
      {showLogoAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Generate Brand Logo / Seal
              </h3>
              <button
                type="button"
                onClick={() => setShowLogoAiModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create a custom vector-style business logo or official invoice seal using{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">gemini-nano-banana-2.1</span>.
            </p>

            {logoError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                {logoError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Logo / Brand Prompt
                </label>
                <input
                  type="text"
                  value={logoPrompt}
                  onChange={(e) => setLogoPrompt(e.target.value)}
                  placeholder="E.g. Modern minimalist geometric crest for Nexi Technologies"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Aspect Ratio (gemini-nano-banana-2.1)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setLogoAspectRatio(ratio)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        logoAspectRatio === ratio
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoAiModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAiGenerateLogo}
                disabled={logoGenerating || !logoPrompt.trim()}
                className="flex-1 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                {logoGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{logoGenerating ? 'Generating...' : 'Generate Logo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
