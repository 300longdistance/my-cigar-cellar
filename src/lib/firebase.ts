import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
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
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);