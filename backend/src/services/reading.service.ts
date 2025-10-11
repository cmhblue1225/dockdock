import { supabase } from './supabase.service';
import {
  ReadingBook,
  ReadingBookWithBook,
  ReadingBookStatus,
  CreateReadingBookDto,
  UpdateReadingBookDto,
} from '../types/reading.types';

/**
 * 읽고 있는 책 목록 조회 (필터링 지원)
 */
export async function getReadingBooks(
  userId: string,
  status?: ReadingBookStatus,
  limit: number = 20,
  offset: number = 0
): Promise<{ data: ReadingBookWithBook[]; total: number }> {
  let query = supabase
    .from('reading_books')
    .select(
      `
      *,
      book:books (
        id,
        title,
        author,
        publisher,
        cover_image_url,
        page_count
      )
    `,
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // status 필터링
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`읽고 있는 책 조회 실패: ${error.message}`);
  }

  return {
    data: data as ReadingBookWithBook[],
    total: count || 0,
  };
}

/**
 * 특정 읽고 있는 책 조회
 */
export async function getReadingBookById(
  id: string,
  userId: string
): Promise<ReadingBookWithBook | null> {
  const { data, error } = await supabase
    .from('reading_books')
    .select(
      `
      *,
      book:books (
        id,
        title,
        author,
        publisher,
        cover_image_url,
        page_count,
        description
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
    throw new Error(`읽고 있는 책 조회 실패: ${error.message}`);
  }

  return data as ReadingBookWithBook;
}

/**
 * 읽고 있는 책 등록
 */
export async function createReadingBook(
  userId: string,
  dto: CreateReadingBookDto
): Promise<ReadingBook> {
  // 중복 체크 (같은 사용자가 같은 책을 이미 등록했는지)
  const { data: existing } = await supabase
    .from('reading_books')
    .select('id')
    .eq('user_id', userId)
    .eq('book_id', dto.book_id)
    .single();

  if (existing) {
    throw new Error('이미 등록된 책입니다');
  }

  const { data, error } = await supabase
    .from('reading_books')
    .insert({
      user_id: userId,
      book_id: dto.book_id,
      status: dto.status,
      current_page: dto.current_page || 0,
      total_pages: dto.total_pages || null,
      started_at: dto.started_at || (dto.status === 'reading' ? new Date().toISOString() : null),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`읽고 있는 책 등록 실패: ${error.message}`);
  }

  return data as ReadingBook;
}

/**
 * 읽고 있는 책 업데이트
 */
export async function updateReadingBook(
  id: string,
  userId: string,
  dto: UpdateReadingBookDto
): Promise<ReadingBook> {
  const updateData: any = {
    ...dto,
    updated_at: new Date().toISOString(),
  };

  // status가 'reading'으로 변경되는데 started_at이 없으면 자동 설정
  if (dto.status === 'reading' && !dto.started_at) {
    const { data: existing } = await supabase
      .from('reading_books')
      .select('started_at')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (existing && !existing.started_at) {
      updateData.started_at = new Date().toISOString();
    }
  }

  // status가 'completed'로 변경되는데 completed_at이 없으면 자동 설정
  if (dto.status === 'completed' && !dto.completed_at) {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('reading_books')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`읽고 있는 책 업데이트 실패: ${error.message}`);
  }

  return data as ReadingBook;
}

/**
 * 읽고 있는 책 삭제
 */
export async function deleteReadingBook(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('reading_books')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`읽고 있는 책 삭제 실패: ${error.message}`);
  }
}
