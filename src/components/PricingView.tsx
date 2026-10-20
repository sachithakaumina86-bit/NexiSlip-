import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, Sparkles, Shield, AlertCircle, ArrowRight, Zap, ExternalLink } from 'lucide-react';

interface PricingViewProps {
  onBack?: () => void;
  onSelectPlan?: (planId: 'monthly_pro' | 'annual_pro') => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onBack, onSelectPlan }) => {
  const { profile, updateUserPlan } = useAuth();
  const [billingConfig, setBillingConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [simulatingUpgrade, setSimulatingUpgrade] = useState(false);

  useEffect(() => {
    fetch('/api/billing/status')
      .then((res) => res.json())
      .then((data) => {
        setBillingConfig(data);
        setLoadingConfig(false);
      })
      .catch((err) => {
        console.error('Failed to fetch billing status:', err);
        setLoadingConfig(false);
      });
  }, []);

  const handleChoosePlan = async (plan: 'monthly_pro' | 'annual_pro') => {
    if (billingConfig?.configured) {
      // In live production with real Stripe keys:
      window.location.href = `/api/billing/create-checkout?plan=${plan}`;
    } else {
      // Show honest setup state
      setShowSetupModal(true);
    }
  };

  const handleSandboxDevUpgrade = async (plan: 'monthly_pro' | 'annual_pro') => {
    setSimulatingUpgrade(true);
    try {
      await updateUserPlan(plan);
      setShowSetupModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatingUpgrade(false);
    }
  };

  const isCurrentPlan = (planKey: string) => {
    if (!profile) return planKey === 'free';
    return profile.plan === planKey;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
          <Zap className="w-3.5 h-3.5" /> Simple, Transparent Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Choose the plan that fits your business
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Start for free with 3 invoices every day, or unlock unlimited invoices and priority exports for just $1/month.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {/* PLAN A: FREE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Free Plan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ideal for freelancers and consultants sending occasional invoices.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ forever free</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>3 free invoices per day</strong> (server-enforced daily allowance)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Full access to invoice dashboard & management</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>PDF, PNG, JPG & DOCX file exports</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Real-time decimal calculations & multi-currency</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Light and dark theme support</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              disabled={isCurrentPlan('free')}
              className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                isCurrentPlan('free')
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800'
              }`}
            >
              {isCurrentPlan('free') ? 'Current Active Plan' : 'Select Free Plan'}
            </button>
          </div>
        </div>

        {/* PLAN B: MONTHLY PRO */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-blue-300 dark:border-blue-800 shadow-md flex flex-col justify-between relative">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Pro</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Unlimited invoicing flexibility with monthly billing.
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">$1</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">USD / month</span>
              </div>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                Billed monthly, cancel anytime
              </p>
            </div>

            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Unlimited invoice creation</strong> (no daily caps)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>All invoice templates (Modern, Professional, Creative)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>Instant PDF, PNG, JPG, and Word (.docx) downloads</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>Invoice duplication & persistent cloud history</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>AI line-item assistant & custom aspect ratio logo generator</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={() => handleChoosePlan('monthly_pro')}
              disabled={isCurrentPlan('monthly_pro')}
              className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md ${
                isCurrentPlan('monthly_pro')
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              {isCurrentPlan('monthly_pro') ? 'Current Active Plan' : 'Upgrade to Monthly Pro'}
            </button>
          </div>
        </div>

        {/* PLAN C: ANNUAL PRO (BEST VALUE) */}
        <div className="bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-8 border-2 border-blue-500 shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Top Value Banner */}
          <div className="absolute top-0 right-0 bg-blue-600 text-white font-black text-[10px] tracking-wider px-3.5 py-1 rounded-bl-xl uppercase flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3" /> SAVE 33%
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Annual Pro</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The ultimate choice for serious businesses. Maximum savings.
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">$8</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">USD / 12-month period</span>
              </div>
              <div className="mt-1 space-y-0.5">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Save $4 per year compared with monthly billing ($12/yr).
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Equivalent to just ~$0.67 per month. Billed once annually at $8.
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Everything in Monthly Pro included</strong>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Unlimited invoices for a full 12 months</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>33% discount lock-in ($8 total instead of $12)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Vector PDF, high-res PNG, JPG, and Microsoft Word .docx</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Priority feature access & cloud sync</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              onClick={() => handleChoosePlan('annual_pro')}
              disabled={isCurrentPlan('annual_pro')}
              className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-lg ${
                isCurrentPlan('annual_pro')
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 cursor-default'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25'
              }`}
            >
              {isCurrentPlan('annual_pro') ? 'Current Active Plan' : 'Get Annual Pro ($8/yr)'}
            </button>
          </div>
        </div>
      </div>

      {/* Honest Payment Setup & Dev Sandbox Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Payment Gateway Configuration Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  NexiSlip is configured for real Stripe Checkout and webhook transactions.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Live Stripe Secret Keys Pending
              </p>
              <p className="leading-relaxed">
                As per safety guidelines, mock checkouts are not simulated. To enable live payments:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>
                  Set <code>STRIPE_SECRET_KEY</code> in your environment secrets.
                </li>
                <li>
                  Set <code>STRIPE_WEBHOOK_SECRET</code> to verify checkout events.
                </li>
                <li>
                  Check <code>PAYMENT_SETUP.md</code> for exact steps and price IDs.
                </li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white">Development Sandbox Testing</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Would you like to test the unlimited subscription entitlement right now in the sandbox?
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleSandboxDevUpgrade('monthly_pro')}
                  disabled={simulatingUpgrade}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Activate Monthly Pro
                </button>
                <button
                  onClick={() => handleSandboxDevUpgrade('annual_pro')}
                  disabled={simulatingUpgrade}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Activate Annual Pro ($8)
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSetupModal(false)}
              className="w-full py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
