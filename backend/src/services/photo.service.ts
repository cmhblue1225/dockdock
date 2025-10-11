import { supabase } from './supabase.service';
import { ReadingPhoto, PhotoWithRecord } from '../types/photo.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Supabase Storage에 사진 업로드
 */
export async function uploadPhotoToStorage(
  userId: string,
  file: Express.Multer.File
): Promise<string> {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${userId}/${uuidv4()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('reading-photos')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`사진 업로드 실패: ${error.message}`);
  }

  // Public URL 생성
  const { data: { publicUrl } } = supabase.storage
    .from('reading-photos')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * 독서 사진 생성
 */
export async function createReadingPhoto(
  userId: string,
  readingRecordId: string,
  photoUrl: string
): Promise<ReadingPhoto> {
  const { data, error } = await supabase
    .from('reading_photos')
    .insert({
      reading_record_id: readingRecordId,
      user_id: userId,
      photo_url: photoUrl,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`사진 등록 실패: ${error.message}`);
  }

  return data as ReadingPhoto;
}

/**
 * 특정 기록의 사진 목록 조회
 */
export async function getPhotosByRecordId(
  readingRecordId: string,
  userId: string
): Promise<ReadingPhoto[]> {
  const { data, error } = await supabase
    .from('reading_photos')
    .select('*')
    .eq('reading_record_id', readingRecordId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`사진 목록 조회 실패: ${error.message}`);
  }

  return data as ReadingPhoto[];
}

/**
 * 사진 삭제
 */
export async function deleteReadingPhoto(
  photoId: string,
  userId: string
): Promise<void> {
  // 사진 정보 조회
  const { data: photo, error: fetchError } = await supabase
    .from('reading_photos')
    .select('photo_url')
    .eq('id', photoId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !photo) {
    throw new Error('사진을 찾을 수 없습니다');
  }

  // Storage에서 파일 삭제
  const urlParts = photo.photo_url.split('/reading-photos/');
  if (urlParts.length > 1) {
    const filePath = urlParts[1];
    await supabase.storage.from('reading-photos').remove([filePath]);
  }

  // DB에서 레코드 삭제
  const { error } = await supabase
    .from('reading_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`사진 삭제 실패: ${error.message}`);
  }
}
