'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  saveUserDocument,
  subscribeToUserCollection,
} from '@/lib/firestoreSync';
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

const fallbackCigars: StoredCigar[] = [];
const defaultWishList: WishListItem[] = [];

const defaultPairingTypes: PairingType[] = [
  { id: 201, name: 'My favorite coffee', category: 'Coffee' },
  { id: 202, name: 'Aged rum', category: 'Rum' },
  { id: 203, name: 'Bold bourbon', category: 'Bourbon' },
];

const defaultPairingLogs: PairingLog[] = [];

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
  const [user, setUser] = useState<User | null>(null);

  const [cigars, setCigarsState] = useState<StoredCigar[]>([]);
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

    setCigarsState(Array.isArray(storedCigars) ? storedCigars : []);
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

  const setCigars = useCallback<React.Dispatch<React.SetStateAction<StoredCigar[]>>>(
    (value) => {
      setCigarsState((current) => {
        const next = typeof value === 'function' ? value(current) : value;

        localStorage.setItem('cigars', JSON.stringify(next));

        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.warn('Cigar changed locally, but no Firebase user is logged in.');
          return next;
        }

        next.forEach((cigar) => {
          saveUserDocument('cigars', String(cigar.id), cigar).catch((error) => {
            console.error('Failed to save cigar to Firestore:', error);
          });
        });

        return next;
      });
    },
    []
  );

  useEffect(() => {
    refreshFromStorage();
    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserCollection<StoredCigar>(
      'cigars',
      (items) => {
        setCigarsState(items);
        localStorage.setItem('cigars', JSON.stringify(items));
      }
    );

    return () => unsubscribe();
  }, [user]);

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
      setCigars,
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