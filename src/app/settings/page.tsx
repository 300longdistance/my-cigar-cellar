'use client';

import Link from 'next/link';
import { ChangeEvent, useState } from 'react';
import AuthButton from '@/components/AuthButton';
import { useCigarApp } from '@/context/CigarAppContext';
import { saveSupabaseCigars } from '@/lib/supabaseCigars';
import { saveSupabaseHumidors } from '@/lib/supabaseHumidors';
import { saveSupabaseSmokeLogs } from '@/lib/supabaseSmokeLogs';
import { saveSupabasePairingTypes } from '@/lib/supabasePairingTypes';
import { saveSupabasePairingLogs } from '@/lib/supabasePairingLogs';
import { saveSupabaseWishList } from '@/lib/supabaseWishList';
import { saveSupabaseReflections } from '@/lib/supabaseReflections';

export default function SettingsPage() {
  const {
    hasLoadedStorage,
    user,
    humidors,
    setHumidors,
    cigars,
    setCigars,
    smokeLogs,
    setSmokeLogs,
    reflections,
    setReflections,
    wishList,
    setWishList,
    pairingTypes,
    setPairingTypes,
    pairingLogs,
    setPairingLogs,
    quickLogSelection,
    setQuickLogSelection,
  } = useCigarApp();

  const [importMessage, setImportMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  function downloadJsonBackup() {
    const backup = {
      app: 'My Cigar Cellar',
      backupVersion: 3,
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

  async function handleImportBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setIsImporting(true);
    setImportMessage('Importing backup...');

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed?.data) {
        throw new Error('Invalid backup file');
      }

      const data = parsed.data;

      const nextHumidors = Array.isArray(data.humidors) ? data.humidors : [];
      const nextCigars = Array.isArray(data.cigars) ? data.cigars : [];
      const nextSmokeLogs = Array.isArray(data.smokeLogs) ? data.smokeLogs : [];
      const nextReflections = data.reflections ?? {};
      const nextWishList = Array.isArray(data.wishList) ? data.wishList : [];
      const nextPairingTypes = Array.isArray(data.pairingTypes)
        ? data.pairingTypes
        : [];
      const nextPairingLogs = Array.isArray(data.pairingLogs)
        ? data.pairingLogs
        : [];
      const nextQuickLogSelection = data.quickLogSelection ?? null;

      setHumidors(nextHumidors);
      setCigars(nextCigars);
      setSmokeLogs(nextSmokeLogs);
      setReflections(nextReflections);
      setWishList(nextWishList);
      setPairingTypes(nextPairingTypes);
      setPairingLogs(nextPairingLogs);
      setQuickLogSelection(nextQuickLogSelection);

      localStorage.setItem('humidors', JSON.stringify(nextHumidors));
      localStorage.setItem('cigars', JSON.stringify(nextCigars));
      localStorage.setItem('smokeLogs', JSON.stringify(nextSmokeLogs));
      localStorage.setItem('smokeReflections', JSON.stringify(nextReflections));
      localStorage.setItem('wishList', JSON.stringify(nextWishList));
      localStorage.setItem('pairingTypes', JSON.stringify(nextPairingTypes));
      localStorage.setItem('pairingLogs', JSON.stringify(nextPairingLogs));

      if (nextQuickLogSelection) {
        localStorage.setItem(
          'quickLogSelection',
          JSON.stringify(nextQuickLogSelection)
        );
      } else {
        localStorage.removeItem('quickLogSelection');
      }

      await Promise.all([
        saveSupabaseHumidors(nextHumidors),
        saveSupabaseCigars(nextCigars),
        saveSupabaseSmokeLogs(nextSmokeLogs),
        saveSupabaseReflections(nextReflections),
        saveSupabaseWishList(nextWishList),
        saveSupabasePairingTypes(nextPairingTypes),
        saveSupabasePairingLogs(nextPairingLogs),
      ]);

      setImportMessage('Backup imported successfully.');
    } catch (error) {
      console.error('Failed to import backup:', error);
      setImportMessage('Failed to import backup file.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
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
            Settings
          </div>

          <h1 className="mt-2 font-cinzel text-3xl text-[#d58a24]">
            My Cigar Cellar Settings
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/70">
            Manage account access, backups, restore tools, and sync status.
          </p>

          <div className="mt-6">
            <AuthButton />
          </div>

          <div className="mt-6 rounded-2xl border border-[#3a2a0f] bg-black/40 p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-[#c8821f]">
              Backup & Restore
            </div>

            <p className="mt-3 text-sm leading-6 text-white/70">
              Download a JSON backup or restore from a previous backup file.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={downloadJsonBackup}
                disabled={!hasLoadedStorage}
                className="rounded-xl bg-[#d58a24] px-5 py-3 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Download Backup
              </button>

              <label className="cursor-pointer rounded-xl border border-[#3a2a0f] bg-black/40 px-5 py-3 text-center font-semibold text-[#d58a24] transition hover:bg-black/70">
                {isImporting ? 'Importing...' : 'Restore Backup'}

                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>

            {importMessage ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
                {importMessage}
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-[#3a2a0f] bg-black/40 p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-[#c8821f]">
              Data Status
            </div>

            <div className="mt-4 grid gap-3 text-sm text-white/70">
              <div>Signed in: {user?.email ?? 'Not signed in'}</div>
              <div>Humidors: {humidors.length}</div>
              <div>Cigars: {cigars.length}</div>
              <div>Smoke Logs: {smokeLogs.length}</div>
              <div>Reflections: {Object.keys(reflections).length}</div>
              <div>Wish List Items: {wishList.length}</div>
              <div>Pairing Types: {pairingTypes.length}</div>
              <div>Pairing Logs: {pairingLogs.length}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}