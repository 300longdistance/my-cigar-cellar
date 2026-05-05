import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCjB8vcgP6T7i4rNkvkNUNoTHkgG5QRgU4",
  authDomain: "my-cigar-cellar.firebaseapp.com",
  projectId: "my-cigar-cellar",
  storageBucket: "my-cigar-cellar.firebasestorage.app",
  messagingSenderId: "1035238542027",
  appId: "1:1035238542027:web:11c42c88a2f88db8d2694e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set Firebase auth persistence:', error);
});

export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account',
});

export const db = getFirestore(app);