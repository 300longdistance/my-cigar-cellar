'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

function formatDisplayDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function getRatingColor(rating: number) {
  if (rating >= 4.5) return 'text-green-400';
  if (rating >= 3.5) return 'text-yellow-300';
  return 'text-orange-300';
}

function getConfidenceLabel(count: number, avgRating: number) {
  if (count >= 4 && avgRating >= 4.2) {
    return {
      label: 'High confidence',
      className: 'bg-green-500/15 text-green-300 border border-green-500/25',
    };
  }

  if (count >= 2 && avgRating >= 3.5) {
    return {
      label: 'Building confidence',
      className: 'bg-yellow-500/15 text-yellow-200 border border-yellow-500/25',
    };
  }

  return {
    label: 'Early recommendation',
    className: 'bg-white/10 text-white/75 border border-white/10',
  };
}

function getPairingTint(pairingName: string) {
  const lower = pairingName.toLowerCase();

  if (
    lower.includes('coffee') ||
    lower.includes('espresso') ||
    lower.includes('latte') ||
    lower.includes('cappuccino')
  ) {
    return {
      pill: 'bg-[#3a2a1d] text-[#f0b36a]',
      border: 'border-[#5a3b1b]',
      soft: 'bg-[linear-gradient(135deg,#171513_0%,#1d1916_55%,#121110_100%)]',
    };
  }

  if (
    lower.includes('bourbon') ||
    lower.includes('whiskey') ||
    lower.includes('whisky')
  ) {
    return {
      pill: 'bg-[#3b2418] text-[#d58a24]',
      border: 'border-[#6b4217]',
      soft: 'bg-[linear-gradient(135deg,#181412_0%,#201915_55%,#121110_100%)]',
    };
  }

  if (lower.includes('rum')) {
    return {
      pill: 'bg-[#2f2419] text-[#e2a45f]',
      border: 'border-[#5b3c20]',
      soft: 'bg-[linear-gradient(135deg,#171412_0%,#1f1a15_55%,#121110_100%)]',
    };
  }

  if (
    lower.includes('pizza') ||
    lower.includes('food') ||
    lower.includes('steak') ||
    lower.includes('dessert')
  ) {
    return {
      pill: 'bg-[#24301f] text-[#9ccf7a]',
      border: 'border-[#3d5a2b]',
      soft: 'bg-[linear-gradient(135deg,#131612_0%,#1a2018_55%,#101110_100%)]',
    };
  }

  return {
    pill: 'bg-[#2a2d33] text-[#d58a24]',
    border: 'border-[#4a3420]',
    soft: 'bg-[linear-gradient(135deg,#141518_0%,#1a1c21_55%,#101114_100%)]',
  };
}

type LookupMode = 'pairingToCigar' | 'cigarToPairing';
type LowerTab = 'matches' | 'history';

type PairingSession = {
  cigarId: number;
  cigarName: string;
  brand: string;
  rating: number;
  notes?: string;
  pairedAt: string;
  pairingName: string;
};

type RankedCigarResult = {
  cigarId: number;
  cigarName: string;
  brand: string;
  count: number;
  avgRating: number;
  lastPairedAt: string;
};

type RankedPairingResult = {
  pairingName: string;
  count: number;
  avgRating: number;
  lastPairedAt: string;
};

type SmokeLogEntry = {
  id: number;
  cigarId: number;
  cigarName: string;
  brand: string;
  humidor: string;
  rating: number;
  notes: string;
  pairing: string;
  loggedAt: string;
};

export default function PairingsPage() {
  const [smokeLogs, setSmokeLogs] = useState<SmokeLogEntry[]>([]);

  const safeSmokeLogs = Array.isArray(smokeLogs) ? smokeLogs : [];

  useEffect(() => {
    function loadSmokeLogsFromStorage() {
      const savedSmokeLogs = localStorage.getItem('smokeLogs');

      if (!savedSmokeLogs) {
        setSmokeLogs([]);
        return;
      }

      try {
        const parsed = JSON.parse(savedSmokeLogs) as SmokeLogEntry[];

        if (Array.isArray(parsed)) {
          setSmokeLogs(parsed);
        } else {
          setSmokeLogs([]);
        }
      } catch (error) {
        console.error('Failed to load smoke logs for pairings:', error);
        setSmokeLogs([]);
      }
    }

    loadSmokeLogsFromStorage();

    function handleFocus() {
      loadSmokeLogsFromStorage();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        loadSmokeLogsFromStorage();
      }
    }

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const [lookupMode, setLookupMode] = useState<LookupMode>('pairingToCigar');
  const [activeTab, setActiveTab] = useState<LowerTab>('matches');

  const [selectedPairingName, setSelectedPairingName] = useState('');
  const [pairingQuery, setPairingQuery] = useState('');
  const [isPairingDropdownOpen, setIsPairingDropdownOpen] = useState(false);

  const [selectedCigarName, setSelectedCigarName] = useState('');
  const [cigarQuery, setCigarQuery] = useState('');
  const [isCigarDropdownOpen, setIsCigarDropdownOpen] = useState(false);

  const pairingComboboxRef = useRef<HTMLDivElement | null>(null);
  const cigarComboboxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleWindowClick(event: MouseEvent) {
      if (
        pairingComboboxRef.current &&
        event.target instanceof Node &&
        !pairingComboboxRef.current.contains(event.target)
      ) {
        setIsPairingDropdownOpen(false);
      }

      if (
        cigarComboboxRef.current &&
        event.target instanceof Node &&
        !cigarComboboxRef.current.contains(event.target)
      ) {
        setIsCigarDropdownOpen(false);
      }
    }

    window.addEventListener('click', handleWindowClick);

    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  const derivedPairingNames = useMemo(() => {
    const names = safeSmokeLogs
      .map((log) => normalizeName(log.pairing || ''))
      .filter((value) => value.length > 0);

    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [safeSmokeLogs]);

  const derivedCigarNames = useMemo(() => {
    const names = safeSmokeLogs
      .map((log) => normalizeName(log.cigarName || ''))
      .filter((value) => value.length > 0);

    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [safeSmokeLogs]);

  useEffect(() => {
    if (!selectedPairingName && derivedPairingNames.length > 0) {
      const firstPairing = derivedPairingNames[0];
      setSelectedPairingName(firstPairing);
      setPairingQuery(firstPairing);
    }
  }, [derivedPairingNames, selectedPairingName]);

  useEffect(() => {
    if (!selectedCigarName && derivedCigarNames.length > 0) {
      const firstCigar = derivedCigarNames[0];
      setSelectedCigarName(firstCigar);
      setCigarQuery(firstCigar);
    }
  }, [derivedCigarNames, selectedCigarName]);

  const filteredPairingNames = useMemo(() => {
    const normalizedQuery = normalizeName(pairingQuery).toLowerCase();

    if (!normalizedQuery) return derivedPairingNames;

    return derivedPairingNames.filter((name) =>
      name.toLowerCase().includes(normalizedQuery)
    );
  }, [derivedPairingNames, pairingQuery]);

  const filteredCigarNames = useMemo(() => {
    const normalizedQuery = normalizeName(cigarQuery).toLowerCase();

    if (!normalizedQuery) return derivedCigarNames;

    return derivedCigarNames.filter((name) =>
      name.toLowerCase().includes(normalizedQuery)
    );
  }, [derivedCigarNames, cigarQuery]);

  const quickPairingChips = derivedPairingNames.slice(0, 6);
  const quickCigarChips = derivedCigarNames.slice(0, 6);

  const matchingPairingLogs = useMemo<PairingSession[]>(() => {
    if (!selectedPairingName) return [];

    return safeSmokeLogs
      .filter(
        (log) =>
          normalizeName(log.pairing || '').toLowerCase() ===
          selectedPairingName.toLowerCase()
      )
      .sort(
        (a, b) =>
          new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
      )
      .map((log) => ({
        cigarId: log.cigarId,
        cigarName: log.cigarName,
        brand: log.brand,
        rating: log.rating,
        notes: log.notes,
        pairedAt: log.loggedAt,
        pairingName: normalizeName(log.pairing || ''),
      }));
  }, [safeSmokeLogs, selectedPairingName]);

  const matchingCigarLogs = useMemo<PairingSession[]>(() => {
    if (!selectedCigarName) return [];

    return safeSmokeLogs
      .filter(
        (log) =>
          normalizeName(log.cigarName || '').toLowerCase() ===
            selectedCigarName.toLowerCase() &&
          normalizeName(log.pairing || '').length > 0
      )
      .sort(
        (a, b) =>
          new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
      )
      .map((log) => ({
        cigarId: log.cigarId,
        cigarName: log.cigarName,
        brand: log.brand,
        rating: log.rating,
        notes: log.notes,
        pairedAt: log.loggedAt,
        pairingName: normalizeName(log.pairing || ''),
      }));
  }, [safeSmokeLogs, selectedCigarName]);

  const rankedCigarResults = useMemo<RankedCigarResult[]>(() => {
    const grouped = new Map<number, RankedCigarResult>();

    for (const log of matchingPairingLogs) {
      const existing = grouped.get(log.cigarId);

      if (!existing) {
        grouped.set(log.cigarId, {
          cigarId: log.cigarId,
          cigarName: log.cigarName,
          brand: log.brand,
          count: 1,
          avgRating: log.rating,
          lastPairedAt: log.pairedAt,
        });
      } else {
        const nextCount = existing.count + 1;
        const nextAvg =
          (existing.avgRating * existing.count + log.rating) / nextCount;

        grouped.set(log.cigarId, {
          cigarId: log.cigarId,
          cigarName: log.cigarName,
          brand: log.brand,
          count: nextCount,
          avgRating: Number(nextAvg.toFixed(1)),
          lastPairedAt:
            new Date(log.pairedAt).getTime() >
            new Date(existing.lastPairedAt).getTime()
              ? log.pairedAt
              : existing.lastPairedAt,
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => {
      const scoreA = a.avgRating * Math.log(a.count + 1);
      const scoreB = b.avgRating * Math.log(b.count + 1);

      if (scoreB !== scoreA) return scoreB - scoreA;

      return (
        new Date(b.lastPairedAt).getTime() -
        new Date(a.lastPairedAt).getTime()
      );
    });
  }, [matchingPairingLogs]);

  const rankedPairingResults = useMemo<RankedPairingResult[]>(() => {
    const grouped = new Map<string, RankedPairingResult>();

    for (const log of matchingCigarLogs) {
      if (!log.pairingName) continue;

      const key = log.pairingName.toLowerCase();
      const existing = grouped.get(key);

      if (!existing) {
        grouped.set(key, {
          pairingName: log.pairingName,
          count: 1,
          avgRating: log.rating,
          lastPairedAt: log.pairedAt,
        });
      } else {
        const nextCount = existing.count + 1;
        const nextAvg =
          (existing.avgRating * existing.count + log.rating) / nextCount;

        grouped.set(key, {
          pairingName: existing.pairingName,
          count: nextCount,
          avgRating: Number(nextAvg.toFixed(1)),
          lastPairedAt:
            new Date(log.pairedAt).getTime() >
            new Date(existing.lastPairedAt).getTime()
              ? log.pairedAt
              : existing.lastPairedAt,
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => {
      const scoreA = a.avgRating * Math.log(a.count + 1);
      const scoreB = b.avgRating * Math.log(b.count + 1);

      if (scoreB !== scoreA) return scoreB - scoreA;

      return (
        new Date(b.lastPairedAt).getTime() -
        new Date(a.lastPairedAt).getTime()
      );
    });
  }, [matchingCigarLogs]);

  const isPairingMode = lookupMode === 'pairingToCigar';

  const topCigarResult = rankedCigarResults[0] ?? null;
  const topPairingResult = rankedPairingResults[0] ?? null;

  const additionalCigarMatches = rankedCigarResults.slice(1, 4);
  const additionalPairingMatches = rankedPairingResults.slice(1, 4);

  const recentSessions = isPairingMode
    ? matchingPairingLogs.slice(0, 6)
    : matchingCigarLogs.slice(0, 6);

  const latestNote =
    recentSessions.find((log) => log.notes && log.notes.trim().length > 0)
      ?.notes ?? '';

  const displayPairingName = isPairingMode
    ? selectedPairingName
    : topPairingResult?.pairingName ?? '';

  const tint = getPairingTint(displayPairingName);

  const confidence =
    isPairingMode && topCigarResult
      ? getConfidenceLabel(topCigarResult.count, topCigarResult.avgRating)
      : !isPairingMode && topPairingResult
        ? getConfidenceLabel(topPairingResult.count, topPairingResult.avgRating)
        : null;

  const hasAnyPairingData =
    derivedPairingNames.length > 0 && derivedCigarNames.length > 0;

  return (
  <main className="pairings-phone-readable min-h-screen overflow-x-hidden bg-black text-white">
    <div className="mx-auto w-full max-w-[1380px] px-1.5 py-1.5 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
      <div className="grid min-h-[calc(100vh-12px)] grid-cols-1 gap-2 sm:grid-cols-[290px_minmax(0,1fr)] sm:gap-3 md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="mb-5 flex items-center justify-between">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/5"
              aria-label="Back to Home"
            >
              <span className="text-[24px]">‹</span>
            </Link>

            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                Pairings
              </div>
              <h1 className="mt-1 text-[18px] text-white sm:text-[20px]">
                What works best together
              </h1>
            </div>

            <div className="w-9" />
          </div>

          {!hasAnyPairingData ? (
            <div className="mx-auto max-w-[720px] rounded-[24px] border border-[#3a2a0f] bg-[linear-gradient(180deg,#111214_0%,#0c0c0d_100%)] px-5 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#3a2a0f] bg-[#121316] text-[24px] text-[#d58a24]">
                ★
              </div>

              <div className="mt-4 text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                No Pairing Data Yet
              </div>

              <h2 className="mt-2 text-[22px] text-white">
                Start logging pairings
              </h2>

              <p className="mx-auto mt-3 max-w-[440px] text-[14px] leading-relaxed text-white/55">
                Once you log cigars with coffee, bourbon, pizza, rum, or other
                pairings, this page will show both best cigars for a pairing
                and best pairings for a cigar.
              </p>

              <div className="mt-5">
                <Link
                  href="/log"
                  className="inline-flex items-center justify-center rounded-[16px] border border-[#6b4217] bg-[#111216] px-4 py-3 text-[14px] text-white transition hover:bg-[#15181d]"
                >
                  Log a smoke
                </Link>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4">
              <div className="inline-flex w-full rounded-[16px] border border-white/10 bg-[#111317] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setLookupMode('pairingToCigar');
                    setActiveTab('matches');
                  }}
                  className={`flex-1 rounded-[12px] px-4 py-2 text-[13px] transition ${
                    isPairingMode
                      ? 'bg-[#24180f] text-[#f0b36a]'
                      : 'text-white/65 hover:text-white'
                  }`}
                >
                  Pairing → Cigar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLookupMode('cigarToPairing');
                    setActiveTab('matches');
                  }}
                  className={`flex-1 rounded-[12px] px-4 py-2 text-[13px] transition ${
                    !isPairingMode
                      ? 'bg-[#24180f] text-[#f0b36a]'
                      : 'text-white/65 hover:text-white'
                  }`}
                >
                  Cigar → Pairing
                </button>
              </div>

              {isPairingMode ? (
                <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(135deg,#0d0d0f_0%,#15171b_55%,#101112_100%)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                        Pairing
                      </div>
                      <div className="mt-1 text-[14px] text-white/70">
                        Choose what you are pairing today.
                      </div>
                    </div>

                    <div className="rounded-full bg-[#23262d] px-2.5 py-[5px] text-[10px] leading-none text-white/70">
                      {derivedPairingNames.length} saved
                    </div>
                  </div>

                  <div ref={pairingComboboxRef} className="relative mt-3">
                    <div className="flex items-center rounded-[16px] border border-[#6b4217] bg-[#101114] px-3 py-2.5 shadow-[0_0_0_1px_rgba(200,136,45,0.08)] transition focus-within:border-[#8a5a20]">
                      <input
                        type="text"
                        value={pairingQuery}
                        onChange={(event) => {
                          setPairingQuery(event.target.value);
                          setIsPairingDropdownOpen(true);
                        }}
                        onFocus={() => setIsPairingDropdownOpen(true)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();

                            if (filteredPairingNames.length > 0) {
                              setSelectedPairingName(filteredPairingNames[0]);
                              setPairingQuery(filteredPairingNames[0]);
                              setIsPairingDropdownOpen(false);
                            }
                          }

                          if (event.key === 'Escape') {
                            setPairingQuery(selectedPairingName);
                            setIsPairingDropdownOpen(false);
                          }
                        }}
                        placeholder="Type a pairing..."
                        className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setIsPairingDropdownOpen((current) => !current)
                        }
                        className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[14px] text-[#d58a24]"
                        aria-label="Toggle pairing list"
                      >
                        {isPairingDropdownOpen ? '⌃' : '⌄'}
                      </button>
                    </div>

                    {isPairingDropdownOpen && (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                        <div className="max-h-64 overflow-y-auto p-2">
                          {filteredPairingNames.length > 0 ? (
                            filteredPairingNames.map((name) => {
                              const isActive =
                                name.toLowerCase() ===
                                selectedPairingName.toLowerCase();

                              return (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => {
                                    setSelectedPairingName(name);
                                    setPairingQuery(name);
                                    setIsPairingDropdownOpen(false);
                                  }}
                                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-left transition ${
                                    isActive
                                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                                      : 'text-white/85 hover:bg-[#181b20]'
                                  }`}
                                >
                                  <span className="truncate text-[14px]">
                                    {name}
                                  </span>

                                  {isActive && (
                                    <span className="ml-3 text-[12px] text-[#d58a24]">
                                      Active
                                    </span>
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <div className="rounded-[14px] px-3 py-3 text-[13px] text-white/50">
                              No saved pairings match that search.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickPairingChips.map((name) => {
                      const isActive =
                        name.toLowerCase() ===
                        selectedPairingName.toLowerCase();

                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setSelectedPairingName(name);
                            setPairingQuery(name);
                            setIsPairingDropdownOpen(false);
                          }}
                          className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                            isActive
                              ? 'border-[#6b4217] bg-[#24180f] text-[#f0b36a]'
                              : 'border-white/10 bg-[#16181c] text-white/70 hover:bg-[#1a1d22]'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(135deg,#0d0d0f_0%,#15171b_55%,#101112_100%)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                        Cigar
                      </div>
                      <div className="mt-1 text-[14px] text-white/70">
                        Choose a cigar to see its best pairings.
                      </div>
                    </div>

                    <div className="rounded-full bg-[#23262d] px-2.5 py-[5px] text-[10px] leading-none text-white/70">
                      {derivedCigarNames.length} logged
                    </div>
                  </div>

                  <div ref={cigarComboboxRef} className="relative mt-3">
                    <div className="flex items-center rounded-[16px] border border-[#6b4217] bg-[#101114] px-3 py-2.5 shadow-[0_0_0_1px_rgba(200,136,45,0.08)] transition focus-within:border-[#8a5a20]">
                      <input
                        type="text"
                        value={cigarQuery}
                        onChange={(event) => {
                          setCigarQuery(event.target.value);
                          setIsCigarDropdownOpen(true);
                        }}
                        onFocus={() => setIsCigarDropdownOpen(true)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();

                            if (filteredCigarNames.length > 0) {
                              setSelectedCigarName(filteredCigarNames[0]);
                              setCigarQuery(filteredCigarNames[0]);
                              setIsCigarDropdownOpen(false);
                            }
                          }

                          if (event.key === 'Escape') {
                            setCigarQuery(selectedCigarName);
                            setIsCigarDropdownOpen(false);
                          }
                        }}
                        placeholder="Type a cigar..."
                        className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setIsCigarDropdownOpen((current) => !current)
                        }
                        className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[14px] text-[#d58a24]"
                        aria-label="Toggle cigar list"
                      >
                        {isCigarDropdownOpen ? '⌃' : '⌄'}
                      </button>
                    </div>

                    {isCigarDropdownOpen && (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                        <div className="max-h-64 overflow-y-auto p-2">
                          {filteredCigarNames.length > 0 ? (
                            filteredCigarNames.map((name) => {
                              const isActive =
                                name.toLowerCase() ===
                                selectedCigarName.toLowerCase();

                              return (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCigarName(name);
                                    setCigarQuery(name);
                                    setIsCigarDropdownOpen(false);
                                  }}
                                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-left transition ${
                                    isActive
                                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                                      : 'text-white/85 hover:bg-[#181b20]'
                                  }`}
                                >
                                  <span className="truncate text-[14px]">
                                    {name}
                                  </span>

                                  {isActive && (
                                    <span className="ml-3 text-[12px] text-[#d58a24]">
                                      Active
                                    </span>
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <div className="rounded-[14px] px-3 py-3 text-[13px] text-white/50">
                              No saved cigars match that search.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickCigarChips.map((name) => {
                      const isActive =
                        name.toLowerCase() === selectedCigarName.toLowerCase();

                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setSelectedCigarName(name);
                            setCigarQuery(name);
                            setIsCigarDropdownOpen(false);
                          }}
                          className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                            isActive
                              ? 'border-[#6b4217] bg-[#24180f] text-[#f0b36a]'
                              : 'border-white/10 bg-[#16181c] text-white/70 hover:bg-[#1a1d22]'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isPairingMode ? (
                topCigarResult ? (
                  <div
                    className={`rounded-[24px] border ${tint.border} ${tint.soft} px-5 py-5`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                        Best Cigar Match
                      </div>

                      {confidence && (
                        <div
                          className={`rounded-full px-3 py-1 text-[11px] ${confidence.className}`}
                        >
                          {confidence.label}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="text-[26px] leading-tight text-white">
                          {topCigarResult.cigarName}
                        </div>

                        <div className="mt-1 text-[14px] text-white/65">
                          {topCigarResult.brand}
                        </div>

                        <div className="mt-2 text-[12px] text-white/45">
                          Based on {topCigarResult.count} session
                          {topCigarResult.count === 1 ? '' : 's'} with an
                          average rating of {topCigarResult.avgRating.toFixed(1)}
                        </div>

                        <div className="mt-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-medium ${tint.pill}`}
                          >
                            {selectedPairingName}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-[120px] rounded-[16px] bg-black/20 px-4 py-3 text-right">
                        <div className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                          Score
                        </div>
                        <div
                          className={`mt-1 text-[24px] ${getRatingColor(
                            topCigarResult.avgRating
                          )}`}
                        >
                          ★ {topCigarResult.avgRating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[22px] border border-[#3a2a0f] bg-[#111214] px-5 py-8 text-center">
                    <div className="text-[14px] text-white/60">
                      No cigar matches found for this pairing.
                    </div>
                  </div>
                )
              ) : topPairingResult ? (
                <div
                  className={`rounded-[24px] border ${tint.border} ${tint.soft} px-5 py-5`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                      Best Pairing Match
                    </div>

                    {confidence && (
                      <div
                        className={`rounded-full px-3 py-1 text-[11px] ${confidence.className}`}
                      >
                        {confidence.label}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-[26px] leading-tight text-white">
                        {topPairingResult.pairingName}
                      </div>

                      <div className="mt-1 text-[14px] text-white/65">
                        Best pairing for {selectedCigarName}
                      </div>

                      <div className="mt-2 text-[12px] text-white/45">
                        Based on {topPairingResult.count} session
                        {topPairingResult.count === 1 ? '' : 's'} with an
                        average rating of {topPairingResult.avgRating.toFixed(1)}
                      </div>

                      <div className="mt-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[12px] font-medium ${tint.pill}`}
                        >
                          {selectedCigarName}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-[120px] rounded-[16px] bg-black/20 px-4 py-3 text-right">
                      <div className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                        Score
                      </div>
                      <div
                        className={`mt-1 text-[24px] ${getRatingColor(
                          topPairingResult.avgRating
                        )}`}
                      >
                        ★ {topPairingResult.avgRating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[22px] border border-[#3a2a0f] bg-[#111214] px-5 py-8 text-center">
                  <div className="text-[14px] text-white/60">
                    No pairing matches found for this cigar.
                  </div>
                </div>
              )}

              <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(135deg,#101114_0%,#15181d_55%,#0d0e11_100%)] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                      Explore
                    </div>
                    <div className="mt-1 text-[16px] text-white">
                      {isPairingMode
                        ? 'See more cigar matches or pairing history'
                        : 'See more pairing matches or cigar history'}
                    </div>
                  </div>

                  <div className="rounded-full bg-[#23262d] px-2.5 py-[5px] text-[10px] leading-none text-white/75">
                    {isPairingMode ? selectedPairingName : selectedCigarName}
                  </div>
                </div>

                <div className="mt-4 inline-flex rounded-[16px] border border-white/10 bg-[#111317] p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('matches')}
                    className={`rounded-[12px] px-4 py-2 text-[13px] transition ${
                      activeTab === 'matches'
                        ? 'bg-[#24180f] text-[#f0b36a]'
                        : 'text-white/65 hover:text-white'
                    }`}
                  >
                    Matches
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={`rounded-[12px] px-4 py-2 text-[13px] transition ${
                      activeTab === 'history'
                        ? 'bg-[#24180f] text-[#f0b36a]'
                        : 'text-white/65 hover:text-white'
                    }`}
                  >
                    History
                  </button>
                </div>

                {activeTab === 'matches' ? (
                  <div className="mt-4 space-y-2.5">
                    {isPairingMode ? (
                      additionalCigarMatches.length > 0 ? (
                        additionalCigarMatches.map((result) => (
                          <div
                            key={result.cigarId}
                            className="rounded-[16px] bg-[#16181c] px-4 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-[15px] text-white">
                                  {result.cigarName}
                                </div>
                                <div className="mt-1 text-[12px] text-white/55">
                                  {result.brand}
                                </div>
                                <div className="mt-2 text-[11px] text-white/40">
                                  Last paired{' '}
                                  {formatDisplayDate(result.lastPairedAt)}
                                </div>
                              </div>

                              <div className="text-right">
                                <div
                                  className={`text-[14px] font-medium ${getRatingColor(
                                    result.avgRating
                                  )}`}
                                >
                                  ★ {result.avgRating.toFixed(1)}
                                </div>
                                <div className="mt-1 text-[11px] text-white/45">
                                  {result.count}x paired
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[16px] bg-[#16181c] px-4 py-4 text-[13px] text-white/55">
                          No secondary cigar matches yet.
                        </div>
                      )
                    ) : additionalPairingMatches.length > 0 ? (
                      additionalPairingMatches.map((result) => {
                        const resultTint = getPairingTint(result.pairingName);

                        return (
                          <div
                            key={result.pairingName}
                            className="rounded-[16px] bg-[#16181c] px-4 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-[15px] text-white">
                                  {result.pairingName}
                                </div>
                                <div className="mt-2">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] ${resultTint.pill}`}
                                  >
                                    Pairing
                                  </span>
                                </div>
                                <div className="mt-2 text-[11px] text-white/40">
                                  Last paired{' '}
                                  {formatDisplayDate(result.lastPairedAt)}
                                </div>
                              </div>

                              <div className="text-right">
                                <div
                                  className={`text-[14px] font-medium ${getRatingColor(
                                    result.avgRating
                                  )}`}
                                >
                                  ★ {result.avgRating.toFixed(1)}
                                </div>
                                <div className="mt-1 text-[11px] text-white/45">
                                  {result.count}x paired
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-[16px] bg-[#16181c] px-4 py-4 text-[13px] text-white/55">
                        No secondary pairing matches yet.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-2.5">
                    {recentSessions.length > 0 ? (
                      recentSessions.map((session, index) => (
                        <div
                          key={`${session.cigarId}-${session.pairedAt}-${index}`}
                          className="rounded-[16px] bg-[#16181c] px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[15px] text-white">
                                {session.cigarName}
                              </div>
                              <div className="mt-1 text-[12px] text-white/55">
                                {session.brand}
                              </div>
                              <div className="mt-2 text-[11px] text-[#d58a24]">
                                {session.pairingName}
                              </div>

                              {session.notes &&
                              session.notes.trim().length > 0 ? (
                                <div className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-white/45">
                                  {session.notes}
                                </div>
                              ) : null}
                            </div>

                            <div className="text-right">
                              <div
                                className={`text-[14px] font-medium ${getRatingColor(
                                  session.rating
                                )}`}
                              >
                                ★ {session.rating}/5
                              </div>
                              <div className="mt-1 text-[11px] text-white/45">
                                {formatDisplayDate(session.pairedAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[16px] bg-[#16181c] px-4 py-4 text-[13px] text-white/55">
                        No history found yet.
                      </div>
                    )}

                    <div className="rounded-[16px] border border-white/10 bg-[#111317] px-4 py-4">
                      <div className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                        Latest Note
                      </div>

                      <div className="mt-2 text-[14px] leading-relaxed text-white/80">
                        {latestNote ? (
                          <p>{latestNote}</p>
                        ) : (
                          <p className="text-white/45">
                            No notes captured yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}