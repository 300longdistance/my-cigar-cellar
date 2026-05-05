import { auth, db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

export function getUserId() {
  return auth.currentUser?.uid ?? null;
}

export function userCollection(collectionName: string) {
  const userId = getUserId();

  if (!userId) {
    throw new Error('User is not logged in.');
  }

  return collection(db, 'users', userId, collectionName);
}

export function userDocument(collectionName: string, documentId: string) {
  const userId = getUserId();

  if (!userId) {
    throw new Error('User is not logged in.');
  }

  return doc(db, 'users', userId, collectionName, documentId);
}

export async function saveUserDocument<T extends object>(
  collectionName: string,
  documentId: string,
  data: T
) {
  await setDoc(userDocument(collectionName, documentId), data, {
    merge: true,
  });
}

export async function deleteUserDocument(
  collectionName: string,
  documentId: string
) {
  await deleteDoc(userDocument(collectionName, documentId));
}

export async function getUserCollection<T>(collectionName: string) {
  const snapshot = await getDocs(userCollection(collectionName));

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  })) as T[];
}

export function subscribeToUserCollection<T>(
  collectionName: string,
  onData: (items: T[]) => void
) {
  return onSnapshot(userCollection(collectionName), (snapshot) => {
    const items = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    })) as T[];

    onData(items);
  });
}