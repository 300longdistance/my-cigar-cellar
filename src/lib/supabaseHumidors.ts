import { supabase } from '@/lib/supabase/client';

type SupabaseHumidorRow = {
  id: number;
  user_id: string;
  name: string;
  humidor_key: string;
  sort_order: number;
};

function normalizeText(value: string | undefined | null) {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function getHumidorKey(name: string) {
  return normalizeText(name);
}

function dedupeHumidors(humidors: string[]) {
  const map = new Map<string, string>();

  humidors.forEach((humidor) => {
    const trimmed = humidor.trim();
    if (!trimmed) return;

    map.set(getHumidorKey(trimmed), trimmed);
  });

  return Array.from(map.values());
}

function rowToHumidor(row: SupabaseHumidorRow) {
  return row.name;
}

function humidorToRow(name: string, userId: string, sortOrder: number) {
  return {
    user_id: userId,
    name,
    humidor_key: getHumidorKey(name),
    sort_order: sortOrder,
  };
}

export async function getSupabaseHumidors() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('humidors')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;

  return dedupeHumidors(
    ((data ?? []) as SupabaseHumidorRow[]).map(rowToHumidor)
  );
}

export async function saveSupabaseHumidors(humidors: string[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const dedupedHumidors = dedupeHumidors(humidors);

  if (dedupedHumidors.length === 0) return;

  const rows = dedupedHumidors.map((humidor, index) =>
    humidorToRow(humidor, user.id, index)
  );

  const { error } = await supabase.from('humidors').upsert(rows, {
    onConflict: 'user_id,humidor_key',
  });

  if (error) throw error;
}

export async function migrateAppDataHumidorsToTable(humidors: string[]) {
  const existingHumidors = await getSupabaseHumidors();

  if (existingHumidors.length > 0) return existingHumidors;

  const dedupedHumidors = dedupeHumidors(humidors);

  await saveSupabaseHumidors(dedupedHumidors);

  return dedupedHumidors;
}