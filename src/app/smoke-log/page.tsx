'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useCigarApp } from '@/context/CigarAppContext';

function getTopPairingsForCigar(smokeLogs: any[], cigarId: number) {
  const filtered = smokeLogs.filter(
    (log) =>
      log.cigarId === cigarId &&
      log.pairing &&
      log.pairing.trim().length > 0
  );

  const map = new Map<
    string,
    {
      name: string;
      count: number;
      avgRating: number;
      lastPairedAt: string;
    }
  >();

  for (const log of filtered) {
    const name = log.pairing.trim();

    const existing = map.get(name);

    if (!existing) {
      map.set(name, {
        name,
        count: 1,
        avgRating: log.rating,
        lastPairedAt: log.loggedAt,
      });
    } else {
      const nextCount = existing.count + 1;
      const nextAvg =
        (existing.avgRating * existing.count + log.rating) / nextCount;

      map.set(name, {
        name,
        count: nextCount,
        avgRating: Number(nextAvg.toFixed(1)),
        lastPairedAt:
          new Date(log.loggedAt) > new Date(existing.lastPairedAt)
            ? log.loggedAt
            : existing.lastPairedAt,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      return (
        new Date(b.lastPairedAt).getTime() -
        new Date(a.lastPairedAt).getTime()
      );
    })
    .slice(0, 3);
}
type PairingCategory =
  | 'Coffee'
  | 'Bourbon'
  | 'Rum'
  | 'Whiskey'
  | 'Scotch'
  | 'Beer'
  | 'Wine'
  | 'Cocktail'
  | 'Food'
  | 'Other';

type PairingType = {
  id: number;
  name: string;
  category: PairingCategory;
};

type PairingLog = {
  id: number;
  pairingTypeId: number;
  cigarId: number;
  rating: number;
  notes?: string;
  pairedAt: string;
};

function normalizePairingName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function detectPairingCategory(value: string): PairingCategory {
  const lower = value.toLowerCase();

  if (
    lower.includes('coffee') ||
    lower.includes('espresso') ||
    lower.includes('cappuccino') ||
    lower.includes('latte')
  ) {
    return 'Coffee';
  }

  if (lower.includes('bourbon')) return 'Bourbon';
  if (lower.includes('rum')) return 'Rum';
  if (lower.includes('scotch')) return 'Scotch';
  if (lower.includes('whiskey') || lower.includes('whisky')) return 'Whiskey';
  if (lower.includes('beer') || lower.includes('lager') || lower.includes('ipa')) return 'Beer';
  if (lower.includes('wine') || lower.includes('cabernet') || lower.includes('pinot')) return 'Wine';

  if (
    lower.includes('old fashioned') ||
    lower.includes('manhattan') ||
    lower.includes('negroni') ||
    lower.includes('cocktail')
  ) {
    return 'Cocktail';
  }

  if (
    lower.includes('steak') ||
    lower.includes('chocolate') ||
    lower.includes('dessert') ||
    lower.includes('cheese') ||
    lower.includes('food')
  ) {
    return 'Food';
  }

  return 'Other';
}

export default function SmokeLogPage() {
  const router = useRouter();

  const {
    cigars,
    setCigars,
    smokeLogs,
    setSmokeLogs,
    pairingTypes,
    setPairingTypes,
    pairingLogs,
    setPairingLogs,
    quickLogSelection,
  } = useCigarApp();

  const fallbackSelectedCigarId = cigars[0]?.id ?? 0;
  const fallbackSelectedHumidor = cigars[0]?.humidor ?? '';

  const [selectedHumidor, setSelectedHumidor] = useState<string>(fallbackSelectedHumidor);
const [selectedCigarId, setSelectedCigarId] = useState<number>(fallbackSelectedCigarId);
const [isHumidorDropdownOpen, setIsHumidorDropdownOpen] = useState(false);
const [isPairingDropdownOpen, setIsPairingDropdownOpen] = useState(false);
const [rating, setRating] = useState<number>(0);
const [notes, setNotes] = useState('');
const [pairing, setPairing] = useState('');
const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!Array.isArray(cigars) || cigars.length === 0) return;

    let nextHumidor = cigars[0]?.humidor ?? '';
    let nextCigarId = cigars[0]?.id ?? 0;

    if (quickLogSelection) {
      const matchingHumidor = quickLogSelection.humidor
        ? cigars.some((cigar) => cigar.humidor === quickLogSelection.humidor)
        : false;

      const matchingCigar =
        quickLogSelection.cigarId != null
          ? cigars.find((cigar) => cigar.id === quickLogSelection.cigarId)
          : null;

      if (matchingHumidor && quickLogSelection.humidor) {
        nextHumidor = quickLogSelection.humidor;
      }

      if (matchingCigar) {
        nextCigarId = matchingCigar.id;
        nextHumidor = matchingCigar.humidor;
      } else {
        const firstCigarInHumidor = cigars.find(
          (cigar) => cigar.humidor === nextHumidor
        );

        if (firstCigarInHumidor) {
          nextCigarId = firstCigarInHumidor.id;
        }
      }
    }

    setSelectedHumidor(nextHumidor);
    setSelectedCigarId(nextCigarId);
  }, [cigars, quickLogSelection]);

  useEffect(() => {
  function handleWindowClick() {
    setIsHumidorDropdownOpen(false);
    setIsPairingDropdownOpen(false);
  }

  window.addEventListener('click', handleWindowClick);

  return () => {
    window.removeEventListener('click', handleWindowClick);
  };
}, []);

  const humidorOptions = useMemo(() => {
    const options = [...new Set(cigars.map((cigar) => cigar.humidor))];
    return options.length > 0 ? options : [];
  }, [cigars]);

  const cigarLastLoggedMap = useMemo(() => {
    const map = new Map<number, string>();

    for (const entry of smokeLogs) {
      const existing = map.get(entry.cigarId);
      if (!existing || new Date(entry.loggedAt) > new Date(existing)) {
        map.set(entry.cigarId, entry.loggedAt);
      }
    }

    return map;
  }, [smokeLogs]);

  const cigarsInHumidor = useMemo(() => {
    const filtered = cigars.filter((cigar) => cigar.humidor === selectedHumidor);

    return [...filtered].sort((a, b) => {
      const favoriteA = a.favorite ? 1 : 0;
      const favoriteB = b.favorite ? 1 : 0;

      if (favoriteA !== favoriteB) {
        return favoriteB - favoriteA;
      }

      const lastA = cigarLastLoggedMap.get(a.id);
      const lastB = cigarLastLoggedMap.get(b.id);

      if (lastA && lastB) {
        return new Date(lastB).getTime() - new Date(lastA).getTime();
      }

      if (lastA) return -1;
      if (lastB) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [cigars, selectedHumidor, cigarLastLoggedMap]);

  const selectedCigar = useMemo(() => {
    return (
      cigarsInHumidor.find((cigar) => cigar.id === selectedCigarId) ??
      cigarsInHumidor[0] ??
      null
    );
  }, [cigarsInHumidor, selectedCigarId]);

  const notesRef = useRef<HTMLTextAreaElement | null>(null);
const pairingRef = useRef<HTMLInputElement | null>(null);
  const topPairingsForSelectedCigar = useMemo(() => {
  if (!selectedCigar) return [];

  return getTopPairingsForCigar(smokeLogs, selectedCigar.id).map(
    (item) => item.name
  );
}, [smokeLogs, selectedCigar]);


const pairingOptions = useMemo(() => {
  const seen = new Set<string>();
  const ordered: string[] = [];

  const addValue = (value: string) => {
    const normalized = normalizePairingName(value);
    if (!normalized) return;

    const key = normalized.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    ordered.push(normalized);
  };

  topPairingsForSelectedCigar.forEach(addValue);
  pairingTypes.forEach((item) => addValue(item.name));

  return ordered;
}, [topPairingsForSelectedCigar, pairingTypes]);

const filteredPairingOptions = useMemo(() => {
  const normalized = pairing.trim().toLowerCase();

  if (!normalized) return pairingOptions;

  return pairingOptions.filter((option) =>
    option.toLowerCase().includes(normalized)
  );
}, [pairingOptions, pairing]);

  useEffect(() => {
    if (!selectedCigar && cigarsInHumidor.length > 0) {
      setSelectedCigarId(cigarsInHumidor[0].id);
      return;
    }

    if (selectedCigar && selectedCigar.humidor !== selectedHumidor) {
      setSelectedCigarId(cigarsInHumidor[0]?.id ?? selectedCigarId);
    }
  }, [cigarsInHumidor, selectedCigar, selectedHumidor, selectedCigarId]);

  function handleHumidorChange(nextHumidor: string) {
    setSelectedHumidor(nextHumidor);
    const nextCigar = cigars.find((cigar) => cigar.humidor === nextHumidor);
    if (nextCigar) {
      setSelectedCigarId(nextCigar.id);
    }
  }

  function handleCancel() {
    setRating(0);
    setNotes('');
    setPairing('');
    setSaveError('');
  }

  function handleLogSmoke() {
    setSaveError('');

    if (!selectedCigar) {
      setSaveError('No cigar is selected.');
      return;
    }

    if (rating === 0) {
      setSaveError('Choose a rating before logging.');
      return;
    }

    const timestamp = Date.now();
    const loggedAt = new Date(timestamp).toISOString();
    const normalizedPairing = normalizePairingName(pairing);

    const entry = {
      id: timestamp,
      cigarId: selectedCigar.id,
      cigarName: selectedCigar.name,
      brand: selectedCigar.brand,
      humidor: selectedCigar.humidor,
      rating,
      notes: notes.trim(),
      pairing: normalizedPairing,
      loggedAt,
    };

    const nextSmokeLogs = [entry, ...smokeLogs];

    const nextCigars = cigars.map((cigar) =>
      cigar.id === selectedCigar.id
        ? { ...cigar, qty: Math.max(0, cigar.qty - 1) }
        : cigar
    );

    let nextPairingTypes = pairingTypes;
    let nextPairingLogs = pairingLogs;

    if (normalizedPairing) {
      const existingPairingType = pairingTypes.find(
  (item) => item.name.toLowerCase() === normalizedPairing.toLowerCase()
);

      let pairingTypeId: number;

      if (existingPairingType) {
        pairingTypeId = existingPairingType.id;
      } else {
        const newPairingType: PairingType = {
          id: timestamp + 1,
          name: normalizedPairing,
          category: detectPairingCategory(normalizedPairing),
        };

        nextPairingTypes = [newPairingType, ...pairingTypes];
        pairingTypeId = newPairingType.id;
      }

      const newPairingLog = {
        id: timestamp + 2,
        pairingTypeId,
        cigarId: selectedCigar.id,
        rating,
        notes: notes.trim(),
        pairedAt: loggedAt,
      };

      nextPairingLogs = [newPairingLog, ...pairingLogs];
    }

    try {
      setSmokeLogs(nextSmokeLogs);
      setCigars(nextCigars);
      setPairingTypes(nextPairingTypes);
      setPairingLogs(nextPairingLogs);

      localStorage.setItem(
        'quickLogSelection',
        JSON.stringify({
          humidor: selectedCigar.humidor,
          cigarId: selectedCigar.id,
        })
      );

      setRating(0);
      setNotes('');
      setPairing('');

      router.push('/humidor');
    } catch (error) {
      console.error('Failed to save smoke log:', error);
      setSaveError('Could not save smoke log.');
    }
  }

  function detailValue(value?: string) {
  return value && value.trim().length > 0 ? value : '—';
}

function formatShortLogDate(value?: string) {
  if (!value) return 'Not logged yet';

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-[1380px] px-2.5 py-2.5 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
  <div className="grid min-h-[calc(100vh-20px)] grid-cols-1 gap-2.5 sm:grid-cols-[290px_minmax(0,1fr)] sm:gap-3 md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]">
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

            <div className="rounded-[22px] bg-[linear-gradient(135deg,#0d0d0f_0%,#17181c_55%,#111111_100%)] px-4 py-4">
  <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
    Current Humidor
  </div>

  <div className="mt-3">
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsHumidorDropdownOpen((current) => !current);
        }}
        className="flex w-full items-center justify-between rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-3 text-left shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition hover:border-[#8a5a20] hover:bg-[#14161a]"
        aria-haspopup="listbox"
        aria-expanded={isHumidorDropdownOpen}
      >
        <span className="truncate text-[15px] font-medium text-white">
          {selectedHumidor}
        </span>

        <span className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[14px] text-[#d58a24]">
          {isHumidorDropdownOpen ? '⌃' : '⌄'}
        </span>
      </button>

      {isHumidorDropdownOpen && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="max-h-64 overflow-y-auto p-2">
            {humidorOptions.map((humidor) => {
              const isActive = humidor === selectedHumidor;

              return (
                <button
                  key={humidor}
                  type="button"
                  onClick={() => {
                    handleHumidorChange(humidor);
                    setIsHumidorDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-[14px] transition ${
                    isActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[14px]">{humidor}</span>

                  {isActive && (
                    <span className="ml-3 text-[12px] text-[#d58a24]">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>

  <div className="mt-2 text-[13px] text-white/45">
    {cigarsInHumidor.reduce((sum, cigar) => sum + cigar.qty, 0)} cigars
  </div>

  <div className="mt-5 text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
    Choose Cigar
  </div>

<div className="mt-3 space-y-2">
  {cigarsInHumidor.map((cigar) => {
    const isSelected = cigar.id === selectedCigar?.id;
    const lastLoggedAt = cigarLastLoggedMap.get(cigar.id);
    const metaLine = [cigar.wrapper, cigar.size].filter(Boolean).join(' • ');

    return (
      <button
        key={cigar.id}
        type="button"
        onClick={() => setSelectedCigarId(cigar.id)}
        className={`group block w-full rounded-[18px] px-3 py-3 text-left transition duration-150 ${
          isSelected
            ? 'bg-[#1b1d22] ring-1 ring-[#c8882d]/45 shadow-[0_0_0_1px_rgba(200,136,45,0.25)]'
            : 'bg-[#16181c] hover:bg-[#1a1d22]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-white">
            {cigar.image ? (
              <img
                src={cigar.image}
                alt={cigar.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-[44px] w-[11px] rounded-full bg-gradient-to-b from-[#6d4a2c] to-[#5d3c22]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14.5px] font-medium text-white">
                  {cigar.name}
                </div>

                <div className="mt-[2px] truncate text-[12px] text-white/60">
                  {cigar.brand}
                </div>
              </div>

              {cigar.favorite ? (
                <span className="shrink-0 text-[14px] text-[#d58a24]">
                  ★
                </span>
              ) : null}
            </div>

            <div className="mt-[5px] flex items-center justify-between gap-2 text-[11.5px] text-white/45">
              <span className="truncate">
                {metaLine || 'No details yet'}
              </span>

              <span className="shrink-0 text-[#d58a24]">
                ×{cigar.qty}
              </span>
            </div>

            <div className="mt-[5px] flex items-center justify-between gap-2">
              <span className="truncate text-[11px] text-white/40">
                Last smoked: {formatShortLogDate(lastLoggedAt)}
              </span>

              {isSelected ? (
                <span className="shrink-0 rounded-full border border-[#d89a43]/50 bg-[#d89a43] px-2.5 py-1 text-[10px] font-medium text-white">
                  Selected
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </button>
    );
  })}
</div>
            </div>
          </aside>

          <section className="rounded-[24px] bg-[#050505] px-3 py-3 sm:px-4 sm:py-4">
            <div className="mb-3 grid grid-cols-[32px_1fr_32px] items-center">
              <div />
              <h1 className="text-center text-[16px]">Quick Log</h1>
              <div />
            </div>

            {selectedCigar ? (
              <div className="mx-auto flex w-full max-w-[620px] flex-col gap-3">
  <div className="rounded-[20px] bg-[#16181c] px-4 py-4">
                  <div className="text-[20px] text-white">
  {selectedCigar.name}
</div>
<div className="mt-1 text-[13px] text-white/60">
  {selectedCigar.brand}
</div>
<div className="mt-1 text-[13px] text-[#d58a24]">
  in {selectedCigar.humidor}
</div>

<div className="mt-3 border-t border-[#6b4217]/60 pt-3">
  <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
    Cigar Details
  </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[16px] bg-[#111215] px-4 py-4">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                          Wrapper
                        </div>
                        <div className="mt-2 text-[15px] text-white">
                          {detailValue(selectedCigar.wrapper)}
                        </div>
                      </div>

                      <div className="rounded-[16px] bg-[#111215] px-4 py-4">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                          Vitola
                        </div>
                        <div className="mt-2 text-[15px] text-white">
                          {detailValue(selectedCigar.size)}
                        </div>
                      </div>

                      <div className="rounded-[16px] bg-[#111215] px-4 py-4">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                          Origin
                        </div>
                        <div className="mt-2 text-[15px] text-white">
                          {detailValue(selectedCigar.origin)}
                        </div>
                      </div>

                      <div className="rounded-[16px] bg-[#111215] px-4 py-4">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                          Humidor
                        </div>
                        <div className="mt-2 text-[15px] text-white">
                          {selectedCigar.humidor}
                        </div>
                      </div>

                      <div className="rounded-[16px] bg-[#111215] px-4 py-4">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                          Strength
                        </div>
                        <div className="mt-2 text-[15px] text-white">
                          {detailValue(selectedCigar.strength)}
                        </div>
                      </div>

                      <div className="rounded-[16px] bg-[#111215] px-4 py-4">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-white/45">
                          On Hand
                        </div>
                        <div className="mt-2 text-[15px] text-white">
                          {selectedCigar.qty}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
  <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
    Rating
  </div>
  <div className="text-[18px] text-white">Quick Rating</div>

  <div className="mt-3 flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const active = rating === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className={`flex h-11 min-w-[44px] items-center justify-center rounded-[14px] border px-3 text-[14px] font-medium transition ${
                            active
                              ? 'border-[#d89a43] bg-[#d89a43] text-white'
                              : 'border-white/10 bg-[#16181c] text-white/80 hover:border-[#d89a43]/40'
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
  <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
    Notes
  </div>
  <div className="text-[18px] text-white">Session Notes</div>
  <textarea
    value={notes}
    onChange={(event) => setNotes(event.target.value)}
    rows={4}
    placeholder="Optional note"
    className="mt-3 w-full resize-none rounded-[18px] border border-[#2d210d] bg-[linear-gradient(135deg,#15161a_0%,#1b1d22_55%,#121316_100%)] px-4 py-4 text-[14px] text-white outline-none placeholder:text-white/25 focus:border-[#c8882d]/60"
  />
</div>

                <div>
                  <div className="text-[13px] text-[#d58a24]">Voice Note</div>
                </div>

                <div>
  <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
    Pairing
  </div>
  <div className="mb-2 text-[18px] text-white">Pairing Notes</div>

  <div className="relative">
    <div className="rounded-[18px] border border-[#6b4217] bg-[linear-gradient(135deg,#15161a_0%,#1b1d22_55%,#121316_100%)] px-4 py-4 shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={pairing}
          onChange={(event) => {
            setPairing(event.target.value);
            setIsPairingDropdownOpen(true);
          }}
          onFocus={() => setIsPairingDropdownOpen(true)}
          onClick={(event) => event.stopPropagation()}
          placeholder="Coffee, bourbon, rum, food..."
          className="min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-white/50"
        />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsPairingDropdownOpen((current) => !current);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#3a2a0f] bg-[#121316] text-[13px] text-[#d58a24] transition hover:bg-[#17191d]"
          aria-label="Toggle pairing options"
          tabIndex={-1}
        >
          {isPairingDropdownOpen ? '⌃' : '⌄'}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-[13px] text-[#d58a24]">
          Saved with log
        </span>

        {topPairingsForSelectedCigar.length > 0 && (
          <span className="text-[12px] text-white/45">
            Top for this cigar
          </span>
        )}
      </div>
    </div>

    {isPairingDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredPairingOptions.length > 0 ? (
            filteredPairingOptions.map((option) => {
              const isTopPick = topPairingsForSelectedCigar.includes(option);
              const isActive = pairing.trim().toLowerCase() === option.toLowerCase();

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setPairing(option);
                    setIsPairingDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-[14px] transition ${
                    isActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[14px]">{option}</span>

                  {isTopPick ? (
                    <span className="ml-3 text-[11px] text-[#d58a24]">
                      Top pick
                    </span>
                  ) : null}
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] px-3 py-3 text-[13px] text-white/50">
              No matching pairings. Keep typing to use a custom value.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

                {saveError && (
                  <div className="text-[13px] text-red-400">
                    {saveError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
  <button
    type="button"
    onClick={handleCancel}
    className="h-11 rounded-[14px] border border-white/10 bg-[#121316] px-4 text-[14px] font-medium text-white/75 transition hover:bg-[#17191d] hover:text-white"
  >
    Cancel
  </button>

  <button
    type="button"
    onClick={handleLogSmoke}
    className="h-11 rounded-[14px] bg-[#c8882d] px-4 text-[14px] font-medium text-white transition hover:brightness-110"
  >
    Log Smoke
  </button>
</div>
              </div>
            ) : (
              <div className="mx-auto max-w-[620px] rounded-[20px] border border-[#3a2a0f] bg-[linear-gradient(180deg,#111214_0%,#0c0c0d_100%)] px-5 py-8 text-center">
  <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
    Quick Log
  </div>
  <h2 className="mt-2 text-[22px] text-white">No cigars available</h2>
  <div className="mt-2 text-[13px] text-white/55">
    Add cigars in Humidor before logging a smoke.
  </div>
</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}