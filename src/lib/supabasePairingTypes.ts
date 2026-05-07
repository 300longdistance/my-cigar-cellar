import { supabase } from '@/lib/supabase/client';
import type { PairingType } from '@/types/pairing';

type SupabasePairingTypeRow = {
  id: number;
  user_id: string;
  legacy_id: number | null;
  name: string;
  category: string;
  pairing_key: string;
};

function normalizeText(value: string | undefined) {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function getPairingKey(pairingType: PairingType) {
  return [normalizeText(pairingType.category), normalizeText(pairingType.name)].join('|');
}

function rowToPairingType(row: SupabasePairingTypeRow): PairingType {
  return {
    id: row.legacy_id ?? row.id,
    name: row.name,
    category: row.category,
  };
}

function pairingTypeToRow(pairingType: PairingType, userId: string) {
  return {
    user_id: userId,
    legacy_id: pairingType.id,
    name: pairingType.name ?? '',
    category: pairingType.category ?? 'Other',
    pairing_key: getPairingKey(pairingType),
  };
}

function mergePairingTypes(existing: PairingType | undefined, incoming: PairingType) {
  if (!existing) return incoming;

  return {
    ...existing,
    ...incoming,
    name: incoming.name || existing.name,
    category: incoming.category || existing.category,
  };
}

function dedupePairingTypes(pairingTypes: PairingType[]) {
  const pairingTypeMap = new Map<string, PairingType>();

  pairingTypes.forEach((pairingType) => {
    const key = getPairingKey(pairingType);
    const existing = pairingTypeMap.get(key);
    pairingTypeMap.set(key, mergePairingTypes(existing, pairingType));
  });

  return Array.from(pairingTypeMap.values());
}

export async function getSupabasePairingTypes() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('pairing_types')
    .select('*')
    .eq('user_id', user.id)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return dedupePairingTypes(
    ((data ?? []) as SupabasePairingTypeRow[]).map(rowToPairingType)
  );
}

export async function saveSupabasePairingTypes(pairingTypes: PairingType[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const dedupedPairingTypes = dedupePairingTypes(pairingTypes);

  if (dedupedPairingTypes.length === 0) {
    return;
  }

  const rows = dedupedPairingTypes.map((pairingType) =>
    pairingTypeToRow(pairingType, user.id)
  );

  const { error } = await supabase
    .from('pairing_types')
    .upsert(rows, {
      onConflict: 'user_id,pairing_key',
    });

  if (error) {
    throw error;
  }
}

export async function migrateAppDataPairingTypesToTable(
  pairingTypes: PairingType[]
) {
  const existingPairingTypes = await getSupabasePairingTypes();

  if (existingPairingTypes.length > 0) {
    return existingPairingTypes;
  }

  const dedupedPairingTypes = dedupePairingTypes(pairingTypes);

  await saveSupabasePairingTypes(dedupedPairingTypes);

  return dedupedPairingTypes;
}