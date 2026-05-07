import { supabase } from '@/lib/supabase/client';

const BUCKET_NAME = 'cigar-images';

function getFileExtension(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension) return 'jpg';

  return extension.replace(/[^a-z0-9]/g, '') || 'jpg';
}

export async function uploadCigarImage(file: File, cigarId: number | string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to upload cigar images.');
  }

  const extension = getFileExtension(file);
  const filePath = `${user.id}/${cigarId}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return data.publicUrl;
}