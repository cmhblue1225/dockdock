import { supabase } from './supabase.service';
import {
  Review,
  ReviewWithBook,
  CreateReviewDto,
  UpdateReviewDto,
} from '../types/review.types';

/**
 * 리뷰 목록 조회 (특정 책 또는 전체)
 */
export async function getReviews(
  userId: string,
  readingBookId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: ReviewWithBook[]; total: number }> {
  let query = supabase
    .from('book_reviews')
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

  if (readingBookId) {
    query = query.eq('reading_book_id', readingBookId);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`리뷰 조회 실패: ${error.message}`);
  }

  return {
    data: data as ReviewWithBook[],
    total: count || 0,
  };
}

/**
 * 특정 리뷰 조회
 */
export async function getReviewById(
  id: string,
  userId: string
): Promise<ReviewWithBook | null> {
  const { data, error } = await supabase
    .from('book_reviews')
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
    throw new Error(`리뷰 조회 실패: ${error.message}`);
  }

  return data as ReviewWithBook;
}

/**
 * 리뷰 생성
 */
export async function createReview(
  userId: string,
  dto: CreateReviewDto
): Promise<Review> {
  // reading_book이 현재 사용자의 것인지 확인하고 book_id도 가져오기
  const { data: readingBook } = await supabase
    .from('reading_books')
    .select('id, book_id')
    .eq('id', dto.reading_book_id)
    .eq('user_id', userId)
    .single();

  if (!readingBook) {
    throw new Error('해당 책을 찾을 수 없거나 권한이 없습니다');
  }

  // 이미 리뷰가 있는지 확인
  const { data: existing } = await supabase
    .from('book_reviews')
    .select('id')
    .eq('reading_book_id', dto.reading_book_id)
    .eq('user_id', userId)
    .single();

  if (existing) {
    throw new Error('이미 이 책에 대한 리뷰가 존재합니다');
  }

  const { data, error } = await supabase
    .from('book_reviews')
    .insert({
      user_id: userId,
      book_id: readingBook.book_id,
      reading_book_id: dto.reading_book_id,
      rating: dto.rating,
      review_text: dto.review_text || null,
      is_public: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`리뷰 생성 실패: ${error.message}`);
  }

  return data as Review;
}

/**
 * 리뷰 업데이트
 */
export async function updateReview(
  id: string,
  userId: string,
  dto: UpdateReviewDto
): Promise<Review> {
  const updateData: any = {
    ...dto,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('book_reviews')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`리뷰 업데이트 실패: ${error.message}`);
  }

  return data as Review;
}

/**
 * 리뷰 삭제
 */
export async function deleteReview(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('book_reviews')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`리뷰 삭제 실패: ${error.message}`);
  }
}
