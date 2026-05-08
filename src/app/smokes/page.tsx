'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  type ReflectionDrafts,
  type StoredCigar,
  type WishListItem,
  useCigarApp,
} from '@/context/CigarAppContext';

const fallbackCigars: StoredCigar[] = [];

const defaultWishList: WishListItem[] = [];

const emptyWishItem: WishListItem = {
  id: 0,
  name: '',
  brand: '',
  vitola: '',
  wrapper: '',
  origin: '',
  strength: '',
  notes: '',
  priority: 'Medium',
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SmokesPage() {
  const {
  cigars,
  setCigars,
  smokeLogs,
  reflections,
  setReflections,
  wishList,
  setWishList,
} = useCigarApp();

  const [tab, setTab] = useState<'recent' | 'wish'>('recent');
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [savedMessage, setSavedMessage] = useState('');
const [selectedWishId, setSelectedWishId] = useState<number | null>(
  defaultWishList[0]?.id ?? null
);

const [wishDraft, setWishDraft] = useState<WishListItem>(
  defaultWishList[0] ?? emptyWishItem
);
const [wishMessage, setWishMessage] = useState('');
const [moveToHumidor, setMoveToHumidor] = useState<string>();

  useEffect(() => {
    setMoveToHumidor(cigars[0]?.humidor ?? '');
  }, [cigars]);

  useEffect(() => {
    setSelectedLogId(smokeLogs[0]?.id ?? null);
  }, [smokeLogs]);

  useEffect(() => {
    if (wishList.length > 0 && !selectedWishId) {
      setSelectedWishId(wishList[0].id);
      setWishDraft(wishList[0]);
    }

    if (wishList.length === 0) {
      setSelectedWishId(null);
      setWishDraft(emptyWishItem);
    }
  }, [wishList, selectedWishId]);

  const selectedLog = useMemo(() => {
    return smokeLogs.find((entry) => entry.id === selectedLogId) ?? smokeLogs[0] ?? null;
  }, [smokeLogs, selectedLogId]);

  const selectedCigar = useMemo(() => {
    if (!selectedLog) return null;
    return cigars.find((cigar) => cigar.id === selectedLog.cigarId) ?? null;
  }, [cigars, selectedLog]);

  const selectedReflection = selectedLog ? reflections[selectedLog.id] ?? '' : '';
const selectedWish = useMemo(() => {
  return wishList.find((item) => item.id === selectedWishId) ?? null;
}, [wishList, selectedWishId]);

  const humidorOptions = useMemo(() => {
  const names = [...new Set(cigars.map((cigar) => cigar.humidor).filter(Boolean))];
  return names.length > 0 ? names : [];
}, [cigars]);

  useEffect(() => {
  if (selectedWish) {
    setWishDraft(selectedWish);
  } else {
    setWishDraft(emptyWishItem);
  }
}, [selectedWish, wishList]);

    function handleSaveReflection() {
    if (!selectedLog) return;

    const next = {
      ...reflections,
      [selectedLog.id]: selectedReflection.trim(),
    };

    setReflections(next);
    setSavedMessage('Reflection saved');

    window.setTimeout(() => {
      setSavedMessage('');
    }, 1600);
  }

  function handleAddWishItem() {
    const newItem: WishListItem = {
      ...emptyWishItem,
      id: Date.now(),
      name: 'New Wish Item',
      brand: 'Brand',
    };

    const next = [newItem, ...wishList];
    setWishList(next);
    setSelectedWishId(newItem.id);
    setWishDraft(newItem);
    setWishMessage('');
  }

  function handleMoveToHumidor() {
  if (!selectedWish) return;

  const trimmedName = wishDraft.name.trim();
  const trimmedBrand = wishDraft.brand.trim();

  if (!trimmedName) {
    setWishMessage('Enter a cigar name before moving.');
    return;
  }

  const targetHumidor = moveToHumidor || humidorOptions[0] || '';

if (!targetHumidor) {
  setWishMessage('Select or create a humidor first.');
  return;
}

const newCigar = {
  id: Date.now(),
  name: trimmedName,
  brand: trimmedBrand || 'Unknown Brand',
  humidor: targetHumidor,
  qty: 1,
  origin: wishDraft.origin.trim() || 'Unknown',
  wrapper: wishDraft.wrapper.trim() || 'Unknown',
  strength: wishDraft.strength.trim() || 'Unknown',
  size: wishDraft.vitola.trim() || 'Unknown',
  notes: wishDraft.notes.trim(),
  favorite: false,
  image: '',
};

  const nextCigars = [newCigar, ...cigars];
setCigars(nextCigars);

  const nextWishList = wishList.filter((item) => item.id !== selectedWish.id);
  setWishList(nextWishList);

  const nextSelected = nextWishList[0] ?? null;
  setSelectedWishId(nextSelected?.id ?? null);
  setWishDraft(nextSelected ?? emptyWishItem);

  localStorage.setItem(
    'quickLogSelection',
    JSON.stringify({
      humidor: targetHumidor,
      cigarId: newCigar.id,
    })
  );

  setWishMessage(`Moved to ${targetHumidor}`);
}

  function handleSaveWishItem() {
    if (!selectedWishId) return;

    const trimmedName = wishDraft.name.trim();
    const trimmedBrand = wishDraft.brand.trim();

    if (!trimmedName) {
      setWishMessage('Enter a cigar name.');
      return;
    }

    const nextItem: WishListItem = {
      ...wishDraft,
      id: selectedWishId,
      name: trimmedName,
      brand: trimmedBrand || 'Unknown Brand',
      vitola: wishDraft.vitola.trim(),
      wrapper: wishDraft.wrapper.trim(),
      origin: wishDraft.origin.trim(),
      strength: wishDraft.strength.trim(),
      notes: wishDraft.notes.trim(),
    };

    const next = wishList.map((item) =>
      item.id === selectedWishId ? nextItem : item
    );

    setWishList(next);
    setWishMessage('Wish item saved');

    window.setTimeout(() => {
      setWishMessage('');
    }, 1600);
  }

  function handleDeleteWishItem() {
    if (!selectedWishId) return;

    const next = wishList.filter((item) => item.id !== selectedWishId);
    setWishList(next);

    const nextSelected = next[0] ?? null;
    setSelectedWishId(nextSelected?.id ?? null);
    setWishDraft(nextSelected ?? emptyWishItem);
    setWishMessage('');
  }

  return (
    <main className="smokes-phone-readable smokes-ipad-readable min-h-screen overflow-x-hidden bg-black text-white">
      <div className="mx-auto w-full max-w-[1500px] px-1.5 py-1.5 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
        <div className="grid min-h-[calc(100vh-12px)] grid-cols-1 gap-2 sm:grid-cols-[340px_minmax(0,1fr)] sm:gap-4 md:grid-cols-[380px_minmax(0,1fr)] lg:grid-cols-[410px_minmax(0,1fr)]">
          <aside className="rounded-[24px] bg-[#050505] px-3 py-3 sm:px-4 sm:py-4">
            <div className="mb-3 flex items-center justify-between">
              <Link
                href="/"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/5"
                aria-label="Back to Home"
              >
                <span className="text-[24px]">‹</span>
              </Link>
              <div className="w-8" />
            </div>

            <div className="rounded-[22px] bg-[linear-gradient(135deg,#0d0d0f_0%,#17181c_55%,#111111_100%)] px-4 py-3.5">
              <div className="grid grid-cols-2 rounded-full bg-[#16181c] p-[3px]">
                <button
                  type="button"
                  onClick={() => setTab('recent')}
                  className={`rounded-full px-4 py-1.5 text-[13px] transition ${
                    tab === 'recent'
                      ? 'bg-[#22252b] text-[#d58a24]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Recent Smokes
                </button>

                <button
                  type="button"
                  onClick={() => setTab('wish')}
                  className={`rounded-full px-4 py-1.5 text-[13px] transition ${
                    tab === 'wish'
                      ? 'bg-[#22252b] text-[#d58a24]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Wish List
                </button>
              </div>

              {tab === 'recent' ? (
                <div className="mt-5">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                    Recent Smokes
                  </div>

                  <div className="mt-1.5 text-[12px] leading-relaxed text-white/55">
                    Logs are stored locally and shown as read-only snapshots.
                  </div>

                  <div className="mt-3.5 space-y-2.5">
                    {smokeLogs.length > 0 ? (
                      smokeLogs.map((entry) => {
                        const isSelected = entry.id === selectedLog?.id;

                        return (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => setSelectedLogId(entry.id)}
                            className={`block w-full rounded-[16px] px-3.5 py-3 text-left transition ${
                              isSelected
                                ? 'bg-[#1b1d22] ring-1 ring-[#c8882d]'
                                : 'bg-[#16181c] hover:bg-[#1a1d22]'
                            }`}
                          >
                            <div className="line-clamp-2 text-[14px] leading-tight text-white">
                              {entry.cigarName}
                            </div>

                            <div className="mt-[3px] truncate text-[11px] text-[#d58a24]">
                              {entry.brand}
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="text-[10.5px] leading-tight text-white/60">
                                {formatDateTime(entry.loggedAt)}
                              </div>

                              <div className="rounded-full bg-[#23262d] px-2.5 py-[5px] text-[10px] leading-none text-white/75">
                                Notes
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-[18px] bg-[#16181c] px-4 py-4 text-[13px] text-white/55">
                        No smoke logs yet.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                      Wish List
                    </div>

                    <button
                      type="button"
                      onClick={handleAddWishItem}
                      className="text-[12px] text-[#d58a24] transition hover:text-[#f0d78a]"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="mt-1.5 text-[12px] leading-relaxed text-white/55">
                    Track cigars you want to buy, try, or compare later.
                  </div>

                  <div className="mt-3.5 space-y-2.5">
                    {wishList.length > 0 ? (
                      wishList.map((item) => {
                        const isSelected = item.id === selectedWish?.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedWishId(item.id)}
                            className={`block w-full rounded-[16px] px-3.5 py-3 text-left transition ${
                              isSelected
                                ? 'bg-[#1b1d22] ring-1 ring-[#c8882d]'
                                : 'bg-[#16181c] hover:bg-[#1a1d22]'
                            }`}
                          >
                            <div className="line-clamp-2 text-[14px] leading-tight text-white">
                              {item.name}
                            </div>

                            <div className="mt-[3px] truncate text-[11px] text-[#d58a24]">
                              {item.brand}
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="text-[10.5px] leading-tight text-white/60">
                                {item.vitola || 'No vitola set'}
                              </div>

                              <div className="rounded-full bg-[#23262d] px-2.5 py-[5px] text-[10px] leading-none text-white/75">
                                {item.priority}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-[18px] bg-[#16181c] px-4 py-4 text-[13px] text-white/55">
                        No wish list items yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <section className="rounded-[24px] bg-[#050505] px-3 py-3 sm:px-4 sm:py-4">
            <div className="mb-3 grid grid-cols-[32px_1fr_72px] items-center">
              <div />
              <h1 className="text-center text-[16px]">Smoke Details</h1>
              <div className="flex justify-end">
                <Link
                  href="/"
                  className="rounded-full bg-[#16181c] px-5 py-2 text-[14px] text-[#d58a24] transition hover:bg-[#1d2026]"
                >
                  Done
                </Link>
              </div>
            </div>

            {tab === 'recent' ? (
              selectedLog ? (
                <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4">
                  <div>
                    <div className="text-[20px] text-white sm:text-[22px]">
                      {selectedLog.cigarName}
                    </div>

                    <div className="mt-1 text-[13px] text-white/70">
                      {selectedLog.brand}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-white/70">
                      <span>{formatDateTime(selectedLog.loggedAt)}</span>
                      <span className="text-[#d58a24]">★ {selectedLog.rating}/5</span>
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-[linear-gradient(135deg,#15161a_0%,#1c1e24_55%,#121316_100%)] px-4 py-4">
                    <div className="text-[16px] text-white">Snapshot</div>

                    <div className="mt-4 grid gap-y-3 text-[14px] sm:grid-cols-[110px_1fr]">
                      <div className="text-white/70">Series</div>
                      <div className="text-white">—</div>

                      <div className="text-white/70">Vitola</div>
                      <div className="text-white">{selectedCigar?.size ?? '—'}</div>

                      <div className="text-white/70">Wrapper</div>
                      <div className="text-white">{selectedCigar?.wrapper ?? '—'}</div>

                      <div className="text-white/70">Origin</div>
                      <div className="text-white">{selectedCigar?.origin ?? '—'}</div>

                      <div className="text-white/70">Strength</div>
                      <div className="text-white">{selectedCigar?.strength ?? '—'}</div>
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-[linear-gradient(135deg,#15161a_0%,#1c1e24_55%,#121316_100%)] px-4 py-4">
                    <div className="text-[16px] text-white">Notes</div>

                    <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-white/80">
                      {selectedLog.notes ? (
                        <p>{selectedLog.notes}</p>
                      ) : (
                        <p className="text-white/45">No notes captured for this smoke.</p>
                      )}

                      {selectedCigar?.notes && <p>{selectedCigar.notes}</p>}
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-[linear-gradient(135deg,#15161a_0%,#1c1e24_55%,#121316_100%)] px-4 py-4">
                    <div className="text-[16px] text-white">Reflection</div>

                    <div className="mt-3 text-[13px] leading-relaxed text-white/55">
                      Add a later thought without changing the original smoke snapshot.
                    </div>

                    <textarea
                      value={selectedReflection}
                      onChange={(event) => {
                        if (!selectedLog) return;

                        setReflections((current) => ({
  ...current,
  [selectedLog.id]: event.target.value,
}));
                      }}
                      rows={4}
                      placeholder="Add a reflection"
                      className="mt-4 w-full resize-none rounded-[16px] border border-[#2d210d] bg-[#0f1013] px-4 py-4 text-[14px] text-white outline-none placeholder:text-white/25 focus:border-[#c8882d]/60"
                    />

                    <div className="mt-3 text-[13px] text-[#d58a24]">Voice Note</div>

                    <button
                      type="button"
                      onClick={handleSaveReflection}
                      className="mt-4 w-full rounded-[16px] bg-[#b87329] px-4 py-3 text-[16px] text-white transition hover:brightness-110"
                    >
                      Save Reflection
                    </button>

                    {savedMessage && (
                      <div className="mt-3 text-[12px] text-[#d58a24]">
                        {savedMessage}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[20px] bg-[linear-gradient(135deg,#15161a_0%,#1c1e24_55%,#121316_100%)] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[16px] text-white">Pairing</div>
                      <button
                        type="button"
                        className="text-[14px] text-[#d58a24] transition hover:text-[#f0d78a]"
                      >
                        Edit
                      </button>
                    </div>

                    {selectedLog.pairing ? (
                      <div className="mt-4">
                        <div className="text-[13px] text-white/55">Pairing</div>
                        <div className="mt-1 text-[16px] text-white">
                          {selectedLog.pairing}
                        </div>
                        <div className="mt-2 text-[13px] text-[#d58a24]">★ 3/5</div>
                      </div>
                    ) : (
                      <div className="mt-4 text-[13px] text-white/45">
                        No pairing saved for this smoke.
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/5 pt-4 text-[13px] leading-relaxed text-white/45">
                    Enjoy cigars responsibly. Snapshot notes remain read-only to preserve your smoke history.
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-[760px] rounded-[22px] border border-[#3a2a0f] bg-[linear-gradient(180deg,#111214_0%,#0c0c0d_100%)] px-5 py-8 text-center">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                    Notebook
                  </div>
                  <h2 className="mt-2 text-[22px] text-white">No smoke details available</h2>
                  <div className="mt-2 text-[13px] text-white/55">
                    Log a smoke first to populate this page.
                  </div>
                </div>
              )
            ) : selectedWish ? (
              <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[20px] text-white sm:text-[22px]">
                      {wishDraft.name || 'Wish Item'}
                    </div>

                    <div className="mt-1 text-[13px] text-white/70">
                      {wishDraft.brand || 'Brand'}
                    </div>
                  </div>

                  <div className="rounded-full bg-[#16181c] px-4 py-2 text-[13px] text-[#d58a24]">
                    {wishDraft.priority}
                  </div>
                </div>

                <div className="rounded-[20px] bg-[linear-gradient(135deg,#15161a_0%,#1c1e24_55%,#121316_100%)] px-4 py-4">
                  <div className="text-[16px] text-white">Wish Item Details</div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
                        Cigar Name
                      </label>
                      <input
                        type="text"
                        value={wishDraft.name}
                        onChange={(event) =>
                          setWishDraft((current) => ({ ...current, name: event.target.value }))
                        }
                        className="w-full rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#c8882d]/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={wishDraft.brand}
                        onChange={(event) =>
                          setWishDraft((current) => ({ ...current, brand: event.target.value }))
                        }
                        className="w-full rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#c8882d]/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
                        Vitola
                      </label>
                      <input
                        type="text"
                        value={wishDraft.vitola}
                        onChange={(event) =>
                          setWishDraft((current) => ({ ...current, vitola: event.target.value }))
                        }
                        className="w-full rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#c8882d]/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
                        Wrapper
                      </label>
                      <input
                        type="text"
                        value={wishDraft.wrapper}
                        onChange={(event) =>
                          setWishDraft((current) => ({ ...current, wrapper: event.target.value }))
                        }
                        className="w-full rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#c8882d]/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
                        Origin
                      </label>
                      <input
                        type="text"
                        value={wishDraft.origin}
                        onChange={(event) =>
                          setWishDraft((current) => ({ ...current, origin: event.target.value }))
                        }
                        className="w-full rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#c8882d]/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
                        Strength
                      </label>
                      <input
                        type="text"
                        value={wishDraft.strength}
                        onChange={(event) =>
                          setWishDraft((current) => ({ ...current, strength: event.target.value }))
                        }
                        className="w-full rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#c8882d]/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
                        Priority
                      </label>
                      <select
                        value={wishDraft.priority}
                        onChange={(event) =>
                          setWishDraft((current) => ({
                            ...current,
                            priority: event.target.value as WishListItem['priority'],
                          }))
                        }
                        className="w-full rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#c8882d]/60"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
                        Notes
                      </label>
                      <textarea
                        value={wishDraft.notes}
                        onChange={(event) =>
                          setWishDraft((current) => ({ ...current, notes: event.target.value }))
                        }
                        rows={5}
                        className="w-full resize-none rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#c8882d]/60"
                        placeholder="Why it is on the list, what to compare, where to buy..."
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] bg-[linear-gradient(135deg,#15161a_0%,#1c1e24_55%,#121316_100%)] px-4 py-4">
  <div className="text-[16px] text-white">Move to Humidor</div>

  <div className="mt-4">
    <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
      Target Humidor
    </label>

    <select
      value={moveToHumidor}
      onChange={(event) => setMoveToHumidor(event.target.value)}
      className="w-full rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#c8882d]/60"
    >
      {humidorOptions.map((humidor) => (
        <option key={humidor} value={humidor}>
          {humidor}
        </option>
      ))}
    </select>
  </div>

  <div className="mt-4 grid grid-cols-3 gap-3">
    <button
      type="button"
      onClick={handleDeleteWishItem}
      className="rounded-full bg-[#15161a] py-3 text-[15px] text-red-400 transition hover:bg-[#1a1c21]"
    >
      Delete
    </button>

    <button
      type="button"
      onClick={handleSaveWishItem}
      className="rounded-full bg-[#1f2228] py-3 text-[15px] text-white transition hover:bg-[#262a31]"
    >
      Save
    </button>

    <button
      type="button"
      onClick={handleMoveToHumidor}
      className="rounded-full bg-[#b87329] py-3 text-[15px] text-white transition hover:brightness-110"
    >
      Move
    </button>
  </div>
</div>

{wishMessage && (
  <div className="text-[13px] text-[#d58a24]">
    {wishMessage}
  </div>
)}
              </div>
            ) : (
              <div className="mx-auto max-w-[760px] rounded-[22px] border border-[#3a2a0f] bg-[linear-gradient(180deg,#111214_0%,#0c0c0d_100%)] px-5 py-8 text-center">
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                  Wish List
                </div>
                <h2 className="mt-2 text-[22px] text-white">No wish list item selected</h2>
                <div className="mt-2 text-[13px] text-white/55">
                  Add a wish item to start building the list.
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}