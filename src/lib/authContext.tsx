'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { firestoreService, UserProfile } from './firestoreService';
import { UserPlan, getCompletedExercises, getUserPlan, saveUserPlan, setPremiumStatus } from './mockData';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  syncCompletedExercises: (completedIds: string[]) => Promise<void>;
  syncLearningPlan: (plan: UserPlan) => Promise<void>;
  syncPremiumStatus: (isPremium: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and load user from localStorage
  useEffect(() => {
    async function initAuth() {
      try {
        if (typeof window !== 'undefined') {
          const savedEmail = localStorage.getItem('drumlab_logged_in_email');
          if (savedEmail) {
            const profile = await firestoreService.getUserProfile(savedEmail);
            if (profile) {
              setUser(profile);
              
              // Sync Firestore data down to localStorage to keep them aligned
              if (profile.completedExercises) {
                localStorage.setItem('drumlab_completed', JSON.stringify(profile.completedExercises));
              }
              if (profile.isPremium !== undefined) {
                localStorage.setItem('drumlab_premium_active', profile.isPremium ? 'true' : 'false');
              }
              const dbPlan = await firestoreService.getLearningPlan(savedEmail);
              if (dbPlan) {
                localStorage.setItem('drumlab_user_plan', JSON.stringify(dbPlan));
              }
            } else {
              // If profile doesn't exist in DB anymore, clear local session
              localStorage.removeItem('drumlab_logged_in_email');
            }
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  // Login using email
  const login = async (email: string) => {
    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const profile = await firestoreService.createUserProfile(cleanEmail);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('drumlab_logged_in_email', cleanEmail);

        // Merge local data to Firestore if they exist
        const localCompleted = getCompletedExercises();
        const dbCompleted = profile.completedExercises || [];
        const mergedCompleted = Array.from(new Set([...localCompleted, ...dbCompleted]));

        const localPlan = getUserPlan();
        const dbPlan = await firestoreService.getLearningPlan(cleanEmail);
        const finalPlan = dbPlan || localPlan;

        const isPremiumLocal = localStorage.getItem('drumlab_premium_active') === 'true';
        const finalPremium = profile.isPremium || isPremiumLocal;

        // Save merged data to Firestore
        await firestoreService.saveUserProfile(cleanEmail, {
          completedExercises: mergedCompleted,
          isPremium: finalPremium
        });

        if (finalPlan) {
          await firestoreService.saveLearningPlan(cleanEmail, finalPlan);
          saveUserPlan(finalPlan);
        }

        // Save merged data back to localStorage
        localStorage.setItem('drumlab_completed', JSON.stringify(mergedCompleted));
        localStorage.setItem('drumlab_premium_active', finalPremium ? 'true' : 'false');

        // Update state
        setUser({
          ...profile,
          completedExercises: mergedCompleted,
          isPremium: finalPremium
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('drumlab_logged_in_email');
      localStorage.removeItem('drumlab_completed');
      localStorage.removeItem('drumlab_user_plan');
      localStorage.setItem('drumlab_premium_active', 'false');
    }
    setUser(null);
  };

  // Sync completed exercises list
  const syncCompletedExercises = async (completedIds: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('drumlab_completed', JSON.stringify(completedIds));
    }
    if (user) {
      try {
        await firestoreService.saveUserProfile(user.email, {
          completedExercises: completedIds
        });
        setUser(prev => prev ? { ...prev, completedExercises: completedIds } : null);
      } catch (err) {
        console.error('Error syncing completed exercises:', err);
      }
    }
  };

  // Sync learning plan
  const syncLearningPlan = async (plan: UserPlan) => {
    if (typeof window !== 'undefined') {
      saveUserPlan(plan);
    }
    if (user) {
      try {
        await firestoreService.saveLearningPlan(user.email, plan);
      } catch (err) {
        console.error('Error syncing learning plan:', err);
      }
    }
  };

  // Sync premium status
  const syncPremiumStatus = async (isPremium: boolean) => {
    setPremiumStatus(isPremium);
    if (user) {
      try {
        await firestoreService.saveUserProfile(user.email, {
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
      logout,
      syncCompletedExercises,
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
