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
import { UserProfile, BusinessProfile, PlanType, UserRole } from '../types';

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

  const createLocalUserProfile = (
    email: string,
    displayName?: string,
    role: UserRole = 'user'
  ): UserProfile => {
    const isTargetAdmin = role === 'admin' || isAdminEmail(email);
    return {
      id: isTargetAdmin
        ? 'admin-nexislip-master'
        : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: email,
      displayName: displayName || (isTargetAdmin ? 'NexiSlip Administrator' : email.split('@')[0] || 'User'),
      photoURL: '',
      role: isTargetAdmin ? 'admin' : 'user',
      plan: isTargetAdmin ? 'enterprise_admin' : 'free',
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
        businessName: isTargetAdmin
          ? 'NexiSlip Admin HQ'
          : displayName
          ? `${displayName}'s Studio`
          : 'My Business',
        sellerName: isTargetAdmin ? 'System Administrator' : displayName || 'Business Owner',
        email: email,
        phone: '',
        address: '',
        defaultCurrency: 'USD',
        defaultTerms: 'Due upon receipt. Thank you for your business!',
        defaultTaxRate: 0,
        defaultTemplate: 'modern',
      },
    };
  };

  const loginAsLocalAdmin = () => {
    const adminProf = createAdminProfile();
    setProfile(adminProf);
    try {
      localStorage.setItem('nexislip_local_admin_session', JSON.stringify(adminProf));
      localStorage.removeItem('nexislip_local_user_session');
    } catch {}
  };

  const loginAsLocalUser = (userProf: UserProfile) => {
    setProfile(userProf);
    try {
      localStorage.setItem('nexislip_local_user_session', JSON.stringify(userProf));
      localStorage.removeItem('nexislip_local_admin_session');
    } catch {}
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          localStorage.removeItem('nexislip_local_admin_session');
          localStorage.removeItem('nexislip_local_user_session');
        } catch {}
        await syncUserProfile(user);
      } else {
        try {
          const savedAdmin = localStorage.getItem('nexislip_local_admin_session');
          const savedUser = localStorage.getItem('nexislip_local_user_session');
          if (savedAdmin) {
            setProfile(JSON.parse(savedAdmin));
          } else if (savedUser) {
            setProfile(JSON.parse(savedUser));
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
        localStorage.removeItem('nexislip_local_user_session');
      } catch {}
      await syncUserProfile(cred.user);
    } catch (err: any) {
      const isOpNotAllowed =
        err?.code === 'auth/operation-not-allowed' ||
        err?.message?.includes('operation-not-allowed');

      // Seamless fallback if Firebase email/password provider is not toggled in console
      if (isOpNotAllowed) {
        if (isTargetAdmin) {
          if (pass === ADMIN_CREDENTIALS.password) {
            loginAsLocalAdmin();
            return;
          } else {
            throw new Error('Invalid email or password. Please verify your credentials.');
          }
        }

        // Check if regular user already created a local account
        try {
          const stored = localStorage.getItem('nexislip_local_accounts');
          const accounts: Array<{ email: string; pass: string; profile: UserProfile }> = stored
            ? JSON.parse(stored)
            : [];
          const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
          if (existing) {
            if (existing.pass && existing.pass !== pass) {
              throw new Error('Invalid email or password. Please verify your credentials.');
            }
            loginAsLocalUser(existing.profile);
            return;
          }
        } catch (e: any) {
          if (e.message?.includes('Invalid email or password')) throw e;
        }

        if (pass.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        // Auto-provision user session so they are not blocked
        const newProfile = createLocalUserProfile(cleanEmail);
        try {
          const stored = localStorage.getItem('nexislip_local_accounts');
          const accounts: Array<{ email: string; pass: string; profile: UserProfile }> = stored
            ? JSON.parse(stored)
            : [];
          accounts.push({ email: cleanEmail, pass, profile: newProfile });
          localStorage.setItem('nexislip_local_accounts', JSON.stringify(accounts));
        } catch {}

        loginAsLocalUser(newProfile);
        return;
      }

      if (
        isTargetAdmin &&
        (err?.code === 'auth/user-not-found' ||
          err?.code === 'auth/invalid-credential' ||
          err?.message?.includes('user-not-found') ||
          err?.message?.includes('invalid-credential'))
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, pass);
          await syncUserProfile(cred.user);
          return;
        } catch (createErr: any) {
          if (
            createErr?.code === 'auth/operation-not-allowed' ||
            createErr?.message?.includes('operation-not-allowed')
          ) {
            if (pass === ADMIN_CREDENTIALS.password) {
              loginAsLocalAdmin();
              return;
            }
          }
          throw createErr;
        }
      }

      throw err;
    }
  };

  const signUp = async (email: string, pass: string, displayName?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const isTargetAdmin = isAdminEmail(cleanEmail);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      const isOpNotAllowed =
        err?.code === 'auth/operation-not-allowed' ||
        err?.message?.includes('operation-not-allowed');

      if (isOpNotAllowed) {
        if (isTargetAdmin) {
          loginAsLocalAdmin();
          return;
        }

        const newProfile = createLocalUserProfile(cleanEmail, displayName);
        try {
          const stored = localStorage.getItem('nexislip_local_accounts');
          const accounts: Array<{ email: string; pass: string; profile: UserProfile }> = stored
            ? JSON.parse(stored)
            : [];
          const idx = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);
          if (idx >= 0) {
            accounts[idx] = { email: cleanEmail, pass, profile: newProfile };
          } else {
            accounts.push({ email: cleanEmail, pass, profile: newProfile });
          }
          localStorage.setItem('nexislip_local_accounts', JSON.stringify(accounts));
        } catch {}

        loginAsLocalUser(newProfile);
        return;
      }

      throw err;
    }
  };

  const signInGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    try {
      localStorage.removeItem('nexislip_local_admin_session');
      localStorage.removeItem('nexislip_local_user_session');
    } catch {}
    await syncUserProfile(cred.user);
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('nexislip_local_admin_session');
      localStorage.removeItem('nexislip_local_user_session');
    } catch {}
    await fbSignOut(auth);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateBusinessProfile = async (businessData: Partial<BusinessProfile>) => {
    if (!profile) return;
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

    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          businessProfile: updated,
          updatedAt: new Date().toISOString(),
        });
      } catch {}
    }

    const updatedProfile = {
      ...profile,
      businessProfile: updated,
    };
    setProfile(updatedProfile);

    if (!currentUser) {
      const sessionKey =
        profile.role === 'admin'
          ? 'nexislip_local_admin_session'
          : 'nexislip_local_user_session';
      try {
        localStorage.setItem(sessionKey, JSON.stringify(updatedProfile));
      } catch {}
    }
  };

  const updateUserPlan = async (newPlan: PlanType) => {
    if (!profile) return;
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          plan: newPlan,
          subscriptionStatus: 'active',
          subscriptionStartedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch {}
    }

    const updatedProfile: UserProfile = {
      ...profile,
      plan: newPlan,
      subscriptionStatus: 'active',
    };
    setProfile(updatedProfile);

    if (!currentUser) {
      const sessionKey =
        profile.role === 'admin'
          ? 'nexislip_local_admin_session'
          : 'nexislip_local_user_session';
      try {
        localStorage.setItem(sessionKey, JSON.stringify(updatedProfile));
      } catch {}
    }
  };

  const deleteAccount = async () => {
    if (currentUser) {
      try {
        await deleteUser(currentUser);
      } catch {}
    }
    try {
      localStorage.removeItem('nexislip_local_admin_session');
      localStorage.removeItem('nexislip_local_user_session');
    } catch {}
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
