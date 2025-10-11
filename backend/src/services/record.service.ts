import { supabase } from './supabase.service';
import {
  ReadingRecord,
  ReadingRecordWithBook,
  CreateReadingRecordDto,
  UpdateReadingRecordDto,
} from '../types/record.types';

/**
 * 독서 기록 목록 조회 (특정 책 또는 전체)
 */
export async function getReadingRecords(
  userId: string,
  readingBookId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: ReadingRecordWithBook[]; total: number }> {
  let query = supabase
    .from('reading_records')
    .select(
      `
      *,
      reading_book:reading_books (
        id,
        book_id,
        status,
        book:books (
          id,
          title,
          author,
          cover_image_url
        )
      )
    `,
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // 특정 책의 기록만 조회
  if (readingBookId) {
    query = query.eq('reading_book_id', readingBookId);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`독서 기록 조회 실패: ${error.message}`);
  }

  return {
    data: data as ReadingRecordWithBook[],
    total: count || 0,
  };
}

/**
 * 특정 독서 기록 조회
 */
export async function getReadingRecordById(
  id: string,
  userId: string
): Promise<ReadingRecordWithBook | null> {
  const { data, error } = await supabase
    .from('reading_records')
    .select(
      `
      *,
      reading_book:reading_books (
        id,
        book_id,
        status,
        book:books (
          id,
          title,
          author,
          cover_image_url
        )
      )
    `
    )
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`독서 기록 조회 실패: ${error.message}`);
  }

  return data as ReadingRecordWithBook;
}

/**
 * 독서 기록 생성
 */
export async function createReadingRecord(
  userId: string,
  dto: CreateReadingRecordDto
): Promise<ReadingRecord> {
  // reading_book이 현재 사용자의 것인지 확인
  const { data: readingBook } = await supabase
    .from('reading_books')
    .select('id')
    .eq('id', dto.reading_book_id)
    .eq('user_id', userId)
    .single();

  if (!readingBook) {
    throw new Error('해당 책을 찾을 수 없거나 권한이 없습니다');
  }

  const { data, error } = await supabase
    .from('reading_records')
    .insert({
      user_id: userId,
      reading_book_id: dto.reading_book_id,
      content: dto.content,
      page_number: dto.page_number || null,
      record_type: dto.record_type || 'note',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`독서 기록 생성 실패: ${error.message}`);
  }

  return data as ReadingRecord;
}

/**
 * 독서 기록 업데이트
 */
export async function updateReadingRecord(
  id: string,
  userId: string,
  dto: UpdateReadingRecordDto
): Promise<ReadingRecord> {
  const updateData: any = {
    ...dto,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('reading_records')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`독서 기록 업데이트 실패: ${error.message}`);
  }

  return data as ReadingRecord;
}

/**
 * 독서 기록 삭제
 */
export async function deleteReadingRecord(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('reading_records')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`독서 기록 삭제 실패: ${error.message}`);
  }
}
