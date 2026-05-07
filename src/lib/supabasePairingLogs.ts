import { supabase } from '@/lib/supabase/client';
import type { PairingLog } from '@/types/pairing';

type SupabasePairingLogRow = {
  id: number;
  user_id: string;
  legacy_id: number | null;
  pairing_log_key: string;

  cigar_id: number | null;
  cigar_name: string | null;
  cigar_brand: string | null;

  pairing: string | null;
  pairing_type: string | null;

  pairing_type_id: number | null;
  rating: number;
  notes: string | null;

  paired_at: string;
};

function normalizeText(value: string | undefined | null) {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function getPairingLogDate(log: PairingLog) {
  return log.pairedAt ?? log.loggedAt ?? new Date().toISOString();
}

function getPairingLogKey(log: PairingLog) {
  return [
    log.id,
    normalizeText(log.cigarName),
    normalizeText(log.cigarBrand),
    normalizeText(log.pairing),
    normalizeText(log.pairingType),
    getPairingLogDate(log),
  ].join('|');
}

function rowToPairingLog(row: SupabasePairingLogRow): PairingLog {
  return {
    id: row.legacy_id ?? row.id,

    cigarId: row.cigar_id ?? null,

    cigarName: row.cigar_name ?? undefined,
    cigarBrand: row.cigar_brand ?? undefined,
    pairing: row.pairing ?? undefined,
    pairingType: row.pairing_type ?? undefined,
    loggedAt: row.paired_at,

    pairingTypeId: row.pairing_type_id ?? undefined,
    rating: row.rating,
    notes: row.notes ?? undefined,
    pairedAt: row.paired_at,
  };
}

function pairingLogToRow(log: PairingLog, userId: string) {
  const pairedAt = getPairingLogDate(log);

  return {
    user_id: userId,
    legacy_id: log.id,
    pairing_log_key: getPairingLogKey(log),

    cigar_id: log.cigarId ?? null,
    cigar_name: log.cigarName ?? null,
    cigar_brand: log.cigarBrand ?? null,

    pairing: log.pairing ?? null,
    pairing_type: log.pairingType ?? null,

    pairing_type_id: log.pairingTypeId ?? null,
    rating: log.rating ?? 0,
    notes: log.notes ?? null,

    paired_at: pairedAt,
  };
}

function mergePairingLogs(existing: PairingLog | undefined, incoming: PairingLog) {
  if (!existing) return incoming;

  return {
    ...existing,
    ...incoming,
    rating: Math.max(existing.rating ?? 0, incoming.rating ?? 0),
    notes: incoming.notes || existing.notes,
    pairing: incoming.pairing || existing.pairing,
    pairingType: incoming.pairingType || existing.pairingType,
  };
}

function dedupePairingLogs(pairingLogs: PairingLog[]) {
  const pairingLogMap = new Map<string, PairingLog>();

  pairingLogs.forEach((log) => {
    const key = getPairingLogKey(log);
    const existing = pairingLogMap.get(key);
    pairingLogMap.set(key, mergePairingLogs(existing, log));
  });

  return Array.from(pairingLogMap.values());
}

export async function getSupabasePairingLogs() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('pairing_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('paired_at', { ascending: false });

  if (error) {
    throw error;
  }

  return dedupePairingLogs(
    ((data ?? []) as SupabasePairingLogRow[]).map(rowToPairingLog)
  );
}

export async function saveSupabasePairingLogs(pairingLogs: PairingLog[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const dedupedPairingLogs = dedupePairingLogs(pairingLogs);

  if (dedupedPairingLogs.length === 0) {
    return;
  }

  const rows = dedupedPairingLogs.map((log) => pairingLogToRow(log, user.id));

  const { error } = await supabase
    .from('pairing_logs')
    .upsert(rows, {
      onConflict: 'user_id,pairing_log_key',
    });

  if (error) {
    throw error;
  }
}

export async function migrateAppDataPairingLogsToTable(pairingLogs: PairingLog[]) {
  const existingPairingLogs = await getSupabasePairingLogs();

  if (existingPairingLogs.length > 0) {
    return existingPairingLogs;
  }

  const dedupedPairingLogs = dedupePairingLogs(pairingLogs);

  await saveSupabasePairingLogs(dedupedPairingLogs);

  return dedupedPairingLogs;
}