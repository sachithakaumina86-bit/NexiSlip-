import React from 'react';
import { X, Shield, FileText, CreditCard, Lock } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'billing' | 'security' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[85vh] overflow-y-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'privacy' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
              <Shield className="w-6 h-6" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
            </div>
            <p className="text-slate-500 text-xs">Last updated: October 2026</p>
            <p>
              At NexiSlip, we take the confidentiality of your financial and invoice data seriously. This Privacy Policy details how your personal information and documents are collected, used, and protected.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">1. Data Isolation</h3>
            <p>
              Your invoices, client names, line items, and financial totals are stored under strict Attribute-Based Access Control (ABAC). No other user or unauthorized third party can read or modify your data.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">2. Information Collected</h3>
            <p>
              We collect your authentication credentials (email and display name), business profile settings, and generated invoice records required to provide our service.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">3. Payment Security</h3>
            <p>
              Payment transactions are processed through certified PCI-DSS compliant providers. We never store raw credit card numbers or sensitive CVVs on our servers.
            </p>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Terms of Service</h2>
            </div>
            <p className="text-slate-500 text-xs">Last updated: October 2026</p>
            <p>
              By accessing or using NexiSlip, you agree to be bound by these terms. If you disagree with any part of these terms, you may not use the service.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">1. Account Responsibility</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You must provide valid and verifiable email addresses.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">2. Usage Entitlements</h3>
            <p>
              Free accounts are entitled to 3 newly created invoices per calendar day. Paid accounts (Monthly Pro and Annual Pro) enjoy unlimited invoice creation subject to fair use.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">3. Accuracy of Tax & Invoices</h3>
            <p>
              NexiSlip calculates decimal line items, subtotals, and taxes according to user-configured rates. Users are responsible for ensuring compliance with their local tax authorities.
            </p>
          </div>
        )}

        {type === 'billing' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
              <CreditCard className="w-6 h-6" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Billing & Cancellation Policy
              </h2>
            </div>
            <p className="text-slate-500 text-xs">Transparent and straightforward terms</p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">1. Pricing Plans</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Free Plan:</strong> $0 forever with 3 invoices per calendar day.</li>
              <li><strong>Monthly Pro:</strong> $1 USD per month with unlimited invoices.</li>
              <li><strong>Annual Pro:</strong> $8 USD per 12-month billing period (33% discount; save $4/year compared to monthly billing).</li>
            </ul>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">2. Cancellation Policy</h3>
            <p>
              You may cancel your paid subscription at any time. Your unlimited access remains active until the end of your current paid billing period. No cancellation fees apply.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">3. Downgrading to Free</h3>
            <p>
              Upon expiration of a cancelled subscription, your account transitions to the Free plan. All previously created invoices remain safely accessible in your cloud history.
            </p>
          </div>
        )}

        {type === 'security' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
              <Lock className="w-6 h-6" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security Model</h2>
            </div>
            <p className="text-slate-500 text-xs">Zero-Trust & Attribute-Based Access Control</p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">1. Backend Quota Verification</h3>
            <p>
              Free plan daily quota (3/day) is authoritatively enforced by trusted server-side logic and Cloud Firestore rules, preventing client-side bypass.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">2. Firestore Security Rules</h3>
            <p>
              Deployed rules enforce strict document ownership: <code>request.auth.uid == resource.data.ownerId</code>. Blanket reads and client-delegated queries are strictly blocked.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">3. Role-Based Administration</h3>
            <p>
              Administrative roles and Enterprise Admin entitlements cannot be assigned from client payloads. Only the configured administrator identity is recognized by the server.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
