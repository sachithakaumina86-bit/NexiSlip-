import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { InvoiceEditor } from './components/InvoiceEditor';
import { PricingView } from './components/PricingView';
import { SettingsView } from './components/SettingsView';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { LegalModals } from './components/LegalModals';
import { Invoice } from './types';
import { DEFAULT_SAMPLE_INVOICES } from './lib/sampleInvoices';
import { db } from './lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

function MainApp() {
  const { currentUser, profile, loading, isAdmin, isUnlimited } = useAuth();

  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dailyUsageCount, setDailyUsageCount] = useState<number>(0);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<
    'privacy' | 'terms' | 'billing' | 'security' | null
  >(null);

  // Sync currentView when user signs in or out
  useEffect(() => {
    if (!loading) {
      const isAuth = !!currentUser || !!profile;
      if (isAuth && currentView === 'landing') {
        setCurrentView(profile?.role === 'admin' ? 'admin' : 'dashboard');
      } else if (!isAuth && (currentView === 'dashboard' || currentView === 'admin' || currentView === 'settings')) {
        setCurrentView('landing');
      }
    }
  }, [currentUser, profile, loading]);

  // Real-time Firestore listener with resilient local admin & sample fallback
  useEffect(() => {
    if (!currentUser) {
      if (profile) {
        const localKey = `nexislip_invoices_${profile.id}`;
        try {
          const saved = localStorage.getItem(localKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setInvoices(parsed);
              return;
            }
          }
        } catch {}

        // Initialize with realistic sample invoices so users can immediately test PDF export
        setInvoices(DEFAULT_SAMPLE_INVOICES);
        try {
          localStorage.setItem(localKey, JSON.stringify(DEFAULT_SAMPLE_INVOICES));
        } catch {}
      } else {
        setInvoices([]);
      }
      return;
    }

    const q = query(collection(db, 'invoices'), where('ownerId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Invoice[] = [];
        snapshot.forEach((doc) => {
          fetched.push(doc.data() as Invoice);
        });
        // Sort by updatedAt or createdAt desc
        fetched.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        if (fetched.length > 0) {
          setInvoices(fetched);
        } else {
          // If fresh account with zero invoices, pre-populate default samples
          setInvoices(DEFAULT_SAMPLE_INVOICES);
        }
      },
      (error) => {
        console.warn('Firestore invoice listener fallback to samples:', error);
        setInvoices(DEFAULT_SAMPLE_INVOICES);
      }
    );

    return () => unsubscribe();
  }, [currentUser, profile]);

  // Fetch daily usage from server
  const fetchQuotaStatus = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/invoices/quota-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          plan: profile?.plan || 'free',
          timezone: profile?.timezone || 'UTC',
        }),
      });
      const data = await res.json();
      if (typeof data.usedToday === 'number') {
        setDailyUsageCount(data.usedToday);
      }
    } catch (e) {
      console.warn('Quota check error:', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchQuotaStatus();
    }
  }, [currentUser, profile?.plan]);

  // Handlers
  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleCreateNewInvoice = () => {
    if (!currentUser && !profile) {
      handleOpenAuth('signin');
      return;
    }
    setActiveInvoice(null);
    setCurrentView('editor');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setActiveInvoice(invoice);
    setCurrentView('editor');
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const year = new Date().getFullYear();
    const randSuffix = Math.floor(100000 + Math.random() * 900000);
    const duplicated: Invoice = {
      ...invoice,
      id: `inv_${Date.now()}`,
      invoiceNumber: `NI-${year}-${randSuffix}`,
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActiveInvoice(duplicated);
    setCurrentView('editor');
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'invoices', invoiceId));
      } catch (e) {
        console.warn('Could not delete from Firestore:', e);
      }
    }
    setInvoices((prev) => {
      const updated = prev.filter((i) => i.id !== invoiceId);
      const localKey = profile ? `nexislip_invoices_${profile.id}` : 'nexislip_guest_invoices';
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Save invoice with server-side quota verification
  const handleSaveInvoice = async (invoiceToSave: Invoice): Promise<boolean> => {
    if (!currentUser && !profile) {
      handleOpenAuth('signin');
      return false;
    }

    const isExisting = invoices.some((inv) => inv.id === invoiceToSave.id);

    // If new invoice, enforce server quota check for free plan
    if (!isExisting && currentUser && !isUnlimited) {
      try {
        const quotaRes = await fetch('/api/invoices/record-creation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.uid,
            plan: profile?.plan || 'free',
            timezone: profile?.timezone || 'UTC',
            invoiceNumber: invoiceToSave.invoiceNumber,
          }),
        });

        const quotaData = await quotaRes.json();
        if (!quotaRes.ok || !quotaData.success) {
          throw new Error(
            quotaData.message || 'Daily limit reached: Your 3 free invoices for today have been used.'
          );
        }

        if (typeof quotaData.usedToday === 'number') {
          setDailyUsageCount(quotaData.usedToday);
        }
      } catch (e: any) {
        if (e.message?.includes('Daily limit')) throw e;
      }
    }

    const payload: Invoice = {
      ...invoiceToSave,
      ownerId: currentUser?.uid || profile?.id || 'admin',
      updatedAt: new Date().toISOString(),
    };

    // If connected to Firebase, persist to Cloud Firestore
    if (currentUser) {
      try {
        const invoiceRef = doc(db, 'invoices', invoiceToSave.id);
        await setDoc(invoiceRef, payload);

        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          invoiceCount: invoices.length + (isExisting ? 0 : 1),
        });
      } catch (e) {
        console.warn('Firestore save warning:', e);
      }
    }

    // Always update local storage & state
    const localKey = profile ? `nexislip_invoices_${profile.id}` : 'nexislip_guest_invoices';
    setInvoices((prev) => {
      const updated = isExisting
        ? prev.map((inv) => (inv.id === payload.id ? payload : inv))
        : [payload, ...prev];
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setActiveInvoice(payload);
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'faq') {
            setCurrentView('landing');
            setTimeout(() => {
              const el = document.getElementById('faq-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else if (view === 'features') {
            setCurrentView('landing');
            setTimeout(() => {
              const el = document.getElementById('features-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else if (view === 'pricing') {
            setCurrentView('landing');
            setTimeout(() => {
              const el = document.getElementById('pricing-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            setCurrentView(view);
          }
        }}
        onOpenAuth={() => handleOpenAuth('signin')}
        onOpenPricing={() => setPricingModalOpen(true)}
        onCreateInvoice={handleCreateNewInvoice}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onCreateInvoice={handleCreateNewInvoice}
            onOpenPricing={() => setPricingModalOpen(true)}
            onOpenAuth={() => handleOpenAuth('signin')}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            invoices={invoices}
            dailyUsageCount={dailyUsageCount}
            onCreateInvoice={handleCreateNewInvoice}
            onEditInvoice={handleEditInvoice}
            onDuplicateInvoice={handleDuplicateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onOpenPricing={() => setPricingModalOpen(true)}
          />
        )}

        {currentView === 'invoices' && (
          <Dashboard
            invoices={invoices}
            dailyUsageCount={dailyUsageCount}
            onCreateInvoice={handleCreateNewInvoice}
            onEditInvoice={handleEditInvoice}
            onDuplicateInvoice={handleDuplicateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onOpenPricing={() => setPricingModalOpen(true)}
          />
        )}

        {currentView === 'editor' && (
          <InvoiceEditor
            initialInvoice={activeInvoice}
            onSave={handleSaveInvoice}
            onDuplicate={handleDuplicateInvoice}
            onBack={() => setCurrentView('dashboard')}
            onOpenPricing={() => setPricingModalOpen(true)}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView onBack={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'admin' && (
          <AdminPortal onBack={() => setCurrentView('dashboard')} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenBillingPolicy={() => setLegalModalType('billing')}
        onOpenSecurity={() => setLegalModalType('security')}
        onNavigate={(v) => setCurrentView(v)}
        onOpenPricing={() => setPricingModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />

      {/* Pricing Modal View */}
      {pricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-6xl my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPricingModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
            >
              ✕
            </button>
            <PricingView onBack={() => setPricingModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Legal & Policy Modals */}
      <LegalModals
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
