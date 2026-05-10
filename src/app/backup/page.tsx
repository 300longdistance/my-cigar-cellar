'use client';

import Link from 'next/link';
import { useCigarApp } from '@/context/CigarAppContext';

export default function BackupPage() {
  const {
    hasLoadedStorage,
    user,
    humidors,
    cigars,
    smokeLogs,
    reflections,
    wishList,
    pairingTypes,
    pairingLogs,
    quickLogSelection,
  } = useCigarApp();

  function downloadJsonBackup() {
    const backup = {
      app: 'My Cigar Cellar',
      backupVersion: 2,
      exportedAt: new Date().toISOString(),
      userEmail: user?.email ?? null,
      data: {
        humidors,
        cigars,
        smokeLogs,
        reflections,
        wishList,
        pairingTypes,
        pairingLogs,
        quickLogSelection,
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `my-cigar-cellar-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex rounded-full border border-[#3a2a0f] bg-black/60 px-4 py-2 text-sm text-[#d58a24]"
        >
          ← Back Home
        </Link>

        <section className="mt-8 rounded-2xl border border-[#3a2a0f] bg-[#111111] p-6 shadow-2xl">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[#c8821f]">
            Backup
          </div>

          <h1 className="mt-2 font-cinzel text-3xl text-[#d58a24]">
            My Cigar Cellar Backup
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/70">
            Download a JSON backup of your current humidors, cigars, smoke logs,
            reflections, wish list, pairings, and local selection state.
          </p>

          <div className="mt-6 grid gap-3 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
            <div>Signed in: {user?.email ?? 'Not signed in'}</div>
            <div>Humidors: {humidors.length}</div>
            <div>Cigars: {cigars.length}</div>
            <div>Smoke Logs: {smokeLogs.length}</div>
            <div>Reflections: {Object.keys(reflections).length}</div>
            <div>Wish List Items: {wishList.length}</div>
            <div>Pairing Types: {pairingTypes.length}</div>
            <div>Pairing Logs: {pairingLogs.length}</div>
          </div>

          <button
            type="button"
            onClick={downloadJsonBackup}
            disabled={!hasLoadedStorage}
            className="mt-6 rounded-xl bg-[#d58a24] px-5 py-3 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Download JSON Backup
          </button>
        </section>
      </div>
    </main>
  );
}