import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BusinessProfile, InvoiceTemplateId } from '../types';
import { SUPPORTED_CURRENCIES } from '../lib/calculations';
import {
  Save,
  Building2,
  User,
  Shield,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { profile, currentUser, updateBusinessProfile, deleteAccount } = useAuth();
  const { theme, setTheme } = useTheme();

  const [businessName, setBusinessName] = useState(profile?.businessProfile?.businessName || '');
  const [sellerName, setSellerName] = useState(profile?.businessProfile?.sellerName || '');
  const [email, setEmail] = useState(profile?.businessProfile?.email || currentUser?.email || '');
  const [phone, setPhone] = useState(profile?.businessProfile?.phone || '');
  const [address, setAddress] = useState(profile?.businessProfile?.address || '');
  const [website, setWebsite] = useState(profile?.businessProfile?.website || '');
  const [taxNumber, setTaxNumber] = useState(profile?.businessProfile?.taxNumber || '');
  const [logoUrl, setLogoUrl] = useState(profile?.businessProfile?.logoUrl || '');
  const [defaultCurrency, setDefaultCurrency] = useState(profile?.businessProfile?.defaultCurrency || 'USD');
  const [defaultTerms, setDefaultTerms] = useState(
    profile?.businessProfile?.defaultTerms || 'Net 14 Days. Thank you for your business!'
  );
  const [defaultTaxRate, setDefaultTaxRate] = useState(profile?.businessProfile?.defaultTaxRate || 0);
  const [defaultTemplate, setDefaultTemplate] = useState<InvoiceTemplateId>(
    profile?.businessProfile?.defaultTemplate || 'modern'
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBusinessProfile({
        businessName,
        sellerName,
        email,
        phone,
        address,
        website,
        taxNumber,
        logoUrl,
        defaultCurrency,
        defaultTerms,
        defaultTaxRate: Number(defaultTaxRate) || 0,
        defaultTemplate,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update business profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Could not delete account. You may need to re-authenticate first.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure your business identity and default invoice preferences.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Default Business Information
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            These values automatically pre-fill into new invoices you create.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company / Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Apex Studio Ltd."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Billing Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@example.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="100 Market St, San Francisco, CA"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tax Identification Number
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="EIN, VAT or GST"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Logo Image URL
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://... or data:image/..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Invoicing Preferences */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Default Invoicing Standards
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Currency
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Template
              </label>
              <select
                value={defaultTemplate}
                onChange={(e) => setDefaultTemplate(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white capitalize"
              >
                <option value="modern">Modern (Contemporary)</option>
                <option value="minimal">Minimal (Clean Editorial)</option>
                <option value="classic">Classic (Corporate Ledger)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Payment Terms & Notes
              </label>
              <textarea
                rows={2}
                value={defaultTerms}
                onChange={(e) => setDefaultTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Settings successfully saved!
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Account Deletion */}
      <div className="p-6 rounded-3xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 space-y-3">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="text-sm font-bold">Danger Zone: Delete Account</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Permanently delete your NexiSlip account, profile, and all associated invoice history. This action cannot be reversed.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Confirm Permanent Account Deletion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              To confirm, please type <strong className="text-red-600">DELETE</strong> in the box below.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                onClick={handleDeleteAccount}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
