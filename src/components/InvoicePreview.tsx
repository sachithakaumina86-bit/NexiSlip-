import React from 'react';
import { Invoice } from '../types';
import { formatCurrency } from '../lib/calculations';
import { Building2, CheckCircle2 } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
  containerId?: string;
  isPrintMode?: boolean;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  containerId = 'invoice-render-container',
  isPrintMode = false,
}) => {
  // Normalize template selection
  const rawTemplate = invoice.templateId || 'modern';
  const template: 'modern' | 'minimal' | 'classic' =
    rawTemplate === 'minimal'
      ? 'minimal'
      : rawTemplate === 'classic' || rawTemplate === 'professional'
      ? 'classic'
      : 'modern';

  const getStatusBadge = () => {
    if (template === 'minimal') {
      const colors: Record<string, string> = {
        paid: 'text-emerald-700 border-emerald-400 bg-emerald-50/50',
        sent: 'text-blue-700 border-blue-400 bg-blue-50/50',
        partially_paid: 'text-amber-700 border-amber-400 bg-amber-50/50',
        overdue: 'text-rose-700 border-rose-400 bg-rose-50/50',
        cancelled: 'text-slate-500 border-slate-300 bg-slate-50',
        draft: 'text-slate-600 border-slate-300 bg-slate-50',
      };
      const label = invoice.status.replace('_', ' ');
      return (
        <span
          className={`px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase border ${
            colors[invoice.status] || colors.draft
          }`}
        >
          {label}
        </span>
      );
    }

    if (template === 'classic') {
      const borderColors: Record<string, string> = {
        paid: 'border-emerald-600 text-emerald-800 bg-emerald-50',
        sent: 'border-blue-700 text-blue-900 bg-blue-50',
        partially_paid: 'border-amber-600 text-amber-900 bg-amber-50',
        overdue: 'border-red-700 text-red-900 bg-red-50',
        cancelled: 'border-slate-500 text-slate-700 bg-slate-100',
        draft: 'border-slate-400 text-slate-800 bg-slate-100',
      };
      const label = invoice.status.replace('_', ' ');
      return (
        <span
          className={`px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider border-2 ${
            borderColors[invoice.status] || borderColors.draft
          }`}
        >
          {label}
        </span>
      );
    }

    // Modern status badge
    switch (invoice.status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
            Sent
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            Partially Paid
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
            Overdue
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-700 border border-slate-300">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
            Draft
          </span>
        );
    }
  };

  /* ========================================================================= */
  /* MINIMAL TEMPLATE LAYOUT                                                   */
  /* ========================================================================= */
  if (template === 'minimal') {
    return (
      <div
        id={containerId}
        className={`w-full bg-white text-slate-900 shadow-xl rounded-lg p-6 sm:p-12 border border-slate-200 min-h-[780px] flex flex-col justify-between font-sans transition-all ${
          isPrintMode ? 'p-0 shadow-none border-0' : ''
        }`}
        style={{ boxSizing: 'border-box' }}
      >
        <div>
          {/* Minimal Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pb-8 border-b border-slate-200">
            <div className="space-y-3 max-w-sm">
              {invoice.seller.logoUrl ? (
                <img
                  src={invoice.seller.logoUrl}
                  alt="Business Logo"
                  className="max-h-14 max-w-[180px] object-contain"
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
                    {invoice.seller.businessName?.slice(0, 2).toUpperCase() || 'NX'}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    {invoice.seller.businessName || 'Business Name'}
                  </h2>
                </div>
              )}

              {invoice.seller.sellerName && (
                <p className="text-xs text-slate-600 font-medium">{invoice.seller.sellerName}</p>
              )}

              <div className="text-[11px] text-slate-500 space-y-0.5 leading-relaxed font-normal">
                {invoice.seller.address && (
                  <p className="whitespace-pre-line">{invoice.seller.address}</p>
                )}
                {invoice.seller.email && <p>Email: {invoice.seller.email}</p>}
                {invoice.seller.phone && <p>Tel: {invoice.seller.phone}</p>}
                {invoice.seller.taxNumber && <p>Tax ID: {invoice.seller.taxNumber}</p>}
                {invoice.seller.website && <p>{invoice.seller.website}</p>}
              </div>
            </div>

            <div className="text-left sm:text-right space-y-3">
              <div className="flex sm:justify-end items-center gap-3">
                <span className="text-2xl font-light tracking-widest uppercase text-slate-900">
                  {invoice.documentTitle || 'INVOICE'}
                </span>
                <div>{getStatusBadge()}</div>
              </div>

              <div className="font-mono text-xs text-slate-600">
                Ref: <span className="font-semibold text-slate-900">#{invoice.invoiceNumber || 'NI-2026-000001'}</span>
              </div>

              <div className="text-xs text-slate-500 space-y-1 font-mono">
                <div>
                  <span className="text-slate-400">Date: </span>
                  <span className="text-slate-800">{invoice.issueDate || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Due: </span>
                  <span className="text-slate-900 font-medium">{invoice.dueDate || '—'}</span>
                </div>
                {invoice.purchaseOrder && (
                  <div>
                    <span className="text-slate-400">PO: </span>
                    <span className="text-slate-800">{invoice.purchaseOrder}</span>
                  </div>
                )}
                {invoice.paymentTerms && (
                  <div>
                    <span className="text-slate-400">Terms: </span>
                    <span className="text-slate-800">{invoice.paymentTerms}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Minimal Client & Due Date Columns (Pure whitespace, no colored boxes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">
                Invoiced To
              </span>
              <h4 className="text-sm font-semibold text-slate-900">
                {invoice.client.clientName || 'Client Name or Company'}
              </h4>
              {invoice.client.address && (
                <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                  {invoice.client.address}
                </p>
              )}
              {invoice.client.email && (
                <p className="text-xs text-slate-500 mt-1">{invoice.client.email}</p>
              )}
              {invoice.client.phone && (
                <p className="text-xs text-slate-500">{invoice.client.phone}</p>
              )}
              {invoice.client.taxNumber && (
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Tax ID: {invoice.client.taxNumber}
                </p>
              )}
            </div>

            <div className="sm:text-right flex flex-col justify-start">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                Balance Due
              </span>
              <div className="text-3xl font-light tracking-tight text-slate-900 font-mono">
                {formatCurrency(invoice.balanceDue, invoice.currency)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Payable by {invoice.dueDate || 'due date'}
              </div>
            </div>
          </div>

          {/* Minimal Line Items Table (Clean horizontal lines, pure typography) */}
          <div className="my-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-t border-b border-slate-900 text-slate-900 uppercase tracking-widest text-[10px] font-semibold">
                  <th className="py-3 px-2">Description</th>
                  <th className="py-3 px-2 text-right">Qty</th>
                  <th className="py-3 px-2 text-right">Unit Price</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.lineItems.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3.5 px-2">
                      <p className="font-normal text-slate-800">{item.description || 'Line item description'}</p>
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono text-slate-600">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono font-medium text-slate-900">
                      {formatCurrency(item.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Minimal Totals & Notes Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pt-6 border-t border-slate-200">
            <div className="w-full sm:w-1/2 space-y-4 text-xs">
              {invoice.paymentInstructions && (
                <div>
                  <h5 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Payment Instructions
                  </h5>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed font-mono text-[11px]">
                    {invoice.paymentInstructions}
                  </p>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <h5 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Notes
                  </h5>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.termsAndConditions && (
                <div>
                  <h5 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Terms & Conditions
                  </h5>
                  <p className="text-[11px] text-slate-500 whitespace-pre-line leading-relaxed">
                    {invoice.termsAndConditions}
                  </p>
                </div>
              )}
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Discount</span>
                  <span className="font-mono">-{formatCurrency(invoice.discount, invoice.currency)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span className="font-mono">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
              )}
              {invoice.extraCharges > 0 && (
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Shipping / Extra</span>
                  <span className="font-mono">{formatCurrency(invoice.extraCharges, invoice.currency)}</span>
                </div>
              )}

              <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-semibold text-slate-900">
                <span>Total</span>
                <span className="font-mono">{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>

              {invoice.amountPaid > 0 && (
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Amount Paid</span>
                  <span className="font-mono">-{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
                </div>
              )}

              <div className="border-t border-slate-900 pt-2 flex justify-between text-base font-bold text-slate-900">
                <span>Balance Due</span>
                <span className="font-mono">{formatCurrency(invoice.balanceDue, invoice.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="mt-10 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>NexiSlip Billing Platform</span>
          <span>Thank you for your business</span>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* CLASSIC TEMPLATE LAYOUT (Corporate Ledger with Boxed Grid & Sign-off)     */
  /* ========================================================================= */
  if (template === 'classic') {
    return (
      <div
        id={containerId}
        className={`w-full bg-white text-slate-900 shadow-xl rounded-none sm:rounded-md p-6 sm:p-10 border-2 border-slate-300 min-h-[780px] flex flex-col justify-between font-sans transition-all ${
          isPrintMode ? 'p-0 shadow-none border-0' : ''
        }`}
        style={{ boxSizing: 'border-box' }}
      >
        <div>
          {/* Classic Top Header: Corporate Navy Accent Bar */}
          <div className="border-b-4 border-slate-800 pb-5 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div className="space-y-2 max-w-sm">
                {invoice.seller.logoUrl ? (
                  <img
                    src={invoice.seller.logoUrl}
                    alt="Business Logo"
                    className="max-h-16 max-w-[200px] object-contain"
                  />
                ) : (
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-wide">
                      {invoice.seller.businessName || 'CORPORATE BILLING'}
                    </h2>
                    {invoice.seller.sellerName && (
                      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        {invoice.seller.sellerName}
                      </p>
                    )}
                  </div>
                )}

                <div className="text-xs text-slate-600 space-y-0.5 leading-tight">
                  {invoice.seller.address && (
                    <p className="whitespace-pre-line">{invoice.seller.address}</p>
                  )}
                  {invoice.seller.email && <p>E-Mail: {invoice.seller.email}</p>}
                  {invoice.seller.phone && <p>Telephone: {invoice.seller.phone}</p>}
                  {invoice.seller.taxNumber && (
                    <p className="font-semibold text-slate-800">Tax Reg ID: {invoice.seller.taxNumber}</p>
                  )}
                  {invoice.seller.website && <p>{invoice.seller.website}</p>}
                </div>
              </div>

              <div className="text-left sm:text-right space-y-2">
                <div className="flex sm:justify-end items-center gap-3">
                  <span className="text-3xl font-serif font-black uppercase tracking-widest text-slate-900">
                    {invoice.documentTitle || 'INVOICE'}
                  </span>
                  <div>{getStatusBadge()}</div>
                </div>

                <div className="text-sm font-bold text-slate-900 font-mono bg-slate-100 inline-block px-3 py-1 border border-slate-300">
                  NO: {invoice.invoiceNumber || 'NI-2026-000001'}
                </div>
              </div>
            </div>
          </div>

          {/* Classic Structured Box Grid: Billed To & Invoice Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Box 1: Billed To */}
            <div className="border border-slate-300">
              <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                BILL TO / CLIENT INFORMATION
              </div>
              <div className="p-3.5 space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">
                  {invoice.client.clientName || 'Client Name / Business'}
                </h4>
                {invoice.client.address && (
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {invoice.client.address}
                  </p>
                )}
                {invoice.client.email && (
                  <p className="text-slate-600">Email: {invoice.client.email}</p>
                )}
                {invoice.client.phone && (
                  <p className="text-slate-600">Phone: {invoice.client.phone}</p>
                )}
                {invoice.client.taxNumber && (
                  <p className="text-slate-700 font-medium">Tax ID: {invoice.client.taxNumber}</p>
                )}
              </div>
            </div>

            {/* Box 2: Invoice Particulars Table */}
            <div className="border border-slate-300">
              <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                INVOICE PARTICULARS
              </div>
              <div className="p-3 text-xs divide-y divide-slate-200">
                <div className="flex justify-between py-1">
                  <span className="font-semibold text-slate-600">Issue Date:</span>
                  <span className="font-bold text-slate-900 font-mono">{invoice.issueDate || '—'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-semibold text-slate-600">Payment Due Date:</span>
                  <span className="font-bold text-slate-900 font-mono">{invoice.dueDate || '—'}</span>
                </div>
                {invoice.paymentTerms && (
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-slate-600">Terms:</span>
                    <span className="text-slate-800">{invoice.paymentTerms}</span>
                  </div>
                )}
                {invoice.purchaseOrder && (
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-slate-600">PO Reference:</span>
                    <span className="font-mono font-medium text-slate-900">{invoice.purchaseOrder}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 bg-slate-50 px-1 -mx-1">
                  <span className="font-bold text-slate-800">Total Amount Due:</span>
                  <span className="font-extrabold text-slate-900 font-mono">
                    {formatCurrency(invoice.balanceDue, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Classic Ledger Table with Solid Borders and Vertical Dividers */}
          <div className="mb-6 overflow-x-auto border border-slate-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-2.5 px-3 border-r border-slate-700">Item Description</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-700 w-20">Qty</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-700 w-28">Unit Price</th>
                  <th className="py-2.5 px-3 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.lineItems.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                  >
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <p className="font-medium text-slate-900">{item.description || 'Line item description'}</p>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 border-r border-slate-200">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 border-r border-slate-200">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Classic Accounting Summary & Sign-off Line */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            {/* Left: Instructions and Authorized Signature */}
            <div className="w-full sm:w-1/2 space-y-4 text-xs">
              {invoice.paymentInstructions && (
                <div className="border border-slate-200 p-3 bg-slate-50/50">
                  <h5 className="font-bold uppercase tracking-wider text-slate-700 text-[10px] mb-1">
                    Remittance / Bank Instructions:
                  </h5>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed font-mono text-[11px]">
                    {invoice.paymentInstructions}
                  </p>
                </div>
              )}

              {invoice.notes && (
                <div>
                  <h5 className="font-bold uppercase tracking-wider text-slate-700 text-[10px] mb-1">
                    Special Notes:
                  </h5>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {invoice.termsAndConditions && (
                <div>
                  <h5 className="font-bold uppercase tracking-wider text-slate-700 text-[10px] mb-1">
                    Terms & Commercial Conditions:
                  </h5>
                  <p className="text-[11px] text-slate-500 whitespace-pre-line leading-relaxed">
                    {invoice.termsAndConditions}
                  </p>
                </div>
              )}

              {/* Classic Authorized Signature Line */}
              <div className="pt-4 mt-2">
                <div className="w-56 border-b border-slate-400 pb-1 mb-1" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Authorized Signatory / Official Stamp
                </span>
              </div>
            </div>

            {/* Right: Formal Accounting Ledger Totals */}
            <div className="w-full sm:w-72 border border-slate-300 bg-slate-50/60 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-slate-700">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-mono font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between py-1 text-emerald-700">
                  <span className="font-semibold">Discount:</span>
                  <span className="font-mono font-medium">-{formatCurrency(invoice.discount, invoice.currency)}</span>
                </div>
              )}

              {invoice.taxAmount > 0 && (
                <div className="flex justify-between py-1 text-slate-700">
                  <span className="font-semibold">Tax ({invoice.taxRate}%):</span>
                  <span className="font-mono font-medium">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
              )}

              {invoice.extraCharges > 0 && (
                <div className="flex justify-between py-1 text-slate-700">
                  <span className="font-semibold">Shipping / Fees:</span>
                  <span className="font-mono font-medium">{formatCurrency(invoice.extraCharges, invoice.currency)}</span>
                </div>
              )}

              <div className="flex justify-between py-1.5 border-t border-slate-300 text-sm font-bold text-slate-900">
                <span>Invoice Total:</span>
                <span className="font-mono">{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>

              {invoice.amountPaid > 0 && (
                <div className="flex justify-between py-1 text-slate-700">
                  <span className="font-semibold">Amount Paid:</span>
                  <span className="font-mono text-emerald-700">-{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
                </div>
              )}

              {/* Hall-mark classic double bottom rule for Balance Due */}
              <div className="flex justify-between py-2 border-t-2 border-b-4 border-double border-slate-900 text-base font-black text-slate-900">
                <span>Balance Due:</span>
                <span className="font-mono">
                  {formatCurrency(invoice.balanceDue, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Classic Footer */}
        <div className="mt-8 pt-3 border-t-2 border-slate-300 flex justify-between items-center text-[11px] text-slate-500 font-serif">
          <span>Official Billing Record • NexiSlip</span>
          <span>Payment is appreciated by the stated due date.</span>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* MODERN TEMPLATE LAYOUT (Default: Contemporary SaaS & Agency style)       */
  /* ========================================================================= */
  return (
    <div
      id={containerId}
      className={`w-full bg-white text-slate-800 shadow-xl rounded-2xl p-6 sm:p-10 border border-slate-200 min-h-[780px] flex flex-col justify-between font-sans transition-all ${
        isPrintMode ? 'p-0 shadow-none border-0' : ''
      }`}
      style={{ boxSizing: 'border-box' }}
    >
      <div>
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-3">
            {invoice.seller.logoUrl ? (
              <img
                src={invoice.seller.logoUrl}
                alt="Business Logo"
                className="max-h-16 max-w-[200px] object-contain rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-blue-600 shadow-md shadow-blue-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                    {invoice.seller.businessName || 'Business Name'}
                  </h2>
                  {invoice.seller.sellerName && (
                    <p className="text-xs text-slate-500">{invoice.seller.sellerName}</p>
                  )}
                </div>
              </div>
            )}

            {/* Seller Contact Lines */}
            <div className="text-xs text-slate-500 space-y-0.5">
              {invoice.seller.address && (
                <p className="whitespace-pre-line leading-relaxed">{invoice.seller.address}</p>
              )}
              {invoice.seller.email && <p>Email: {invoice.seller.email}</p>}
              {invoice.seller.phone && <p>Tel: {invoice.seller.phone}</p>}
              {invoice.seller.taxNumber && <p>Tax ID: {invoice.seller.taxNumber}</p>}
              {invoice.seller.website && <p>{invoice.seller.website}</p>}
            </div>
          </div>

          {/* Right Header Metadata */}
          <div className="text-left sm:text-right space-y-2">
            <div className="flex sm:justify-end items-center gap-3">
              <span className="text-2xl font-black uppercase tracking-wider text-slate-900">
                {invoice.documentTitle || 'INVOICE'}
              </span>
              <div>{getStatusBadge()}</div>
            </div>

            <p className="text-sm font-bold text-blue-600 font-mono">
              #{invoice.invoiceNumber || 'NI-2026-000001'}
            </p>

            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <span className="text-slate-400">Date: </span>
                <span className="font-semibold">{invoice.issueDate || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400">Due Date: </span>
                <span className="font-semibold text-slate-900">{invoice.dueDate || '—'}</span>
              </div>
              {invoice.purchaseOrder && (
                <div>
                  <span className="text-slate-400">PO Number: </span>
                  <span className="font-semibold">{invoice.purchaseOrder}</span>
                </div>
              )}
              {invoice.paymentTerms && (
                <div>
                  <span className="text-slate-400">Terms: </span>
                  <span>{invoice.paymentTerms}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client & Billing Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Billed To
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              {invoice.client.clientName || 'Client Name or Company'}
            </h4>
            {invoice.client.address && (
              <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                {invoice.client.address}
              </p>
            )}
            {invoice.client.email && (
              <p className="text-xs text-slate-600 mt-0.5">{invoice.client.email}</p>
            )}
            {invoice.client.phone && (
              <p className="text-xs text-slate-600">{invoice.client.phone}</p>
            )}
            {invoice.client.taxNumber && (
              <p className="text-xs text-slate-500 mt-0.5">Tax ID: {invoice.client.taxNumber}</p>
            )}
          </div>

          <div className="sm:text-right flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Amount Due
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                {formatCurrency(invoice.balanceDue, invoice.currency)}
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Payment expected by <span className="font-medium text-slate-700">{invoice.dueDate || 'due date'}</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="my-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b text-slate-600 uppercase tracking-wider text-[11px] bg-slate-50 border-slate-200 font-semibold">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.lineItems.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-900">{item.description || 'Line item description'}</p>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(item.total, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Calculations Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
          <div className="w-full sm:w-1/2 space-y-4">
            {invoice.paymentInstructions && (
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Payment Instructions
                </h5>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {invoice.paymentInstructions}
                </p>
              </div>
            )}

            {invoice.notes && (
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Notes
                </h5>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {invoice.notes}
                </p>
              </div>
            )}

            {invoice.termsAndConditions && (
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Terms & Conditions
                </h5>
                <p className="text-[11px] text-slate-500 whitespace-pre-line leading-relaxed">
                  {invoice.termsAndConditions}
                </p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-80 space-y-2 text-xs">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>

            {invoice.discount > 0 && (
              <div className="flex justify-between py-1 text-emerald-600">
                <span>Discount:</span>
                <span className="font-mono font-medium">-{formatCurrency(invoice.discount, invoice.currency)}</span>
              </div>
            )}

            {invoice.taxAmount > 0 && (
              <div className="flex justify-between py-1 text-slate-600">
                <span>Tax ({invoice.taxRate}%):</span>
                <span className="font-mono font-medium">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
            )}

            {invoice.extraCharges > 0 && (
              <div className="flex justify-between py-1 text-slate-600">
                <span>Shipping / Extra:</span>
                <span className="font-mono font-medium">{formatCurrency(invoice.extraCharges, invoice.currency)}</span>
              </div>
            )}

            <div className="flex justify-between py-2.5 px-3 bg-blue-50/80 rounded-xl text-blue-950 font-bold text-sm border border-blue-100">
              <span>Total:</span>
              <span className="font-mono">{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>

            {invoice.amountPaid > 0 && (
              <div className="flex justify-between py-1 text-slate-600">
                <span>Amount Paid:</span>
                <span className="font-mono text-emerald-600">-{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 px-3 bg-slate-900 text-white rounded-xl font-bold text-sm">
              <span>Balance Due:</span>
              <span className="font-mono text-blue-300">
                {formatCurrency(invoice.balanceDue, invoice.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding line */}
      <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
        The Quickest Way to Bill Your Clients. Generated with NexiSlip.
      </div>
    </div>
  );
};
