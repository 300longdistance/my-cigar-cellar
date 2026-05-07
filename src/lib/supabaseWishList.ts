import { supabase } from '@/lib/supabase/client';
import type { WishListItem } from '@/context/CigarAppContext';

type SupabaseWishListRow = {
  id: number;
  user_id: string;
  legacy_id: number | null;
  wish_key: string;

  name: string;
  brand: string;
  vitola: string;
  wrapper: string;
  origin: string;
  strength: string;
  notes: string;
  priority: string;
};

function normalizeText(value: string | undefined | null) {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function getWishKey(item: WishListItem) {
  return [
    normalizeText(item.brand),
    normalizeText(item.name),
    normalizeText(item.vitola),
    normalizeText(item.wrapper),
  ].join('|');
}

function rowToWishListItem(row: SupabaseWishListRow): WishListItem {
  return {
    id: row.legacy_id ?? row.id,
    name: row.name,
    brand: row.brand,
    vitola: row.vitola,
    wrapper: row.wrapper,
    origin: row.origin,
    strength: row.strength,
    notes: row.notes,
    priority:
      row.priority === 'High' ||
      row.priority === 'Low'
        ? row.priority
        : 'Medium',
  };
}

function wishListItemToRow(item: WishListItem, userId: string) {
  return {
    user_id: userId,
    legacy_id: item.id,
    wish_key: getWishKey(item),

    name: item.name ?? '',
    brand: item.brand ?? '',
    vitola: item.vitola ?? '',
    wrapper: item.wrapper ?? '',
    origin: item.origin ?? '',
    strength: item.strength ?? '',
    notes: item.notes ?? '',
    priority: item.priority ?? 'Medium',
  };
}

function mergeWishListItems(
  existing: WishListItem | undefined,
  incoming: WishListItem
) {
  if (!existing) return incoming;

  return {
    ...existing,
    ...incoming,
    notes: incoming.notes || existing.notes,
    priority: incoming.priority || existing.priority,
  };
}

function dedupeWishList(items: WishListItem[]) {
  const itemMap = new Map<string, WishListItem>();

  items.forEach((item) => {
    const key = getWishKey(item);
    const existing = itemMap.get(key);

    itemMap.set(key, mergeWishListItems(existing, item));
  });

  return Array.from(itemMap.values());
}

export async function getSupabaseWishList() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('wish_list')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return dedupeWishList(
    ((data ?? []) as SupabaseWishListRow[]).map(rowToWishListItem)
  );
}

export async function saveSupabaseWishList(items: WishListItem[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const dedupedItems = dedupeWishList(items);

  if (dedupedItems.length === 0) {
    return;
  }

  const rows = dedupedItems.map((item) =>
    wishListItemToRow(item, user.id)
  );

  const { error } = await supabase
    .from('wish_list')
    .upsert(rows, {
      onConflict: 'user_id,wish_key',
    });

  if (error) {
    throw error;
  }
}

export async function migrateAppDataWishListToTable(
  items: WishListItem[]
) {
  const existingItems = await getSupabaseWishList();

  if (existingItems.length > 0) {
    return existingItems;
  }

  const dedupedItems = dedupeWishList(items);

  await saveSupabaseWishList(dedupedItems);

  return dedupedItems;
}