import { supabase } from '@/lib/supabase/client';
import type { SmokeLogEntry } from '@/context/CigarAppContext';

type SupabaseSmokeLogRow = {
  id: number;
  user_id: string;
  legacy_id: number | null;
  cigar_id: number | null;
  cigar_name: string;
  brand: string;
  humidor: string;
  rating: number;
  notes: string;
  pairing: string;
  logged_at: string;
};

function rowToSmokeLog(row: SupabaseSmokeLogRow): SmokeLogEntry {
  return {
    id: row.legacy_id ?? row.id,
    cigarId: row.cigar_id ?? 0,
    cigarName: row.cigar_name,
    brand: row.brand,
    humidor: row.humidor,
    rating: row.rating,
    notes: row.notes,
    pairing: row.pairing,
    loggedAt: row.logged_at,
  };
}

function smokeLogToRow(log: SmokeLogEntry, userId: string) {
  return {
    user_id: userId,
    legacy_id: log.id,
    cigar_id: log.cigarId ?? null,
    cigar_name: log.cigarName ?? '',
    brand: log.brand ?? '',
    humidor: log.humidor ?? '',
    rating: log.rating ?? 0,
    notes: log.notes ?? '',
    pairing: log.pairing ?? '',
    logged_at: log.loggedAt ?? new Date().toISOString(),
  };
}

export async function getSupabaseSmokeLogs() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('smoke_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as SupabaseSmokeLogRow[]).map(rowToSmokeLog);
}

export async function saveSupabaseSmokeLogs(logs: SmokeLogEntry[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  if (logs.length === 0) {
    return;
  }

  const rows = logs.map((log) => smokeLogToRow(log, user.id));

  const { error } = await supabase
    .from('smoke_logs')
    .upsert(rows, {
      onConflict: 'user_id,legacy_id',
    });

  if (error) {
    throw error;
  }
}

export async function migrateAppDataSmokeLogsToTable(
  logs: SmokeLogEntry[]
) {
  const existingLogs = await getSupabaseSmokeLogs();

  if (existingLogs.length > 0) {
    return existingLogs;
  }

  await saveSupabaseSmokeLogs(logs);

  return logs;
}