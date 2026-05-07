import { supabase } from '@/lib/supabase/client';
import type { StoredCigar } from '@/context/CigarAppContext';

type SupabaseCigarRow = {
  id: number;
  user_id: string;
  legacy_id: number | null;
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

  return ((data ?? []) as SupabaseCigarRow[]).map(rowToStoredCigar);
}

export async function saveSupabaseCigars(cigars: StoredCigar[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  if (cigars.length === 0) {
    return;
  }

  const rows = cigars.map((cigar) => storedCigarToRow(cigar, user.id));

  const { error } = await supabase
    .from('cigars')
    .upsert(rows, {
      onConflict: 'user_id,legacy_id',
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

  if (cigars.length === 0) {
    return;
  }

  const rows = cigars.map((cigar) => storedCigarToRow(cigar, user.id));

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

  await saveSupabaseCigars(cigars);

  return cigars;
}