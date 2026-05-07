import { supabase } from '@/lib/supabase/client';
import type { ReflectionDrafts } from '@/context/CigarAppContext';

type SupabaseReflectionRow = {
  id: number;
  user_id: string;
  smoke_log_id: number;
  reflection: string;
};

function reflectionsToRows(reflections: ReflectionDrafts, userId: string) {
  return Object.entries(reflections)
    .filter(([, reflection]) => reflection.trim().length > 0)
    .map(([smokeLogId, reflection]) => ({
      user_id: userId,
      smoke_log_id: Number(smokeLogId),
      reflection,
    }));
}

function rowsToReflections(rows: SupabaseReflectionRow[]) {
  return rows.reduce<ReflectionDrafts>((drafts, row) => {
    drafts[row.smoke_log_id] = row.reflection;
    return drafts;
  }, {});
}

export async function getSupabaseReflections() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return {};

  const { data, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;

  return rowsToReflections((data ?? []) as SupabaseReflectionRow[]);
}

export async function saveSupabaseReflections(reflections: ReflectionDrafts) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const rows = reflectionsToRows(reflections, user.id);

  if (rows.length === 0) return;

  const { error } = await supabase.from('reflections').upsert(rows, {
    onConflict: 'user_id,smoke_log_id',
  });

  if (error) throw error;
}

export async function migrateAppDataReflectionsToTable(
  reflections: ReflectionDrafts
) {
  const existingReflections = await getSupabaseReflections();

  if (Object.keys(existingReflections).length > 0) {
    return existingReflections;
  }

  await saveSupabaseReflections(reflections);

  return reflections;
}