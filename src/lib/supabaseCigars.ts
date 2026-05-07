import { supabase } from '@/lib/supabase/client';
import type { StoredCigar } from '@/context/CigarAppContext';

type SupabaseCigarRow = {
  id: number;
  user_id: string;
  legacy_id: number | null;
  cigar_key: string | null;
  name: string;
  brand: string;
  humidor: string;
  qty: number;
  origin: string | null;
  wrapper: string | null;
  strength: string | null;
  size: string | null;
  notes: string | null;
  favorite: boolean;
  image: string | null;
};

function normalizeText(value: string | undefined) {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function getCigarKey(cigar: StoredCigar) {
  return [
    normalizeText(cigar.brand),
    normalizeText(cigar.name),
    normalizeText(cigar.humidor),
    normalizeText(cigar.size),
    normalizeText(cigar.wrapper),
  ].join('|');
}

function rowToStoredCigar(row: SupabaseCigarRow): StoredCigar {
  return {
    id: row.legacy_id ?? row.id,
    name: row.name,
    brand: row.brand,
    humidor: row.humidor,
    qty: row.qty,
    origin: row.origin ?? undefined,
    wrapper: row.wrapper ?? undefined,
    strength: row.strength ?? undefined,
    size: row.size ?? undefined,
    notes: row.notes ?? undefined,
    favorite: row.favorite,
    image: row.image ?? undefined,
  };
}

function storedCigarToRow(cigar: StoredCigar, userId: string) {
  return {
    user_id: userId,
    legacy_id: cigar.id,
    cigar_key: getCigarKey(cigar),
    name: cigar.name ?? '',
    brand: cigar.brand ?? '',
    humidor: cigar.humidor ?? '',
    qty: cigar.qty ?? 0,
    origin: cigar.origin ?? null,
    wrapper: cigar.wrapper ?? null,
    strength: cigar.strength ?? null,
    size: cigar.size ?? null,
    notes: cigar.notes ?? null,
    favorite: cigar.favorite ?? false,
    image: cigar.image ?? null,
  };
}

function mergeCigars(existing: StoredCigar | undefined, incoming: StoredCigar) {
  if (!existing) return incoming;

  return {
    ...existing,
    ...incoming,
    qty: Math.max(existing.qty ?? 0, incoming.qty ?? 0),
    image: incoming.image ?? existing.image,
    notes: incoming.notes || existing.notes,
    favorite: existing.favorite || incoming.favorite,
  };
}

function dedupeCigars(cigars: StoredCigar[]) {
  const cigarMap = new Map<string, StoredCigar>();

  cigars.forEach((cigar) => {
    const key = getCigarKey(cigar);
    const existing = cigarMap.get(key);
    cigarMap.set(key, mergeCigars(existing, cigar));
  });

  return Array.from(cigarMap.values());
}

export async function getSupabaseCigars() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('cigars')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return dedupeCigars(((data ?? []) as SupabaseCigarRow[]).map(rowToStoredCigar));
}

export async function saveSupabaseCigars(cigars: StoredCigar[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const dedupedCigars = dedupeCigars(cigars);

  if (dedupedCigars.length === 0) {
    return;
  }

  const rows = dedupedCigars.map((cigar) => storedCigarToRow(cigar, user.id));

  const { error } = await supabase
    .from('cigars')
    .upsert(rows, {
      onConflict: 'user_id,cigar_key',
    });

  if (error) {
    throw error;
  }
}

export async function replaceSupabaseCigars(cigars: StoredCigar[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const deleteResult = await supabase
    .from('cigars')
    .delete()
    .eq('user_id', user.id);

  if (deleteResult.error) {
    throw deleteResult.error;
  }

  const dedupedCigars = dedupeCigars(cigars);

  if (dedupedCigars.length === 0) {
    return;
  }

  const rows = dedupedCigars.map((cigar) => storedCigarToRow(cigar, user.id));

  const insertResult = await supabase.from('cigars').insert(rows);

  if (insertResult.error) {
    throw insertResult.error;
  }
}

export async function migrateAppDataCigarsToTable(cigars: StoredCigar[]) {
  const existingCigars = await getSupabaseCigars();

  if (existingCigars.length > 0) {
    return existingCigars;
  }

  const dedupedCigars = dedupeCigars(cigars);

  await saveSupabaseCigars(dedupedCigars);

  return dedupedCigars;
}