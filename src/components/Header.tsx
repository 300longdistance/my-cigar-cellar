'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 bg-black px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* LEFT - App Name */}
        <Link href="/" className="font-cinzel text-xl text-white">
          My Cigar Cellar
        </Link>

        {/* RIGHT - Navigation */}
        <nav className="flex gap-4 text-sm text-zinc-300">
          <Link href="/" className="hover:text-amber-400">
            Home
          </Link>
          <Link href="/humidor" className="hover:text-amber-400">
            Humidor
          </Link>
          <Link href="/smoke-log" className="hover:text-amber-400">
            Log
          </Link>
          <Link href="/smokes" className="hover:text-amber-400">
            History
          </Link>
          <Link href="/pairings" className="hover:text-amber-400">
            Pairings
          </Link>
        </nav>
      </div>
    </header>
  );
}