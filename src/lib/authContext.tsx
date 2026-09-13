'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { firestoreService, UserProfile } from './firestoreService';
import { UserPlan, getCompletedExercises, getUserPlan, saveUserPlan, setPremiumStatus } from './mockData';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: () => Promise<string>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  syncCompletedExercises: (completedIds: string[]) => Promise<void>;
  completeExercise: (exerciseId: string, earnedXp?: number, sessionId?: string) => Promise<void>;
  syncLearningPlan: (plan: UserPlan, uidOverride?: string) => Promise<void>;
  syncPremiumStatus: (isPremium: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor real Firebase Authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const email = firebaseUser.email || '';
          const uid = firebaseUser.uid;
          const displayName = firebaseUser.displayName || email.split('@')[0] || 'Trommeslager';
          const photoURL = firebaseUser.photoURL;

          // Fetch profile from db (under /users/{uid}) or create it
          const profile = await firestoreService.createUserProfile(uid, email, displayName, photoURL);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('pocketdrummer_logged_in_email', email);
            localStorage.setItem('pocketdrummer_logged_in_uid', uid);

            // Merge local guest storage data into Firestore (so exercises completed logged-out aren't lost)
            const localCompleted = getCompletedExercises();
            const dbCompleted = profile.completedExercises || [];
            const mergedCompleted = Array.from(new Set([...localCompleted, ...dbCompleted]));

            const localPlan = getUserPlan();
            const dbPlan = await firestoreService.getLearningPlan(uid);
            const finalPlan = dbPlan || localPlan;

            const isPremiumLocal = localStorage.getItem('pocketdrummer_premium_active') === 'true';
            const finalPremium = typeof profile.isPremium === 'boolean' ? profile.isPremium : isPremiumLocal;

            // Sync to Firestore without overwriting server authority
            await firestoreService.saveUserProfile(uid, {
              completedExercises: mergedCompleted
            });

            if (finalPlan) {
              await firestoreService.saveLearningPlan(uid, finalPlan);
              saveUserPlan(finalPlan);
            }

            // Sync UID-scoped storage
            localStorage.setItem(`pocketdrummer_${uid}_completed`, JSON.stringify(mergedCompleted));
            localStorage.setItem('pocketdrummer_completed', JSON.stringify(mergedCompleted));
            localStorage.setItem('pocketdrummer_premium_active', finalPremium ? 'true' : 'false');

            setUser({
              ...profile,
              completedExercises: mergedCompleted,
              isPremium: finalPremium
            });
          }
        } else {
          // Explicit sign-out
          setUser(null);
          if (typeof window !== 'undefined') {
            const lastUid = localStorage.getItem('pocketdrummer_logged_in_uid');
            if (lastUid) {
              localStorage.removeItem(`pocketdrummer_${lastUid}_completed`);
              localStorage.removeItem(`pocketdrummer_${lastUid}_plan`);
            }
            localStorage.removeItem('pocketdrummer_logged_in_email');
            localStorage.removeItem('pocketdrummer_logged_in_uid');
            localStorage.removeItem('pocketdrummer_completed');
            localStorage.removeItem('pocketdrummer_user_plan');
            localStorage.removeItem('pocketdrummer_exercise_progress');
            localStorage.setItem('pocketdrummer_premium_active', 'false');
          }
        }
      } catch (err) {
        console.error('Error during Auth state change handler:', err);
        if (firebaseUser) {
          const now = Timestamp.now();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Trommeslager',
            photoURL: firebaseUser.photoURL,
            role: firebaseUser.email === 'carstenlysdal@gmail.com' ? 'admin' : 'user',
            createdAt: now,
            lastLogin: now,
            completedExercises: [],
            isPremium: false,
            xp: 0,
            level: 1,
            streak: 0,
          });
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Login using Google popup
  const login = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user.uid;
    } catch (err) {
      console.error('Google sign-in popup error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Opret konto med email og password
  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
    } catch (err) {
      console.error('Email sign-up error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Log ind med email og password
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Email sign-in error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Nulstil kodeord
  const resetPassword = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/login`,
        handleCodeInApp: false,
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
    } catch (err) {
      console.error('Password reset error:', err);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync completed exercises list
  const syncCompletedExercises = async (completedIds: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pocketdrummer_completed', JSON.stringify(completedIds));
      if (user) {
        localStorage.setItem(`pocketdrummer_${user.uid}_completed`, JSON.stringify(completedIds));
      }
    }
    if (user) {
      try {
        await firestoreService.saveUserProfile(user.uid, {
          completedExercises: completedIds
        });
        setUser(prev => prev ? { ...prev, completedExercises: completedIds } : null);
      } catch (err) {
        console.error('Error syncing completed exercises:', err);
      }
    }
  };

  // Unified idempotent exercise completion (F02)
  const completeExercise = async (exerciseId: string, earnedXp: number = 25, sessionId?: string) => {
    if (user) {
      try {
        const updated = await firestoreService.recordExerciseCompletion(user.uid, exerciseId, earnedXp, sessionId);
        setUser(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`pocketdrummer_${user.uid}_completed`, JSON.stringify(updated.completedExercises || []));
          localStorage.setItem('pocketdrummer_completed', JSON.stringify(updated.completedExercises || []));
        }
      } catch (err) {
        console.error('Error recording exercise completion in Firestore:', err);
        // Fallback local update
        const currentList = user.completedExercises || [];
        if (!currentList.includes(exerciseId)) {
          const newList = [...currentList, exerciseId];
          const newXp = (user.xp || 0) + earnedXp;
          const newProfile: UserProfile = {
            ...user,
            completedExercises: newList,
            xp: newXp,
            level: Math.floor(newXp / 200) + 1,
            streak: Math.max(1, user.streak || 0),
          };
          setUser(newProfile);
          if (typeof window !== 'undefined') {
            localStorage.setItem('pocketdrummer_completed', JSON.stringify(newList));
          }
        }
      }
    } else {
      // Guest completion
      if (typeof window !== 'undefined') {
        const local = getCompletedExercises();
        if (!local.includes(exerciseId)) {
          const updated = [...local, exerciseId];
          localStorage.setItem('pocketdrummer_completed', JSON.stringify(updated));
          const currentGuestXp = Number(localStorage.getItem('pocketdrummer_guest_xp') || '0');
          localStorage.setItem('pocketdrummer_guest_xp', String(currentGuestXp + earnedXp));
        }
      }
    }
  };

  // Sync learning plan
  const syncLearningPlan = async (plan: UserPlan, uidOverride?: string) => {
    if (typeof window !== 'undefined') {
      saveUserPlan(plan);
    }
    const targetUid = uidOverride || user?.uid;
    if (targetUid) {
      try {
        await firestoreService.saveLearningPlan(targetUid, plan);
      } catch (err) {
        console.error('Error syncing learning plan to Firestore:', err);
        throw err; // Re-throw so callers are aware of cloud persistence failure (F01)
      }
    }
  };

  // Sync premium status
  const syncPremiumStatus = async (isPremium: boolean) => {
    setPremiumStatus(isPremium);
    if (user) {
      try {
        await firestoreService.saveUserProfile(user.uid, {
          isPremium
        });
        setUser(prev => prev ? { ...prev, isPremium } : null);
      } catch (err) {
        console.error('Error syncing premium status:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signUpWithEmail,
      signInWithEmail,
      resetPassword,
      logout,
      syncCompletedExercises,
      completeExercise,
      syncLearningPlan,
      syncPremiumStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
