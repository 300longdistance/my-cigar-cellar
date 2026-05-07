'use client';

import Link from 'next/link';
import { useCigarApp } from '@/context/CigarAppContext';

export default function BackupPage() {
  const {
    hasLoadedStorage,
    humidors,
    cigars,
    smokeLogs,
    reflections,
    wishList,
    pairingTypes,
    pairingLogs,
    quickLogSelection,
  } = useCigarApp();

  function downloadBackup() {
    const backupData = {
      exportedAt: new Date().toISOString(),
      app: 'My Cigar Cellar',
      version: 1,
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

    const file = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(file);
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
          <h1 className="font-cinzel text-3xl text-[#d58a24]">
            Backup My Cigar Cellar
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/70">
            Download a local JSON backup of your current humidors, cigars,
            smoke logs, wish list, pairings, and notes.
          </p>

          <div className="mt-6 grid gap-3 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
            <div>Humidors: {humidors.length}</div>
            <div>Cigars: {cigars.length}</div>
            <div>Smoke Logs: {smokeLogs.length}</div>
            <div>Wish List Items: {wishList.length}</div>
            <div>Pairing Types: {pairingTypes.length}</div>
            <div>Pairing Logs: {pairingLogs.length}</div>
          </div>

          <button
            type="button"
            onClick={downloadBackup}
            disabled={!hasLoadedStorage}
            className="mt-6 rounded-xl bg-[#d58a24] px-5 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Download Backup
          </button>
        </section>
      </div>
    </main>
  );
}