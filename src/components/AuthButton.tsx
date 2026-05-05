'use client';

import { auth, provider } from '@/lib/firebase';
import {
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
  User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

function shouldUseRedirect() {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isAppleMobile =
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  return isAppleMobile;
}

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error('Google redirect login failed:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (shouldUseRedirect()) {
      await signInWithRedirect(auth, provider);
      return;
    }

    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="fixed right-4 top-4 z-50">
      {user ? (
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-[#c8882d] px-4 py-2 text-black"
        >
          Logout
        </button>
      ) : (
        <button
          type="button"
          onClick={handleLogin}
          className="rounded-lg bg-[#c8882d] px-4 py-2 text-black"
        >
          Login with Google
        </button>
      )}
    </div>
  );
}