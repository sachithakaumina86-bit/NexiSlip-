import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Eye,
  Edit3,
  Download,
  Image as ImageIcon,
  FileCode,
  Cloud,
  History,
  Calendar,
  CreditCard,
  SunMoon,
  Smartphone,
  ChevronDown,
  Shield,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onCreateInvoice: () => void;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onCreateInvoice,
  onOpenPricing,
  onOpenAuth,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Edit3 className="w-5 h-5 text-blue-600" />,
      title: 'Professional Invoice Builder',
      desc: 'Intuitive split-screen editor with automatic decimal math, tax rates, line items, and multi-currency support.',
    },
    {
      icon: <Eye className="w-5 h-5 text-indigo-600" />,
      title: 'Live Real-Time Preview',
      desc: 'Watch your invoice update instantly as you type every field. No guessing how your invoice will look.',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      title: '100% Editable Invoices',
      desc: 'Saved invoices remain fully editable. Change line items, update amounts, or revise terms anytime.',
    },
    {
      icon: <Download className="w-5 h-5 text-violet-600" />,
      title: 'Crisp Vector PDF Downloads',
      desc: 'Generates clean, search-ready vector PDFs with professional typography and print-perfect margins.',
    },
    {
      icon: <ImageIcon className="w-5 h-5 text-pink-600" />,
      title: 'High-Res PNG & JPG Exports',
      desc: 'Export razor-sharp image formats at 2x pixel ratio for messaging, mobile sharing, or quick attachments.',
    },
    {
      icon: <FileCode className="w-5 h-5 text-blue-700" />,
      title: 'Editable Word (.docx) Docs',
      desc: 'Export genuine Microsoft Word documents with structured tables, editable text, and formatted headings.',
    },
    {
      icon: <Cloud className="w-5 h-5 text-sky-600" />,
      title: 'Secure Cloud Storage',
      desc: 'Backed by Cloud Firestore with strict row-level security rules ensuring complete customer data isolation.',
    },
    {
      icon: <History className="w-5 h-5 text-amber-600" />,
      title: 'Invoice History & Search',
      desc: 'Instant search by invoice number or client name, filter by status, sort, and duplicate with one click.',
    },
    {
      icon: <Calendar className="w-5 h-5 text-teal-600" />,
      title: 'Free Daily Invoice Allowance',
      desc: 'Create up to 3 brand new invoices every single day for free with backend quota management.',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-purple-600" />,
      title: 'Flexible $1/mo & $8/yr Plans',
      desc: 'Affordable Pro plans: just $1 per month or $8 for a whole year (save 33%) for unlimited invoices.',
    },
    {
      icon: <SunMoon className="w-5 h-5 text-yellow-500" />,
      title: 'One-Click Light & Dark Themes',
      desc: 'Seamless theme switcher that persists across visits and respects your system preferences.',
    },
    {
      icon: <Smartphone className="w-5 h-5 text-rose-600" />,
      title: 'Mobile-Friendly Workspace',
      desc: 'Engineered mobile-first with touch-friendly form controls and tabbed editor/preview switcher.',
    },
  ];

  const faqs = [
    {
      q: 'How many free invoices can I create?',
      a: 'Free plan accounts can create up to 3 newly persisted invoices every calendar day. The allowance automatically resets at midnight based on your timezone.',
    },
    {
      q: 'What happens when I reach the daily limit?',
      a: 'The server will safely prevent the creation of a 4th new invoice for that day. You can continue viewing, editing, duplicating, and downloading your existing invoices, or upgrade to Pro for $1/month to unlock unlimited creation.',
    },
    {
      q: 'Can I edit a saved invoice?',
      a: 'Yes, 100%! Saved invoices are never permanently flattened into static images. Every field, line item, price, and note can be reopened and edited without consuming your daily creation quota.',
    },
    {
      q: 'Which file formats are supported for export?',
      a: 'NexiSlip natively exports to vector PDF, high-resolution PNG, high-quality JPG, and genuine Microsoft Word (.docx) documents, plus in-browser printing.',
    },
    {
      q: 'Can I use NexiSlip on my mobile phone?',
      a: 'Yes. NexiSlip is designed mobile-first. On phones, an accessible Form / Preview toggle allows you to edit and inspect your invoices comfortably without horizontal scrolling.',
    },
    {
      q: 'How do subscriptions work?',
      a: 'We offer Monthly Pro for $1/month and Annual Pro for $8/year. Both tiers include unlimited invoices, all templates, and all export formats. The annual plan offers a 33% discount (saving $4/year compared to 12 monthly payments).',
    },
    {
      q: 'Can I cancel a paid subscription?',
      a: 'Yes, you can cancel at any time. When cancelled, you retain unlimited access until the end of your prepaid billing period, after which your account reverts to the Free 3/day plan.',
    },
    {
      q: 'Is my invoice and business data private?',
      a: 'Yes. Your account and invoice data are private to you. Firestore security rules enforce strict ownership verification (request.auth.uid == ownerId), preventing any unauthorized cross-account reads or modifications.',
    },
    {
      q: 'Will my invoices remain accessible if I downgrade?',
      a: 'Yes. All invoices you previously created remain safely stored in your account history and can be accessed, searched, edited, and downloaded anytime.',
    },
  ];

  return (
    <div className="space-y-20 lg:space-y-28 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-7">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 shadow-sm mx-auto">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>The Quickest Way to Bill Your Clients.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
            Professional Invoices &amp; Slips.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Made Effortless.
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Create, customize, and download beautiful business invoices and slips in seconds. Built for freelancers, agencies, and businesses who want to bill clients fast and get paid on time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onCreateInvoice}
              className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <FileText className="w-5 h-5" />
              <span>Create Free Invoice</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onOpenPricing}
              className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl transition-colors cursor-pointer"
            >
              View Plans ($0 - $1/mo)
            </button>
          </div>

          {/* Micro assurances */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>3 Free Invoices / Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>PDF, PNG &amp; DOCX Export</span>
            </div>
          </div>

          {/* Quick value props bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Speed</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">&lt; 60 Seconds</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Daily Allowance</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">3 Free / Day</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Formats</div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">PDF • PNG • DOCX</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Storage</div>
              <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-0.5">Cloud Firestore</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900 mx-auto">
            Streamlined Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center">
            How NexiSlip Works in 3 Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center max-w-xl mx-auto">
            From blank document to client-ready download in under sixty seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm mx-auto">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white text-center">
              Enter Business &amp; Client
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-center">
              Fill in your business details, upload or AI-generate your logo, and add your client billing details. Saved profiles pre-fill automatically.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mx-auto">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white text-center">
              Customize Line Items &amp; Preview
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-center">
              Add products or services with automatic totals. Choose between Modern, Professional, or Creative templates with dynamic live preview.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 relative flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-extrabold flex items-center justify-center text-sm mx-auto">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white text-center">
              Save, Export &amp; Send
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-center">
              Download your invoice in crisp PDF, high-res PNG, JPG, or editable Microsoft Word (.docx). Your invoices remain securely editable anytime.
            </p>
          </div>
        </div>
      </section>

      {/* CORE 12 FEATURES GRID - CENTERED */}
      <section id="features-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900 mx-auto">
            <Zap className="w-3.5 h-3.5" /> Engineered For Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white text-center">
            Everything You Need to Invoice With Confidence
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center max-w-2xl mx-auto">
            A comprehensive SaaS platform built for speed, accuracy, and international standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-md space-y-3 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white text-center">{feat.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-center">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION - CENTERED */}
      <section id="pricing-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900 mx-auto">
            <Zap className="w-3.5 h-3.5" /> Simple, Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white text-center">
            Affordable Plans For Every Business
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center max-w-2xl mx-auto">
            Start completely free with 3 daily invoices or unlock unlimited billing and high-resolution exports.
          </p>
        </div>

        {/* Centered 3-Column Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto w-full items-stretch justify-center">
          {/* Plan 1: Free */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between items-center text-center relative hover:shadow-md transition-shadow">
            <div className="space-y-5 w-full flex flex-col items-center text-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center">Free Plan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                  Ideal for freelancers and occasional invoice needs.
                </p>
              </div>

              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ forever free</span>
              </div>

              <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 flex flex-col items-center text-center">
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>3 free invoices per day</strong></span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Vector PDF, PNG &amp; Word DOCX</span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Live real-time preview</span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Light &amp; dark mode persistence</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 w-full">
              <button
                onClick={onCreateInvoice}
                className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-colors cursor-pointer text-center"
              >
                Create Free Invoice
              </button>
            </div>
          </div>

          {/* Plan 2: Monthly Pro */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-blue-300 dark:border-blue-800 shadow-md flex flex-col justify-between items-center text-center relative hover:shadow-xl transition-shadow">
            <div className="space-y-5 w-full flex flex-col items-center text-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center">Monthly Pro</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                  Unlimited invoicing flexibility billed monthly.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$1</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">USD / month</span>
                </div>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 text-center">
                  Billed monthly • Cancel anytime
                </p>
              </div>

              <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 flex flex-col items-center text-center">
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span><strong>Unlimited invoices</strong> (no daily cap)</span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>All 3 professional templates</span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Instant PDF, PNG, JPG &amp; Word exports</span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Persistent cloud history &amp; duplicate</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 w-full">
              <button
                onClick={onOpenPricing}
                className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer text-center"
              >
                Choose Monthly Pro ($1/mo)
              </button>
            </div>
          </div>

          {/* Plan 3: Annual Pro (Best Value) */}
          <div className="bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-8 border-2 border-blue-500 shadow-xl flex flex-col justify-between items-center text-center relative overflow-hidden hover:shadow-2xl transition-shadow">
            <div className="absolute top-0 right-0 bg-blue-600 text-white font-black text-[10px] tracking-wider px-3.5 py-1 rounded-bl-xl uppercase flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" /> SAVE 33%
            </div>

            <div className="space-y-5 w-full flex flex-col items-center text-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center">Annual Pro</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                  Maximum savings for growing businesses.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$8</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">USD / year</span>
                </div>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 text-center">
                  Save $4/year • Equivalent to ~$0.67/mo
                </p>
              </div>

              <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 flex flex-col items-center text-center">
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Everything in Monthly Pro</strong></span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unlimited invoices all year</span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Highest priority processing</span>
                  </li>
                  <li className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Best value guarantee</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 w-full">
              <button
                onClick={onOpenPricing}
                className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/30 transition-all cursor-pointer text-center"
              >
                Choose Annual Pro ($8/yr)
              </button>
            </div>
          </div>
        </div>

        {/* Centered Trust Assurances */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs text-slate-500 dark:text-slate-400 text-center max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Encrypted Cloud Storage</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Cancel anytime with 1-click</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <span>33% discount on annual plan</span>
          </div>
        </div>
      </section>

      {/* FAQ SECTION - CENTERED */}
      <section id="faq-section" className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center">
        <div className="text-center space-y-3 mb-10 max-w-2xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900 mx-auto">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center max-w-xl mx-auto">
            Everything you need to know about NexiSlip's features, export formats, free allowances, and billing.
          </p>
        </div>

        <div className="w-full space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white transition-colors cursor-pointer text-center"
                >
                  <span className="w-5 shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-center">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 sm:px-8 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4 text-center max-w-2xl mx-auto">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Centered Help Box */}
        <div className="mt-8 text-center p-6 rounded-3xl bg-blue-50/50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 max-w-lg mx-auto flex flex-col items-center space-y-2">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
            Still have questions? We're ready to help you bill clients with ease.
          </p>
          <button
            onClick={onCreateInvoice}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <span>Create a free invoice in under 60 seconds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};

function FileCheck(props: any) {
  return <CheckCircle2 {...props} />;
}
