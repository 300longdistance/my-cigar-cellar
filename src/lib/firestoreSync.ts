import { auth, db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

export function getUserId() {
  return auth.currentUser?.uid ?? null;
}

export function userAppDataDocument() {
  const userId = getUserId();

  if (!userId) {
    throw new Error('User is not logged in.');
  }

  return doc(db, 'users', userId, 'appData', 'main');
}

export async function saveUserAppData<T extends object>(data: T) {
  await setDoc(userAppDataDocument(), data, {
    merge: true,
  });
}

export async function getUserAppData<T>() {
  const snapshot = await getDoc(userAppDataDocument());

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as T;
}

export function subscribeToUserAppData<T>(
  onData: (data: T | null) => void
) {
  return onSnapshot(userAppDataDocument(), (snapshot) => {
    if (!snapshot.exists()) {
      onData(null);
      return;
    }

    onData(snapshot.data() as T);
  });
}