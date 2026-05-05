'use client';

import { auth, provider } from '@/lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {user ? (
        <button
          onClick={handleLogout}
          className="rounded-lg bg-[#c8882d] px-4 py-2 text-black"
        >
          Logout
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="rounded-lg bg-[#c8882d] px-4 py-2 text-black"
        >
          Login with Google
        </button>
      )}
    </div>
  );
}