import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { UserPlan } from './mockData';

export interface UserProfile {
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: Timestamp;
  lastLogin: Timestamp;
  completedExercises?: string[];
  isPremium?: boolean;
}

export const firestoreService = {
  // Get user profile by email
  getUserProfile: async (email: string): Promise<UserProfile | null> => {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    const docRef = doc(db, 'users', cleanEmail);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  },

  // Create or update user profile
  createUserProfile: async (email: string, displayName?: string): Promise<UserProfile> => {
    const cleanEmail = email.toLowerCase().trim();
    const docRef = doc(db, 'users', cleanEmail);
    const docSnap = await getDoc(docRef);
    
    const now = Timestamp.now();
    const defaultDisplayName = displayName || cleanEmail.split('@')[0];
    const role = cleanEmail === 'carstenlysdal@gmail.com' ? 'admin' : 'user';

    let profile: UserProfile;

    if (docSnap.exists()) {
      // Update last login
      const existing = docSnap.data() as UserProfile;
      profile = {
        ...existing,
        lastLogin: now,
      };
      await setDoc(docRef, { lastLogin: now }, { merge: true });
    } else {
      // Create new profile
      profile = {
        email: cleanEmail,
        displayName: defaultDisplayName,
        role,
        createdAt: now,
        lastLogin: now,
        completedExercises: [],
        isPremium: false,
      };
      await setDoc(docRef, profile);
    }

    return profile;
  },

  // Save partial user profile data (e.g. completed exercises or premium status)
  saveUserProfile: async (email: string, data: Partial<UserProfile>): Promise<void> => {
    if (!email) return;
    const cleanEmail = email.toLowerCase().trim();
    const docRef = doc(db, 'users', cleanEmail);
    await setDoc(docRef, data, { merge: true });
  },

  // Save user learning plan
  saveLearningPlan: async (email: string, plan: UserPlan): Promise<void> => {
    if (!email) return;
    const cleanEmail = email.toLowerCase().trim();
    const docRef = doc(db, 'learningPlans', cleanEmail);
    await setDoc(docRef, plan);
  },

  // Get user learning plan
  getLearningPlan: async (email: string): Promise<UserPlan | null> => {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    const docRef = doc(db, 'learningPlans', cleanEmail);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserPlan;
    }
    return null;
  }
};
