import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, BusinessProfile, PlanType } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isUnlimited: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, displayName?: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateBusinessProfile: (businessData: Partial<BusinessProfile>) => Promise<void>;
  updateUserPlan: (plan: PlanType) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginAsLocalAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isUnlimited: false,
  signIn: async () => {},
  signUp: async () => {},
  signInGoogle: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateBusinessProfile: async () => {},
  updateUserPlan: async () => {},
  deleteAccount: async () => {},
  refreshProfile: async () => {},
  loginAsLocalAdmin: () => {},
});

export const ADMIN_CREDENTIALS = {
  email: 'admin@nexislip.com',
  password: 'NexiSlip@Admin2026',
};

export const ADMIN_EMAILS = [
  'admin@nexislip.com',
  'sachithakaumina0@gmail.com',
];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync or bootstrap user profile
  const syncUserProfile = async (fbUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      const isConfiguredAdmin = isAdminEmail(fbUser.email);

      if (!userSnap.exists()) {
        const initialProfile: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          photoURL: fbUser.photoURL || '',
          role: isConfiguredAdmin ? 'admin' : 'user',
          plan: isConfiguredAdmin ? 'enterprise_admin' : 'free',
          subscriptionStatus: 'active',
          subscriptionStartedAt: new Date().toISOString(),
          invoiceCount: 0,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          themePreference: 'light',
          lastLoginAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          businessProfile: {
            businessName: fbUser.displayName ? `${fbUser.displayName}'s Studio` : 'My Business',
            sellerName: fbUser.displayName || 'Business Owner',
            email: fbUser.email || '',
            phone: '',
            address: '',
            defaultCurrency: 'USD',
            defaultTerms: 'Due upon receipt. Thank you for your business!',
            defaultTaxRate: 0,
            defaultTemplate: 'modern',
          },
        };

        await setDoc(userRef, initialProfile);
        setProfile(initialProfile);

        // Register in admins collection if configured
        if (isConfiguredAdmin) {
          try {
            await setDoc(doc(db, 'admins', fbUser.uid), {
              email: fbUser.email,
              role: 'admin',
              grantedAt: new Date().toISOString(),
            });
          } catch (e) {
            console.warn('Could not write to admins collection:', e);
          }
        }
      } else {
        const data = userSnap.data() as UserProfile;
        // Check if admin should be updated to Enterprise Admin
        if (isConfiguredAdmin && (data.role !== 'admin' || data.plan !== 'enterprise_admin')) {
          data.role = 'admin';
          data.plan = 'enterprise_admin';
          data.subscriptionStatus = 'active';
          await updateDoc(userRef, {
            role: 'admin',
            plan: 'enterprise_admin',
            subscriptionStatus: 'active',
            updatedAt: new Date().toISOString(),
          });
          try {
            await setDoc(doc(db, 'admins', fbUser.uid), {
              email: fbUser.email,
              role: 'admin',
              grantedAt: new Date().toISOString(),
            });
          } catch {}
        }

        // Update lastLoginAt
        await updateDoc(userRef, {
          lastLoginAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        });

        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching or creating user profile in Firestore:', err);
      // Fallback local profile if offline or permission denied
      const isConfiguredAdmin = isAdminEmail(fbUser.email);
      setProfile({
        id: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || (isAdminEmail(fbUser.email) ? 'NexiSlip Admin' : 'User'),
        role: isConfiguredAdmin ? 'admin' : 'user',
        plan: isConfiguredAdmin ? 'enterprise_admin' : 'free',
        subscriptionStatus: 'active',
        invoiceCount: 0,
        timezone: 'UTC',
        themePreference: 'light',
        lastLoginAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const createAdminProfile = (): UserProfile => ({
    id: 'admin-nexislip-master',
    email: ADMIN_CREDENTIALS.email,
    displayName: 'NexiSlip Administrator',
    photoURL: '',
    role: 'admin',
    plan: 'enterprise_admin',
    subscriptionStatus: 'active',
    subscriptionStartedAt: new Date().toISOString(),
    invoiceCount: 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    themePreference: 'light',
    lastLoginAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    businessProfile: {
      businessName: 'NexiSlip Admin HQ',
      sellerName: 'System Administrator',
      email: ADMIN_CREDENTIALS.email,
      phone: '',
      address: '',
      defaultCurrency: 'USD',
      defaultTerms: 'Due upon receipt.',
      defaultTaxRate: 0,
      defaultTemplate: 'modern',
    },
  });

  const loginAsLocalAdmin = () => {
    const adminProf = createAdminProfile();
    setProfile(adminProf);
    try {
      localStorage.setItem('nexislip_local_admin_session', JSON.stringify(adminProf));
    } catch {}
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          localStorage.removeItem('nexislip_local_admin_session');
        } catch {}
        await syncUserProfile(user);
      } else {
        try {
          const savedSession = localStorage.getItem('nexislip_local_admin_session');
          if (savedSession) {
            setProfile(JSON.parse(savedSession));
          } else {
            setProfile(null);
          }
        } catch {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Heartbeat presence listener
  useEffect(() => {
    if (!currentUser || !profile) return;

    const sendHeartbeat = () => {
      fetch('/api/presence/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          email: currentUser.email,
          role: profile.role,
          plan: profile.plan,
        }),
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000); // every 60s
    return () => clearInterval(interval);
  }, [currentUser, profile?.role, profile?.plan]);

  const signIn = async (email: string, pass: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const isTargetAdmin = isAdminEmail(cleanEmail);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      try {
        localStorage.removeItem('nexislip_local_admin_session');
      } catch {}
      await syncUserProfile(cred.user);
    } catch (err: any) {
      const isOpNotAllowed =
        err?.code === 'auth/operation-not-allowed' ||
        err?.message?.includes('operation-not-allowed');

      if (
        isTargetAdmin &&
        (err?.code === 'auth/user-not-found' ||
          err?.code === 'auth/invalid-credential' ||
          err?.message?.includes('user-not-found') ||
          err?.message?.includes('invalid-credential'))
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, pass);
          try {
            localStorage.removeItem('nexislip_local_admin_session');
          } catch {}
          await syncUserProfile(cred.user);
          return;
        } catch (createErr: any) {
          if (createErr?.code === 'auth/email-already-in-use') {
            throw err;
          }
          if (
            createErr?.code === 'auth/operation-not-allowed' ||
            createErr?.message?.includes('operation-not-allowed')
          ) {
            // Firebase Email/Password provider is disabled in Firebase Console
            loginAsLocalAdmin();
            return;
          }
          throw createErr;
        }
      }

      if (isTargetAdmin && isOpNotAllowed) {
        // Fall back gracefully to administrator session
        loginAsLocalAdmin();
        return;
      }

      throw err;
    }
  };

  const signUp = async (email: string, pass: string, displayName?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      if (
        err?.code === 'auth/operation-not-allowed' ||
        err?.message?.includes('operation-not-allowed')
      ) {
        const cleanEmail = email.toLowerCase().trim();
        if (isAdminEmail(cleanEmail)) {
          loginAsLocalAdmin();
          return;
        }
      }
      throw err;
    }
  };

  const signInGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    try {
      localStorage.removeItem('nexislip_local_admin_session');
    } catch {}
    await syncUserProfile(cred.user);
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('nexislip_local_admin_session');
    } catch {}
    await fbSignOut(auth);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateBusinessProfile = async (businessData: Partial<BusinessProfile>) => {
    if (!currentUser || !profile) return;
    const updated = {
      ...(profile.businessProfile || {
        businessName: '',
        sellerName: '',
        email: '',
        phone: '',
        address: '',
        defaultCurrency: 'USD',
        defaultTerms: '',
        defaultTaxRate: 0,
        defaultTemplate: 'modern' as const,
      }),
      ...businessData,
    };

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      businessProfile: updated,
      updatedAt: new Date().toISOString(),
    });

    setProfile({
      ...profile,
      businessProfile: updated,
    });
  };

  const updateUserPlan = async (newPlan: PlanType) => {
    if (!currentUser || !profile) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      plan: newPlan,
      subscriptionStatus: 'active',
      subscriptionStartedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setProfile({
      ...profile,
      plan: newPlan,
      subscriptionStatus: 'active',
    });
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    await deleteUser(currentUser);
    setProfile(null);
    setCurrentUser(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await syncUserProfile(currentUser);
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.plan === 'enterprise_admin';
  const isUnlimited =
    profile?.plan === 'enterprise_admin' ||
    profile?.plan === 'monthly_pro' ||
    profile?.plan === 'annual_pro';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        isAdmin,
        isUnlimited,
        signIn,
        signUp,
        signInGoogle,
        signOut,
        resetPassword,
        updateBusinessProfile,
        updateUserPlan,
        deleteAccount,
        refreshProfile,
        loginAsLocalAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
