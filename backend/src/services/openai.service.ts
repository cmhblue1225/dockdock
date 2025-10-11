import OpenAI from 'openai';
import { OpenAIRecommendation } from '../types/recommendation.types';

/**
 * OpenAI API 클라이언트
 */
class OpenAIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * 사용자 취향 분석 및 개인화 추천
   */
  async generatePersonalizedRecommendations(
    preferredGenres: string[],
    readBooks: Array<{ title: string; author: string; rating?: number }>,
    wishlistBooks: Array<{ title: string; author: string }>,
    limit: number = 10
  ): Promise<OpenAIRecommendation[]> {
    const systemPrompt = `당신은 전문 독서 큐레이터입니다. 사용자의 독서 취향을 분석하여 완벽한 책을 추천하는 것이 당신의 임무입니다.

추천 규칙:
1. 사용자가 선호하는 장르와 읽은 책을 기반으로 추천
2. 다양성을 고려하되 취향에서 크게 벗어나지 않음
3. 한국어로 출판된 책 우선 (번역서 포함)
4. 최근 5년 이내 출판된 책 우선
5. 베스트셀러보다는 숨은 명작도 포함

응답 형식 (JSON):
{
  "recommendations": [
    {
      "title": "책 제목",
      "author": "저자명",
      "isbn13": "ISBN-13 (선택)",
      "reason": "추천 이유 (1문장)",
      "score": 0.95
    }
  ]
}`;

    const userPrompt = `
사용자 정보:
- 선호 장르: ${preferredGenres.join(', ')}
- 읽은 책: ${readBooks.map(b => `"${b.title}" by ${b.author}${b.rating ? ` (평점: ${b.rating}/5)` : ''}`).join(', ') || '없음'}
- 위시리스트: ${wishlistBooks.map(b => `"${b.title}" by ${b.author}`).join(', ') || '없음'}

위 정보를 바탕으로 사용자에게 ${limit}권의 책을 추천해주세요.
각 책에 대해 간결하고 설득력 있는 추천 이유를 작성해주세요.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI 응답이 비어있습니다');
      }

      const parsed = JSON.parse(content);
      return parsed.recommendations || [];
    } catch (error) {
      console.error('OpenAI API 호출 실패:', error);
      throw new Error('AI 추천 생성에 실패했습니다');
    }
  }

  /**
   * 유사한 책 찾기
   */
  async findSimilarBooks(
    bookTitle: string,
    bookAuthor: string,
    bookDescription: string | null,
    bookGenre: string | null,
    limit: number = 5
  ): Promise<OpenAIRecommendation[]> {
    const systemPrompt = `당신은 책 추천 전문가입니다. 특정 책과 유사한 책을 찾는 것이 당신의 임무입니다.

유사도 기준:
1. 주제나 테마의 유사성
2. 문체나 서술 방식의 유사성
3. 시대적 배경이나 설정의 유사성
4. 독자층의 중복 가능성

응답 형식 (JSON):
{
  "similar_books": [
    {
      "title": "책 제목",
      "author": "저자명",
      "isbn13": "ISBN-13 (선택)",
      "reason": "유사한 이유 (1문장)",
      "score": 0.90
    }
  ]
}`;

    const userPrompt = `
기준 책:
- 제목: ${bookTitle}
- 저자: ${bookAuthor}
${bookDescription ? `- 설명: ${bookDescription.substring(0, 200)}...` : ''}
${bookGenre ? `- 장르: ${bookGenre}` : ''}

이 책과 유사한 책 ${limit}권을 추천해주세요.
각 책이 왜 유사한지 간결하게 설명해주세요.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI 응답이 비어있습니다');
      }

      const parsed = JSON.parse(content);
      return parsed.similar_books || [];
    } catch (error) {
      console.error('OpenAI API 호출 실패:', error);
      throw new Error('유사 책 추천 생성에 실패했습니다');
    }
  }

  /**
   * 장르별 추천 책 생성 (온보딩용)
   */
  async generateGenreBooks(
    genre: string,
    limit: number = 5
  ): Promise<OpenAIRecommendation[]> {
    const systemPrompt = `당신은 독서 전문가입니다. 특정 장르의 대표적인 책들을 추천하는 것이 당신의 임무입니다.

추천 기준:
1. 해당 장르의 고전적 명작
2. 최근 화제가 된 베스트셀러
3. 평론가들의 호평을 받은 책
4. 한국 독자들에게 잘 알려진 책

응답 형식 (JSON):
{
  "books": [
    {
      "title": "책 제목",
      "author": "저자명",
      "isbn13": "ISBN-13 (선택)",
      "reason": "추천 이유 (1문장)",
      "score": 0.95
    }
  ]
}`;

    const userPrompt = `
장르: ${genre}

이 장르의 대표적인 책 ${limit}권을 추천해주세요.
각 책이 왜 해당 장르를 대표하는지 간결하게 설명해주세요.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI 응답이 비어있습니다');
      }

      const parsed = JSON.parse(content);
      return parsed.books || [];
    } catch (error) {
      console.error('OpenAI API 호출 실패:', error);
      throw new Error('장르별 책 추천 생성에 실패했습니다');
    }
  }
}

// 싱글톤 인스턴스
let openAIService: OpenAIService | null = null;

export const getOpenAIService = (): OpenAIService => {
  if (!openAIService) {
    openAIService = new OpenAIService();
  }
  return openAIService;
};
