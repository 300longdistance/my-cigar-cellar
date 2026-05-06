import { supabase } from '@/lib/supabase/client';

export async function getUserAppData<T>() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('app_data')
    .select('data')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw error;
  }

  return (data?.data as T) ?? null;
}

export async function saveUserAppData<T extends object>(appData: T) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not logged in');
  }

  const { error } = await supabase.from('app_data').upsert({
    user_id: user.id,
    data: appData,
  });

  if (error) {
    throw error;
  }
}