import { supabase } from './supabase.service';
import { getOpenAIService } from './openai.service';
import { getAladinClient } from './aladin.service';
import { Genre, OnboardingBook } from '../types/onboarding.types';

/**
 * 온보딩 장르 목록
 */
const GENRES: Genre[] = [
  { id: 'novel', name: '소설', icon: '📖', description: '문학 소설, 장편/단편' },
  { id: 'poetry', name: '시', icon: '✍️', description: '시집, 시 해설' },
  { id: 'essay', name: '에세이', icon: '📝', description: '산문, 수필, 칼럼' },
  { id: 'self-help', name: '자기계발', icon: '💪', description: '성공, 동기부여, 습관' },
  { id: 'science', name: '과학', icon: '🔬', description: '물리, 화학, 생물, 우주' },
  { id: 'history', name: '역사', icon: '📜', description: '한국사, 세계사, 인물' },
  { id: 'philosophy', name: '철학', icon: '🤔', description: '사상, 윤리, 논리' },
  { id: 'art', name: '예술', icon: '🎨', description: '미술, 음악, 영화' },
  { id: 'economy', name: '경제경영', icon: '💼', description: '재테크, 투자, 경영' },
  { id: 'tech', name: 'IT/기술', icon: '💻', description: '프로그래밍, 기술 트렌드' },
  { id: 'travel', name: '여행', icon: '✈️', description: '여행기, 가이드북' },
  { id: 'cooking', name: '요리', icon: '🍳', description: '레시피, 푸드 에세이' },
];

/**
 * 온보딩 장르 목록 가져오기
 */
export async function getOnboardingGenres(): Promise<Genre[]> {
  return GENRES;
}

/**
 * 특정 장르의 대표 책 가져오기
 */
export async function getGenreBooks(genre: string, limit: number = 5): Promise<OnboardingBook[]> {
  console.log(`[getGenreBooks] 시작 - 장르: ${genre}, limit: ${limit}`);

  try {
    // OpenAI로 해당 장르의 대표 책 생성
    console.log(`[getGenreBooks] OpenAI 호출 시작`);
    const openAI = getOpenAIService();
    const aiBooks = await openAI.generateGenreBooks(genre, limit);
    console.log(`[getGenreBooks] OpenAI 응답: ${aiBooks.length}권 추천받음`);

    // 알라딘 API로 실제 책 검색
    const aladinClient = getAladinClient();
    const books: OnboardingBook[] = [];

    for (const aiBook of aiBooks) {
      try {
        console.log(`[getGenreBooks] 알라딘 검색: "${aiBook.title}"`);
        const { books: foundBooks } = await aladinClient.searchBooks({
          query: aiBook.title,
          queryType: 'Title',
          maxResults: 1,
        });

        if (foundBooks.length > 0) {
          const book = foundBooks[0];
          console.log(`[getGenreBooks] 알라딘에서 발견: "${book.title}" (ISBN: ${book.isbn13})`);

          // books 테이블에 저장
          const { data: existingBook } = await supabase
            .from('books')
            .select('id')
            .eq('isbn13', book.isbn13)
            .single();

          let bookId = existingBook?.id;

          if (!bookId) {
            console.log(`[getGenreBooks] 새 책 저장: "${book.title}"`);
            const { data: newBook, error: insertError } = await supabase
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

            if (insertError) {
              console.error(`[getGenreBooks] 책 저장 실패:`, insertError);
            } else {
              bookId = newBook?.id;
              console.log(`[getGenreBooks] 책 저장 완료: ID ${bookId}`);
            }
          } else {
            console.log(`[getGenreBooks] 기존 책 사용: ID ${bookId}`);
          }

          if (bookId) {
            // 장르 태그 저장
            await supabase.from('book_genres').upsert({
              book_id: bookId,
              genre,
            });

            books.push({
              id: bookId,
              title: book.title,
              author: book.author,
              coverImage: book.coverImage,
              description: book.description || aiBook.reason,
              genre,
            });
            console.log(`[getGenreBooks] 책 추가됨: "${book.title}"`);
          }
        } else {
          console.log(`[getGenreBooks] 알라딘에서 못 찾음: "${aiBook.title}"`);
        }
      } catch (error) {
        console.error(`[getGenreBooks] 책 검색 실패: ${aiBook.title}`, error);
      }
    }

    console.log(`[getGenreBooks] 완료 - 총 ${books.length}권 반환`);
    return books;
  } catch (error) {
    console.error(`[getGenreBooks] 전체 실패 - 장르: ${genre}`, error);
    return [];
  }
}

/**
 * 사용자 선호도 저장 (확장)
 */
export async function saveUserPreferences(
  userId: string,
  preferredGenres: string[],
  selectedBookIds?: string[],
  extendedPreferences?: {
    reading_purposes?: string[];
    preferred_length?: string;
    reading_pace?: string;
    preferred_difficulty?: string;
    preferred_moods?: string[];
    preferred_emotions?: string[];
    narrative_styles?: string[];
    preferred_themes?: string[];
  }
): Promise<void> {
  try {
    // 선택한 책들의 작가 추출
    let preferredAuthors: string[] = [];
    if (selectedBookIds && selectedBookIds.length > 0) {
      const { data: books } = await supabase
        .from('books')
        .select('author')
        .in('id', selectedBookIds);

      preferredAuthors = books
        ?.map((b) => b.author)
        .filter((a): a is string => a !== null && a !== undefined) || [];
    }

    // user_preferences 테이블에 저장/업데이트 (확장된 필드 포함)
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      preferred_genres: preferredGenres,
      preferred_authors: preferredAuthors,
      onboarding_completed: true,
      // 확장된 선호도 필드
      reading_purposes: extendedPreferences?.reading_purposes || [],
      preferred_length: extendedPreferences?.preferred_length || null,
      reading_pace: extendedPreferences?.reading_pace || null,
      preferred_difficulty: extendedPreferences?.preferred_difficulty || null,
      preferred_moods: extendedPreferences?.preferred_moods || [],
      preferred_emotions: extendedPreferences?.preferred_emotions || [],
      narrative_styles: extendedPreferences?.narrative_styles || [],
      preferred_themes: extendedPreferences?.preferred_themes || [],
    });

    // 선택한 책들을 위시리스트에 추가
    if (selectedBookIds && selectedBookIds.length > 0) {
      const wishlistData = selectedBookIds.map((bookId) => ({
        user_id: userId,
        book_id: bookId,
        status: 'wishlist',
      }));

      await supabase.from('reading_books').insert(wishlistData);
    }

    console.log('사용자 선호도 저장 완료:', {
      userId,
      preferredGenres,
      preferredAuthors,
      extendedPreferences,
    });
  } catch (error) {
    console.error('사용자 선호도 저장 실패:', error);
    throw new Error('선호도 저장에 실패했습니다');
  }
}

/**
 * 온보딩 상태 확인
 */
export async function getOnboardingStatus(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('user_preferences')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();

    return data?.onboarding_completed || false;
  } catch (error) {
    // 레코드가 없으면 false 반환
    return false;
  }
}
