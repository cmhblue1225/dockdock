import { supabase } from './supabase.service';
import { getOpenAIService } from './openai.service';
import { getAladinClient } from './aladin.service';
import {
  Recommendation,
  TrendingBook,
  RecommendedBook,
  UserPreference,
} from '../types/recommendation.types';

/**
 * 개인화 추천 가져오기
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10,
  forceRefresh: boolean = false
): Promise<RecommendedBook[]> {
  try {
    // 캐시된 추천이 있는지 확인 (24시간 이내)
    if (!forceRefresh) {
      const { data: cachedRecs } = await supabase
        .from('recommendations')
        .select(
          `
          *,
          book:books (
            id,
            title,
            author,
            publisher,
            cover_image_url,
            description,
            category,
            aladin_id
          )
        `
        )
        .eq('user_id', userId)
        .eq('recommendation_type', 'personalized')
        .gt('expires_at', new Date().toISOString())
        .order('score', { ascending: false })
        .limit(limit);

      if (cachedRecs && cachedRecs.length >= limit) {
        return cachedRecs.map((rec: any) => ({
          id: rec.book.id,
          aladinId: rec.book.aladin_id,
          title: rec.book.title,
          author: rec.book.author,
          publisher: rec.book.publisher,
          coverImage: rec.book.cover_image_url,
          description: rec.book.description,
          category: rec.book.category,
          reason: rec.reason || 'AI가 당신을 위해 선정한 책입니다',
          score: rec.score,
        }));
      }
    }

    // 사용자 취향 가져오기
    const { data: preference } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!preference || !preference.onboarding_completed) {
      // 온보딩 미완료 시 트렌딩 책 반환
      return getTrendingBooks(limit);
    }

    // 읽은 책 가져오기
    const { data: readingBooks } = await supabase
      .from('reading_books')
      .select(
        `
        *,
        book:books (title, author)
      `
      )
      .eq('user_id', userId)
      .in('status', ['completed', 'reading'])
      .order('updated_at', { ascending: false })
      .limit(20);

    // 위시리스트 가져오기
    const { data: wishlistBooks } = await supabase
      .from('reading_books')
      .select(
        `
        *,
        book:books (title, author)
      `
      )
      .eq('user_id', userId)
      .eq('status', 'wishlist')
      .order('updated_at', { ascending: false })
      .limit(10);

    // 평점 가져오기
    const { data: reviews } = await supabase
      .from('book_reviews')
      .select('book_id, rating')
      .eq('user_id', userId);

    const ratingMap = new Map(reviews?.map((r) => [r.book_id, r.rating]) || []);

    // OpenAI로 추천 생성 (확장된 선호도 활용)
    const openAI = getOpenAIService();
    const aiRecommendations = await openAI.generatePersonalizedRecommendations(
      preference.preferred_genres || [],
      readingBooks?.map((rb: any) => ({
        title: rb.book.title,
        author: rb.book.author,
        rating: ratingMap.get(rb.book_id),
      })) || [],
      wishlistBooks?.map((wb: any) => ({
        title: wb.book.title,
        author: wb.book.author,
      })) || [],
      limit,
      // 확장된 선호도 전달
      {
        reading_purposes: preference.reading_purposes || [],
        preferred_length: preference.preferred_length,
        reading_pace: preference.reading_pace,
        preferred_difficulty: preference.preferred_difficulty,
        preferred_moods: preference.preferred_moods || [],
        preferred_emotions: preference.preferred_emotions || [],
        narrative_styles: preference.narrative_styles || [],
        preferred_themes: preference.preferred_themes || [],
      }
    );

    // 알라딘 API로 실제 책 검색 및 저장
    const aladinClient = getAladinClient();
    const recommendations: RecommendedBook[] = [];
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    for (const aiRec of aiRecommendations) {
      try {
        // 제목으로 검색
        const { books } = await aladinClient.searchBooks({
          query: aiRec.title,
          queryType: 'Title',
          maxResults: 1,
        });

        if (books.length > 0) {
          const book = books[0];

          // books 테이블에 저장
          const { data: existingBook } = await supabase
            .from('books')
            .select('id')
            .eq('isbn13', book.isbn13)
            .single();

          let bookId = existingBook?.id;

          if (!bookId) {
            const { data: newBook } = await supabase
              .from('books')
              .insert({
                title: book.title,
                author: book.author,
                publisher: book.publisher,
                cover_image_url: book.coverImage,
                isbn: book.isbn,
                isbn13: book.isbn13,
                page_count: book.pageCount,
                description: book.description,
                category: book.categoryName,
                aladin_id: book.id,
              })
              .select('id')
              .single();

            bookId = newBook?.id;
          }

          if (bookId) {
            // 추천 캐시 저장
            await supabase.from('recommendations').upsert({
              user_id: userId,
              book_id: bookId,
              recommendation_type: 'personalized',
              score: aiRec.score,
              reason: aiRec.reason,
              expires_at: expiresAt.toISOString(),
            });

            recommendations.push({
              id: bookId,
              aladinId: book.id,
              title: book.title,
              author: book.author,
              publisher: book.publisher,
              coverImage: book.coverImage,
              description: book.description,
              category: book.categoryName,
              reason: aiRec.reason,
              score: aiRec.score,
            });
          }
        }
      } catch (error) {
        console.error(`책 검색 실패: ${aiRec.title}`, error);
        // 검색 실패한 책은 스킵
      }
    }

    return recommendations.slice(0, limit);
  } catch (error) {
    console.error('개인화 추천 생성 실패:', error);
    // 실패 시 트렌딩 책 반환
    return getTrendingBooks(limit);
  }
}

/**
 * 트렌딩 책 가져오기
 */
export async function getTrendingBooks(limit: number = 10): Promise<RecommendedBook[]> {
  try {
    const { data: trendingBooks } = await supabase
      .from('trending_books')
      .select(
        `
        *,
        book:books (
          id,
          title,
          author,
          publisher,
          cover_image_url,
          description,
          category,
          aladin_id
        )
      `
      )
      .eq('period', 'daily')
      .order('rank', { ascending: true })
      .limit(limit);

    if (!trendingBooks || trendingBooks.length === 0) {
      // 트렌딩 데이터가 없으면 최근 등록된 책 반환
      return getRecentBooks(limit);
    }

    return trendingBooks.map((tb: any) => ({
      id: tb.book.id,
      aladinId: tb.book.aladin_id,
      title: tb.book.title,
      author: tb.book.author,
      publisher: tb.book.publisher,
      coverImage: tb.book.cover_image_url,
      description: tb.book.description,
      category: tb.book.category,
      reason: `지금 가장 인기있는 책 ${tb.rank}위`,
      score: tb.score,
      rank: tb.rank,
    }));
  } catch (error) {
    console.error('트렌딩 책 조회 실패:', error);
    return getRecentBooks(limit);
  }
}

/**
 * 최근 등록된 책 가져오기 (폴백용)
 */
async function getRecentBooks(limit: number): Promise<RecommendedBook[]> {
  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return (
    books?.map((book) => ({
      id: book.id,
      aladinId: book.aladin_id,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      coverImage: book.cover_image_url,
      description: book.description,
      category: book.category,
      reason: '최근 등록된 책입니다',
      score: 0.5,
    })) || []
  );
}

/**
 * 유사한 책 가져오기
 */
export async function getSimilarBooks(
  bookId: string,
  limit: number = 5
): Promise<RecommendedBook[]> {
  try {
    // 기준 책 정보 가져오기
    const { data: book } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (!book) {
      throw new Error('책을 찾을 수 없습니다');
    }

    // OpenAI로 유사 책 찾기
    const openAI = getOpenAIService();
    const similarBooks = await openAI.findSimilarBooks(
      book.title,
      book.author || '',
      book.description,
      book.category,
      limit
    );

    // 알라딘 API로 실제 책 검색
    const aladinClient = getAladinClient();
    const recommendations: RecommendedBook[] = [];

    for (const simBook of similarBooks) {
      try {
        const { books } = await aladinClient.searchBooks({
          query: simBook.title,
          queryType: 'Title',
          maxResults: 1,
        });

        if (books.length > 0) {
          const foundBook = books[0];
          recommendations.push({
            id: foundBook.id,
            title: foundBook.title,
            author: foundBook.author,
            publisher: foundBook.publisher,
            coverImage: foundBook.coverImage,
            description: foundBook.description,
            category: foundBook.categoryName,
            reason: simBook.reason,
            score: simBook.score,
          });
        }
      } catch (error) {
        console.error(`유사 책 검색 실패: ${simBook.title}`, error);
      }
    }

    return recommendations.slice(0, limit);
  } catch (error) {
    console.error('유사 책 추천 실패:', error);
    return [];
  }
}

/**
 * 트렌딩 책 업데이트 (크론잡용)
 */
export async function updateTrendingBooks(): Promise<void> {
  try {
    // 최근 7일간 읽기 시작/완독 통계
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: bookStats } = await supabase.rpc('calculate_book_popularity', {
      since_date: sevenDaysAgo.toISOString(),
    });

    if (!bookStats) return;

    // 기존 트렌딩 삭제
    await supabase.from('trending_books').delete().eq('period', 'daily');

    // 새 트렌딩 저장 (상위 20개)
    const trendingData = bookStats.slice(0, 20).map((stat: any, index: number) => ({
      book_id: stat.book_id,
      rank: index + 1,
      score: stat.score,
      period: 'daily',
    }));

    await supabase.from('trending_books').insert(trendingData);

    console.log('트렌딩 책 업데이트 완료');
  } catch (error) {
    console.error('트렌딩 책 업데이트 실패:', error);
  }
}

/**
 * 사용자 취향 가져오기
 */
export async function getUserPreference(userId: string): Promise<UserPreference | null> {
  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data;
}
