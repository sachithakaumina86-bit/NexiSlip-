import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenBillingPolicy: () => void;
  onOpenSecurity: () => void;
  onNavigate: (view: string) => void;
  onOpenPricing: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenBillingPolicy,
  onOpenSecurity,
  onNavigate,
  onOpenPricing,
}) => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-indigo-500/15 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-0.5">
                <img src="/logo.png" alt="NexiSlip Logo" className="w-full h-full object-contain filter drop-shadow-sm" />
              </div>
              <div className="flex items-center">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  NexiSlip
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              NexiSlip — The Quickest Way to Bill Your Clients. Professional invoices and billing slips for freelancers, agencies, and businesses worldwide.
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              © {new Date().getFullYear()} NexiSlip. All rights reserved.
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Invoice Builder
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPricing}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Pricing Plans
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Supported Export Formats
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  FAQ & Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Solutions
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>Freelancers & Contractors</li>
              <li>Creative Agencies & Studios</li>
              <li>Consultants & Coaches</li>
              <li>Small & Local Businesses</li>
              <li>International Multi-currency Invoicing</li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenBillingPolicy}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Billing & Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSecurity}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Security Architecture (SECURITY.md)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
