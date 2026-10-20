import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FileText,
  CheckCircle2,
  Moon,
  Sun,
  ShieldCheck,
  Plus,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onOpenPricing: () => void;
  onCreateInvoice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenPricing,
  onCreateInvoice,
}) => {
  const { currentUser, profile, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAuthenticated = !!currentUser || !!profile;

  const getPlanBadge = () => {
    if (!profile) return null;
    if (profile.plan === 'enterprise_admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          Enterprise Admin
        </span>
      );
    }
    if (profile.plan === 'annual_pro') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Sparkles className="w-3.5 h-3.5" />
          Annual Pro
        </span>
      );
    }
    if (profile.plan === 'monthly_pro') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          Monthly Pro
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        Free Plan
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Wordmark */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-indigo-500/15 group-hover:scale-105 transition-all flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-0.5">
              <img
                src="/logo.png"
                alt="NexiSlip Logo"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent font-sans">
                NexiSlip
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => onNavigate('features')}
                  className={`text-sm font-medium transition-colors ${
                    currentView === 'landing'
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Pricing
                </button>
                <button
                  onClick={() => onNavigate('faq')}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  FAQ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate('invoices')}
                  className={`text-sm font-medium transition-colors ${
                    currentView === 'invoices'
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Invoices
                </button>
                <button
                  onClick={onOpenPricing}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  Pricing & Plans
                </button>
                {isAdmin && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      currentView === 'admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                        : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Portal
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle light/dark theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {!isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onCreateInvoice}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Create Free Invoice
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* Plan Badge */}
                <div className="hidden sm:block cursor-pointer" onClick={onOpenPricing}>
                  {getPlanBadge()}
                </div>

                {/* Create Invoice Primary Button */}
                <button
                  onClick={onCreateInvoice}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Invoice
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {profile?.displayName?.charAt(0) || profile?.email?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {profile?.displayName || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {profile?.email || currentUser?.email || ''}
                        </p>
                        <div className="mt-1.5 sm:hidden">{getPlanBadge()}</div>
                      </div>

                      <button
                        onClick={() => onNavigate('dashboard')}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        My Dashboard
                      </button>

                      <button
                        onClick={() => onNavigate('settings')}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        Business & Settings
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => onNavigate('admin')}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-500" />
                          Admin Portal
                        </button>
                      )}

                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  onNavigate('features');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Features
              </button>
              <button
                onClick={() => {
                  onNavigate('pricing');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Pricing Plans
              </button>
              <button
                onClick={() => {
                  onNavigate('faq');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Frequently Asked Questions
              </button>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onCreateInvoice();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-blue-600 text-white"
                >
                  Create Free Invoice
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  onCreateInvoice();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-blue-600 dark:text-blue-400 font-semibold"
              >
                + Create New Invoice
              </button>
              <button
                onClick={() => {
                  onOpenPricing();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Pricing & Subscription
              </button>
              <button
                onClick={() => {
                  onNavigate('settings');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Business Profile & Settings
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm font-semibold text-purple-600 dark:text-purple-400"
                >
                  Administrator Portal
                </button>
              )}
              <div className="pt-2">
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-left text-sm font-medium text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
