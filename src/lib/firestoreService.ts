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
  xp?: number;
  level?: number;
  streak?: number;
}

/**
 * Recursively strips undefined fields from an object so Firestore SDK never rejects writes
 * with "Unsupported field value: undefined".
 */
export function sanitizeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map(item => sanitizeFirestoreData(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Timestamp)) {
    const res: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (value !== undefined) {
        res[key] = sanitizeFirestoreData(value);
      }
    }
    return res as T;
  }
  return data;
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
      await setDoc(docRef, sanitizeFirestoreData({ 
        lastLogin: now,
        displayName: profile.displayName,
        photoURL: profile.photoURL
      }), { merge: true });
    } else {
      // Create new profile - start with 0 XP and 0 streak (F19)
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
        xp: 0,
        level: 1,
        streak: 0,
      };
      await setDoc(docRef, sanitizeFirestoreData(profile));
    }

    return profile;
  },

  // Save partial user profile data (e.g. completed exercises or premium status)
  saveUserProfile: async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    if (!uid) return;
    const docRef = doc(db, 'users', uid);
    const sanitized = sanitizeFirestoreData(data);
    await setDoc(docRef, sanitized, { merge: true });
  },

  // Save user learning plan with sanitized data to prevent F01 undefined-error
  saveLearningPlan: async (uid: string, plan: UserPlan): Promise<void> => {
    if (!uid) return;
    const docRef = doc(db, 'learningPlans', uid);
    const sanitized = sanitizeFirestoreData(plan);
    await setDoc(docRef, sanitized);
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
  },

  // Idempotent completion recording (F02)
  recordExerciseCompletion: async (
    uid: string,
    exerciseId: string,
    earnedXp: number = 25,
    sessionId?: string
  ): Promise<UserProfile> => {
    if (!uid) throw new Error('UID is required');
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error('User profile does not exist');
    }
    const current = snap.data() as UserProfile;
    const completed = new Set(current.completedExercises || []);
    const isNewCompletion = !completed.has(exerciseId);
    completed.add(exerciseId);

    const now = Timestamp.now();
    const currentXp = current.xp || 0;
    const newXp = isNewCompletion ? currentXp + earnedXp : currentXp;
    const newLevel = Math.floor(newXp / 200) + 1;
    const currentStreak = current.streak || 0;
    const newStreak = isNewCompletion ? Math.max(1, currentStreak) : currentStreak;

    const updatedProfile: UserProfile = {
      ...current,
      completedExercises: Array.from(completed),
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastLogin: now,
    };

    await setDoc(docRef, sanitizeFirestoreData({
      completedExercises: updatedProfile.completedExercises,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
    }), { merge: true });

    if (sessionId) {
      const sessionRef = doc(db, `users/${uid}/sessions`, sessionId);
      await setDoc(sessionRef, sanitizeFirestoreData({
        exerciseId,
        earnedXp: isNewCompletion ? earnedXp : 0,
        completedAt: now,
        isNewCompletion,
      }));
    }

    return updatedProfile;
  },
};
