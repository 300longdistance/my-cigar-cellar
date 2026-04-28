'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PairingLog, PairingType } from '@/types/pairing';

export type StoredCigar = {
  id: number;
  name: string;
  brand: string;
  humidor: string;
  qty: number;
  origin?: string;
  wrapper?: string;
  strength?: string;
  size?: string;
  notes?: string;
  favorite?: boolean;
  image?: string;
};

export type SmokeLogEntry = {
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

export type ReflectionDrafts = Record<number, string>;

export type WishListItem = {
  id: number;
  name: string;
  brand: string;
  vitola: string;
  wrapper: string;
  origin: string;
  strength: string;
  notes: string;
  priority: 'High' | 'Medium' | 'Low';
};

export type QuickLogSelection = {
  humidor: string;
  cigarId: number | null;
};

type CigarAppContextValue = {
  hasLoadedStorage: boolean;
  cigars: StoredCigar[];
  setCigars: React.Dispatch<React.SetStateAction<StoredCigar[]>>;
  smokeLogs: SmokeLogEntry[];
  setSmokeLogs: React.Dispatch<React.SetStateAction<SmokeLogEntry[]>>;
  reflections: ReflectionDrafts;
  setReflections: React.Dispatch<React.SetStateAction<ReflectionDrafts>>;
  wishList: WishListItem[];
  setWishList: React.Dispatch<React.SetStateAction<WishListItem[]>>;
  pairingTypes: PairingType[];
  setPairingTypes: React.Dispatch<React.SetStateAction<PairingType[]>>;
  pairingLogs: PairingLog[];
  setPairingLogs: React.Dispatch<React.SetStateAction<PairingLog[]>>;
  quickLogSelection: QuickLogSelection | null;
  setQuickLogSelection: React.Dispatch<React.SetStateAction<QuickLogSelection | null>>;
  refreshFromStorage: () => void;
};

const fallbackCigars: StoredCigar[] = [
  {
    id: 1,
    name: 'VSG Sorcerer',
    brand: 'Ashton',
    humidor: 'Golf Simulator',
    qty: 6,
    origin: 'Dominican Republic',
    wrapper: 'Ecuadorian Sumatra',
    strength: 'Full',
    size: '7 x 49',
    notes: 'Rich cedar, espresso, leather, and black pepper.',
    favorite: true,
  },
  {
    id: 2,
    name: 'Magnum R',
    brand: 'H. Upmann',
    humidor: 'Golf Simulator',
    qty: 3,
    origin: 'Dominican Republic',
    wrapper: 'Ecuadorian',
    strength: 'Medium',
    size: '5 x 52',
    notes: 'Creamy profile with toast, nuts, and soft spice.',
    favorite: false,
  },
  {
    id: 3,
    name: 'Le Bijou 1922',
    brand: 'My Father',
    humidor: 'Desktop Humidor',
    qty: 4,
    origin: 'Nicaragua',
    wrapper: 'Habano Oscuro',
    strength: 'Full',
    size: '5 5/8 x 55',
    notes: 'Cocoa, earth, pepper, and dark coffee.',
    favorite: false,
  },
];

const defaultWishList: WishListItem[] = [
  {
    id: 101,
    name: 'Liga Privada No. 9',
    brand: 'Drew Estate',
    vitola: 'Toro',
    wrapper: 'Connecticut Broadleaf Oscuro',
    origin: 'Nicaragua',
    strength: 'Full',
    notes: 'Want to compare against current fuller-bodied favorites.',
    priority: 'High',
  },
  {
    id: 102,
    name: 'Fuente Fuente OpusX',
    brand: 'Arturo Fuente',
    vitola: 'Belicoso',
    wrapper: 'Dominican',
    origin: 'Dominican Republic',
    strength: 'Full',
    notes: 'Need a few benchmark OpusX sticks in the journal.',
    priority: 'Medium',
  },
];

const defaultPairingTypes: PairingType[] = [
  { id: 201, name: 'My favorite coffee', category: 'Coffee' },
  { id: 202, name: 'Aged rum', category: 'Rum' },
  { id: 203, name: 'Bold bourbon', category: 'Bourbon' },
];

const defaultPairingLogs: PairingLog[] = [
  {
    id: 301,
    pairingTypeId: 201,
    cigarId: 1,
    rating: 5.0,
    notes: 'Excellent espresso and cedar balance.',
    pairedAt: '2026-04-05T18:00:00.000Z',
  },
  {
    id: 302,
    pairingTypeId: 202,
    cigarId: 2,
    rating: 4.8,
    notes: 'Nice sweetness against a creamy profile.',
    pairedAt: '2026-04-05T19:00:00.000Z',
  },
  {
    id: 303,
    pairingTypeId: 203,
    cigarId: 3,
    rating: 5.0,
    notes: 'Dark, rich pairing with strong coffee notes.',
    pairedAt: '2026-04-05T20:00:00.000Z',
  },
];

const CigarAppContext = createContext<CigarAppContextValue | null>(null);

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Failed to parse localStorage value:', error);
    return fallback;
  }
}

export function CigarAppProvider({ children }: { children: ReactNode }) {
    const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [cigars, setCigars] = useState<StoredCigar[]>(fallbackCigars);
  const [smokeLogs, setSmokeLogs] = useState<SmokeLogEntry[]>([]);
  const [reflections, setReflections] = useState<ReflectionDrafts>({});
  const [wishList, setWishList] = useState<WishListItem[]>(defaultWishList);
  const [pairingTypes, setPairingTypes] = useState<PairingType[]>(defaultPairingTypes);
  const [pairingLogs, setPairingLogs] = useState<PairingLog[]>(defaultPairingLogs);
  const [quickLogSelection, setQuickLogSelection] = useState<QuickLogSelection | null>(null);

  function refreshFromStorage() {
    const storedCigars = safeParse<StoredCigar[]>(
      localStorage.getItem('cigars'),
      fallbackCigars
    );

    const storedSmokeLogs = safeParse<SmokeLogEntry[]>(
      localStorage.getItem('smokeLogs'),
      []
    );

    const storedReflections = safeParse<ReflectionDrafts>(
      localStorage.getItem('smokeReflections'),
      {}
    );

        const storedWishList = safeParse<WishListItem[]>(
      localStorage.getItem('wishList'),
      defaultWishList
    );

    const storedPairingTypes = safeParse<PairingType[]>(
      localStorage.getItem('pairingTypes'),
      defaultPairingTypes
    );

    const storedPairingLogs = safeParse<PairingLog[]>(
      localStorage.getItem('pairingLogs'),
      defaultPairingLogs
    );

    const storedQuickLogSelection = safeParse<QuickLogSelection | null>(
      localStorage.getItem('quickLogSelection'),
      null
    );

    setCigars(
      Array.isArray(storedCigars) && storedCigars.length > 0
        ? storedCigars
        : fallbackCigars
    );
    setSmokeLogs(Array.isArray(storedSmokeLogs) ? storedSmokeLogs : []);
    setReflections(
      storedReflections && typeof storedReflections === 'object'
        ? storedReflections
        : {}
    );
        setWishList(
      Array.isArray(storedWishList) && storedWishList.length > 0
        ? storedWishList
        : defaultWishList
    );

    setPairingTypes(
      Array.isArray(storedPairingTypes) && storedPairingTypes.length > 0
        ? storedPairingTypes
        : defaultPairingTypes
    );

    setPairingLogs(
      Array.isArray(storedPairingLogs)
        ? storedPairingLogs
        : defaultPairingLogs
    );

    setQuickLogSelection(storedQuickLogSelection);
  }

  useEffect(() => {
    refreshFromStorage();
    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    localStorage.setItem('cigars', JSON.stringify(cigars));
  }, [cigars, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    localStorage.setItem('smokeLogs', JSON.stringify(smokeLogs));
  }, [smokeLogs, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    localStorage.setItem('smokeReflections', JSON.stringify(reflections));
  }, [reflections, hasLoadedStorage]);

    useEffect(() => {
    if (!hasLoadedStorage) return;
    localStorage.setItem('wishList', JSON.stringify(wishList));
  }, [wishList, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    localStorage.setItem('pairingTypes', JSON.stringify(pairingTypes));
  }, [pairingTypes, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    localStorage.setItem('pairingLogs', JSON.stringify(pairingLogs));
  }, [pairingLogs, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage) return;

    if (quickLogSelection) {
      localStorage.setItem('quickLogSelection', JSON.stringify(quickLogSelection));
    } else {
      localStorage.removeItem('quickLogSelection');
    }
  }, [quickLogSelection, hasLoadedStorage]);

    const value = useMemo<CigarAppContextValue>(
    () => ({
      hasLoadedStorage,
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
      refreshFromStorage,
    }),
    [
      hasLoadedStorage,
      cigars,
      smokeLogs,
      reflections,
      wishList,
      pairingTypes,
      pairingLogs,
      quickLogSelection,
    ]
  );

  return (
    <CigarAppContext.Provider value={value}>
      {children}
    </CigarAppContext.Provider>
  );
}

export function useCigarApp() {
  const context = useContext(CigarAppContext);

  if (!context) {
    throw new Error('useCigarApp must be used inside CigarAppProvider');
  }

  return context;
}