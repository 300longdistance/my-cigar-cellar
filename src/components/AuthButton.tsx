'use client';

import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function AuthButton() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserEmail(user?.email ?? null);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Supabase Google login failed:', error);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase logout failed:', error);
    }
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      {userEmail ? (
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