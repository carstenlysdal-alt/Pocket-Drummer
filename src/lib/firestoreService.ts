import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { UserPlan } from './mockData';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: 'user' | 'admin';
  createdAt: Timestamp;
  lastLogin: Timestamp;
  completedExercises?: string[];
  isPremium?: boolean;
}

export const firestoreService = {
  // Get user profile by UID
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    if (!uid) return null;
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  },

  // Create or update user profile by UID
  createUserProfile: async (uid: string, email: string, displayName?: string, photoURL?: string | null): Promise<UserProfile> => {
    if (!uid) throw new Error('UID is required to create a profile');
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    const now = Timestamp.now();
    const cleanEmail = email.toLowerCase().trim();
    const defaultDisplayName = displayName || cleanEmail.split('@')[0] || 'Trommeslager';
    const role = cleanEmail === 'carstenlysdal@gmail.com' ? 'admin' : 'user';

    let profile: UserProfile;

    if (docSnap.exists()) {
      // Update last login and potentially photoURL / displayName if updated
      const existing = docSnap.data() as UserProfile;
      profile = {
        ...existing,
        lastLogin: now,
        displayName: displayName || existing.displayName,
        photoURL: photoURL || existing.photoURL || null,
      };
      await setDoc(docRef, { 
        lastLogin: now,
        displayName: profile.displayName,
        photoURL: profile.photoURL
      }, { merge: true });
    } else {
      // Create new profile
      profile = {
        uid,
        email: cleanEmail,
        displayName: defaultDisplayName,
        photoURL: photoURL || null,
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
  saveUserProfile: async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    if (!uid) return;
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, data, { merge: true });
  },

  // Save user learning plan
  saveLearningPlan: async (uid: string, plan: UserPlan): Promise<void> => {
    if (!uid) return;
    const docRef = doc(db, 'learningPlans', uid);
    await setDoc(docRef, plan);
  },

  // Get user learning plan
  getLearningPlan: async (uid: string): Promise<UserPlan | null> => {
    if (!uid) return null;
    const docRef = doc(db, 'learningPlans', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserPlan;
    }
    return null;
  }
};
