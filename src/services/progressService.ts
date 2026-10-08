import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

const COLLECTION = 'strands-progress';

export type SavedProgress = {
  completedThemeIds: string[];
  bestScores: Record<string, number>;
};

export async function loadCloudProgress(user: User): Promise<SavedProgress | null> {
  const ref = doc(db, COLLECTION, user.uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    completedThemeIds: Array.isArray(data.completedThemeIds) ? data.completedThemeIds : [],
    bestScores: data.bestScores && typeof data.bestScores === 'object' ? data.bestScores : {},
  };
}

export async function saveCloudProgress(
  user: User,
  completedThemeIds: string[],
  bestScores: Record<string, number>,
) {
  const ref = doc(db, COLLECTION, user.uid);
  await setDoc(
    ref,
    {
      userId: user.uid,
      completedThemeIds,
      bestScores,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
