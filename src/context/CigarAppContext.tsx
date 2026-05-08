'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import {
  getSupabaseCigars,
  saveSupabaseCigars,
} from '@/lib/supabaseCigars';
import {
  migrateAppDataSmokeLogsToTable,
  saveSupabaseSmokeLogs,
} from '@/lib/supabaseSmokeLogs';
import {
  migrateAppDataPairingTypesToTable,
  saveSupabasePairingTypes,
} from '@/lib/supabasePairingTypes';
import {
  migrateAppDataPairingLogsToTable,
  saveSupabasePairingLogs,
} from '@/lib/supabasePairingLogs';
import {
  migrateAppDataWishListToTable,
  saveSupabaseWishList,
} from '@/lib/supabaseWishList';
import {
  migrateAppDataHumidorsToTable,
  saveSupabaseHumidors,
} from '@/lib/supabaseHumidors';
import {
  migrateAppDataReflectionsToTable,
  saveSupabaseReflections,
} from '@/lib/supabaseReflections';
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

type LocalCacheData = {
  humidors: string[];
  cigars: StoredCigar[];
  smokeLogs: SmokeLogEntry[];
  reflections: ReflectionDrafts;
  wishList: WishListItem[];
  pairingTypes: PairingType[];
  pairingLogs: PairingLog[];
  quickLogSelection: QuickLogSelection | null;
};

type CigarAppContextValue = {
  hasLoadedStorage: boolean;
  user: User | null;
  humidors: string[];
  setHumidors: React.Dispatch<React.SetStateAction<string[]>>;
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

const defaultHumidors: string[] = [];
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

function buildLocalCacheData(): LocalCacheData {
  return {
    humidors: safeParse<string[]>(localStorage.getItem('humidors'), defaultHumidors),
    cigars: safeParse<StoredCigar[]>(localStorage.getItem('cigars'), fallbackCigars),
    smokeLogs: safeParse<SmokeLogEntry[]>(localStorage.getItem('smokeLogs'), []),
    reflections: safeParse<ReflectionDrafts>(localStorage.getItem('smokeReflections'), {}),
    wishList: safeParse<WishListItem[]>(localStorage.getItem('wishList'), defaultWishList),
    pairingTypes: safeParse<PairingType[]>(
      localStorage.getItem('pairingTypes'),
      defaultPairingTypes
    ),
    pairingLogs: safeParse<PairingLog[]>(
      localStorage.getItem('pairingLogs'),
      defaultPairingLogs
    ),
    quickLogSelection: safeParse<QuickLogSelection | null>(
      localStorage.getItem('quickLogSelection'),
      null
    ),
  };
}

export function CigarAppProvider({ children }: { children: ReactNode }) {
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isApplyingCloudData, setIsApplyingCloudData] = useState(false);

  const [humidors, setHumidors] = useState<string[]>(defaultHumidors);
  const [cigars, setCigars] = useState<StoredCigar[]>(fallbackCigars);
  const [smokeLogs, setSmokeLogs] = useState<SmokeLogEntry[]>([]);
  const [reflections, setReflections] = useState<ReflectionDrafts>({});
  const [wishList, setWishList] = useState<WishListItem[]>(defaultWishList);
  const [pairingTypes, setPairingTypes] = useState<PairingType[]>(defaultPairingTypes);
  const [pairingLogs, setPairingLogs] = useState<PairingLog[]>(defaultPairingLogs);
  const [quickLogSelection, setQuickLogSelection] = useState<QuickLogSelection | null>(null);

  function applyNormalizedData(data: LocalCacheData) {
    setIsApplyingCloudData(true);

    setHumidors(Array.isArray(data.humidors) ? data.humidors : defaultHumidors);
    setCigars(Array.isArray(data.cigars) ? data.cigars : fallbackCigars);
    setSmokeLogs(Array.isArray(data.smokeLogs) ? data.smokeLogs : []);
    setReflections(
      data.reflections && typeof data.reflections === 'object'
        ? data.reflections
        : {}
    );
    setWishList(Array.isArray(data.wishList) ? data.wishList : defaultWishList);
    setPairingTypes(
      Array.isArray(data.pairingTypes) && data.pairingTypes.length > 0
        ? data.pairingTypes
        : defaultPairingTypes
    );
    setPairingLogs(
      Array.isArray(data.pairingLogs) ? data.pairingLogs : defaultPairingLogs
    );
    setQuickLogSelection(data.quickLogSelection ?? null);

    window.setTimeout(() => {
      setIsApplyingCloudData(false);
    }, 0);
  }

  function refreshFromStorage() {
    applyNormalizedData(buildLocalCacheData());
  }

  async function loadSupabaseUserAndData() {
    const {
      data: { user: nextUser },
    } = await supabase.auth.getUser();

    setUser(nextUser);

    if (!nextUser) {
      setHasLoadedStorage(true);
      return;
    }

    try {
      const localData = buildLocalCacheData();

      const [
        tableHumidors,
        tableCigars,
        tableSmokeLogs,
        tableReflections,
        tableWishList,
        tablePairingTypes,
        tablePairingLogs,
      ] = await Promise.all([
        migrateAppDataHumidorsToTable(localData.humidors),
        getSupabaseCigars(),
        migrateAppDataSmokeLogsToTable(localData.smokeLogs),
        migrateAppDataReflectionsToTable(localData.reflections),
        migrateAppDataWishListToTable(localData.wishList),
        migrateAppDataPairingTypesToTable(localData.pairingTypes),
        migrateAppDataPairingLogsToTable(localData.pairingLogs),
      ]);

      applyNormalizedData({
        humidors: tableHumidors,
        cigars: tableCigars,
        smokeLogs: tableSmokeLogs,
        reflections: tableReflections,
        wishList: tableWishList,
        pairingTypes: tablePairingTypes,
        pairingLogs: tablePairingLogs,
        quickLogSelection: localData.quickLogSelection,
      });
    } catch (error) {
      console.error('Failed to load normalized Supabase data:', error);
    }

    setHasLoadedStorage(true);
  }

  useEffect(() => {
    refreshFromStorage();
    loadSupabaseUserAndData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        loadSupabaseUserAndData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;

    localStorage.setItem('humidors', JSON.stringify(humidors));
    localStorage.setItem('cigars', JSON.stringify(cigars));
    localStorage.setItem('smokeLogs', JSON.stringify(smokeLogs));
    localStorage.setItem('smokeReflections', JSON.stringify(reflections));
    localStorage.setItem('wishList', JSON.stringify(wishList));
    localStorage.setItem('pairingTypes', JSON.stringify(pairingTypes));
    localStorage.setItem('pairingLogs', JSON.stringify(pairingLogs));

    if (quickLogSelection) {
      localStorage.setItem('quickLogSelection', JSON.stringify(quickLogSelection));
    } else {
      localStorage.removeItem('quickLogSelection');
    }

    if (!user) return;
    if (isApplyingCloudData) return;

    saveSupabaseCigars(cigars).catch((error) => {
      console.error('Failed to save normalized Supabase cigars:', error);
    });

    saveSupabaseSmokeLogs(smokeLogs).catch((error) => {
      console.error('Failed to save normalized Supabase smoke logs:', error);
    });

    saveSupabasePairingTypes(pairingTypes).catch((error) => {
      console.error('Failed to save normalized Supabase pairing types:', error);
    });

    saveSupabasePairingLogs(pairingLogs).catch((error) => {
      console.error('Failed to save normalized Supabase pairing logs:', error);
    });

    saveSupabaseWishList(wishList).catch((error) => {
      console.error('Failed to save normalized Supabase wish list:', error);
    });

    saveSupabaseHumidors(humidors).catch((error) => {
      console.error('Failed to save normalized Supabase humidors:', error);
    });

    saveSupabaseReflections(reflections).catch((error) => {
      console.error('Failed to save normalized Supabase reflections:', error);
    });
  }, [
    hasLoadedStorage,
    user,
    isApplyingCloudData,
    humidors,
    cigars,
    smokeLogs,
    reflections,
    wishList,
    pairingTypes,
    pairingLogs,
    quickLogSelection,
  ]);

  const value = useMemo<CigarAppContextValue>(
    () => ({
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
      refreshFromStorage,
    }),
    [
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