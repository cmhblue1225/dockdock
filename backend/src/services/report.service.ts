import { supabase } from './supabase.service';
import { getOpenAIService } from './openai.service';
import {
  calculateBigFiveScores,
  generateBigFiveProfile,
  generatePersona,
  generateRadarChartData,
} from './personality.service';
import {
  OnboardingReport,
  ReadingDNA,
  ReadingStyleAnalysis,
  ReadingDirection,
  RecommendedBookForReport,
} from '../types/report.types';

/**
 * 온보딩 레포트 생성
 */
export async function generateOnboardingReport(
  userId: string,
  selectedBookIds?: string[]
): Promise<OnboardingReport> {
  try {
    // 1. 사용자 선호도 가져오기
    const { data: preference } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!preference) {
      throw new Error('사용자 선호도를 찾을 수 없습니다');
    }

    // 2. Big Five 성격 점수 계산
    const bigFiveScores = calculateBigFiveScores({
      reading_purposes: preference.reading_purposes || [],
      preferred_length: preference.preferred_length,
      reading_pace: preference.reading_pace,
      preferred_difficulty: preference.preferred_difficulty,
      preferred_moods: preference.preferred_moods || [],
      preferred_emotions: preference.preferred_emotions || [],
      narrative_styles: preference.narrative_styles || [],
      preferred_themes: preference.preferred_themes || [],
    });

    // 3. Big Five 프로필 생성
    const bigFiveProfile = generateBigFiveProfile(bigFiveScores);

    // 4. 페르소나 생성
    const persona = generatePersona(bigFiveScores);

    // 5. 레이더 차트 데이터 생성
    const radarChartData = generateRadarChartData(bigFiveScores);

    // 6. 독서 DNA 생성 (규칙 기반)
    const readingDNA = generateReadingDNA(preference, bigFiveScores);

    // 7. 독서 성향 분석 (규칙 기반)
    const readingStyle = generateReadingStyleAnalysis(preference, bigFiveScores);

    // 8. 추천 독서 방향 생성 (규칙 기반)
    const readingDirections = generateReadingDirections(preference, bigFiveScores);

    // 9. 선택한 책 정보 가져오기 (있는 경우)
    let selectedBooks: Array<{ id: string; title: string; author: string; coverImage?: string }> =
      [];
    if (selectedBookIds && selectedBookIds.length > 0) {
      const { data: books } = await supabase
        .from('books')
        .select('id, title, author, cover_image_url')
        .in('id', selectedBookIds);

      if (books) {
        selectedBooks = books.map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          coverImage: book.cover_image_url,
        }));
      }
    }

    // 10. AI 기반 추천 도서 생성
    const recommendedBooks = await generateRecommendedBooks(
      userId,
      preference,
      bigFiveScores,
      persona
    );

    // 11. AI 종합 분석 텍스트 생성
    const aiSummary = await generateAISummary(preference, bigFiveScores, persona);

    // 12. 레포트 조합
    const report: OnboardingReport = {
      userId,
      createdAt: new Date().toISOString(),
      persona,
      bigFive: {
        scores: bigFiveScores,
        profile: bigFiveProfile,
        radarChartData,
      },
      readingDNA,
      readingStyle,
      readingDirections,
      recommendedBooks,
      selectedBooks: selectedBooks.length > 0 ? selectedBooks : undefined,
      aiSummary,
    };

    // 13. 레포트 저장
    await saveReport(userId, report);

    return report;
  } catch (error) {
    console.error('온보딩 레포트 생성 실패:', error);
    throw error;
  }
}

/**
 * 독서 DNA 생성 (규칙 기반)
 */
function generateReadingDNA(preference: any, bigFiveScores: any): ReadingDNA[] {
  const dna: ReadingDNA[] = [];

  // 1. 독서 목적 기반 DNA
  const purposes = preference.reading_purposes || [];
  if (purposes.includes('knowledge')) {
    dna.push({
      title: '지식 탐구자',
      description: '새로운 것을 배우고 이해하는 것에 큰 즐거움을 느낍니다',
      icon: '🎓',
      color: '#4F6815',
    });
  }
  if (purposes.includes('emotion')) {
    dna.push({
      title: '감정 여행자',
      description: '책을 통해 다양한 감정을 경험하고 공감하는 것을 즐깁니다',
      icon: '💫',
      color: '#8B4513',
    });
  }
  if (purposes.includes('entertainment')) {
    dna.push({
      title: '재미 추구자',
      description: '흥미진진한 이야기와 즐거운 독서 경험을 중요하게 생각합니다',
      icon: '🎭',
      color: '#FF6B6B',
    });
  }

  // 2. Big Five 점수 기반 DNA
  if (bigFiveScores.openness > 65) {
    dna.push({
      title: '개방적 탐험가',
      description: '새로운 장르와 색다른 관점의 책에 열려있습니다',
      icon: '🌍',
      color: '#4ECDC4',
    });
  }
  if (bigFiveScores.conscientiousness > 65) {
    dna.push({
      title: '체계적 독서가',
      description: '계획적이고 꾸준한 독서 습관을 가지고 있습니다',
      icon: '📋',
      color: '#95E1D3',
    });
  }
  if (bigFiveScores.emotional_stability > 65) {
    dna.push({
      title: '안정적 몰입자',
      description: '편안한 마음으로 책에 깊이 몰입할 수 있습니다',
      icon: '🧘',
      color: '#A8E6CF',
    });
  }

  // 3. 독서 난이도/속도 기반 DNA
  if (preference.preferred_difficulty === 'challenging') {
    dna.push({
      title: '도전적 사색가',
      description: '어려운 주제도 끈기있게 탐구하는 것을 즐깁니다',
      icon: '🏔️',
      color: '#6C5CE7',
    });
  }
  if (preference.reading_pace === 'fast') {
    dna.push({
      title: '빠른 흡수자',
      description: '빠르게 읽으며 핵심을 파악하는 능력이 뛰어납니다',
      icon: '⚡',
      color: '#FD79A8',
    });
  }

  // 상위 5개만 반환
  return dna.slice(0, 5);
}

/**
 * 독서 성향 분석 생성 (규칙 기반)
 */
function generateReadingStyleAnalysis(
  preference: any,
  bigFiveScores: any
): ReadingStyleAnalysis {
  const styles: Array<{ title: string; description: string; score: number }> = [];

  // 1. 목적 기반 스타일
  const purposes = preference.reading_purposes || [];
  if (purposes.includes('knowledge')) {
    styles.push({
      title: '학습 지향형',
      description: '지식을 쌓고 통찰을 얻기 위해 독서합니다',
      score: 40,
    });
  }
  if (purposes.includes('emotion')) {
    styles.push({
      title: '감정 공명형',
      description: '감정적 연결과 공감을 중요하게 생각합니다',
      score: 35,
    });
  }
  if (purposes.includes('entertainment')) {
    styles.push({
      title: '오락 추구형',
      description: '즐거움과 재미를 위해 책을 읽습니다',
      score: 30,
    });
  }

  // 2. Big Five 기반 추가 스타일
  if (bigFiveScores.openness > 65) {
    styles.push({
      title: '탐험형',
      description: '새로운 장르와 주제를 적극적으로 탐색합니다',
      score: 25,
    });
  }
  if (bigFiveScores.conscientiousness > 65) {
    styles.push({
      title: '체계형',
      description: '계획적이고 꾸준한 독서를 선호합니다',
      score: 20,
    });
  }

  // 점수 순으로 정렬
  styles.sort((a, b) => b.score - a.score);

  // 비율 계산
  const total = styles.reduce((sum, s) => sum + s.score, 0);
  const normalized = styles.map((s) => ({
    ...s,
    percentage: Math.round((s.score / total) * 100),
  }));

  return {
    mainStyle: {
      title: normalized[0].title,
      description: normalized[0].description,
      percentage: normalized[0].percentage,
    },
    subStyles: normalized.slice(1, 3),
  };
}

/**
 * 추천 독서 방향 생성 (규칙 기반)
 */
function generateReadingDirections(preference: any, bigFiveScores: any): ReadingDirection[] {
  const directions: ReadingDirection[] = [];

  // 1. 선호 장르 기반
  const genres = preference.preferred_genres || [];
  if (genres.length > 0) {
    directions.push({
      category: '선호 장르 심화',
      reason: `좋아하는 ${genres.slice(0, 2).join(', ')} 장르를 더 깊이 탐구해보세요`,
      examples: genres.slice(0, 3),
    });
  }

  // 2. Big Five 기반 추천
  if (bigFiveScores.openness > 65) {
    directions.push({
      category: '새로운 장르 탐험',
      reason: '개방성이 높아 새로운 장르에 잘 적응할 수 있습니다',
      examples: ['실험적 소설', '문화 비평', '과학 철학'],
    });
  }

  if (bigFiveScores.emotional_stability < 50) {
    directions.push({
      category: '위로와 치유',
      reason: '마음의 안정을 찾을 수 있는 책들을 추천합니다',
      examples: ['자기계발', '심리 에세이', '명상과 마음챙김'],
    });
  }

  // 3. 테마 기반
  const themes = preference.preferred_themes || [];
  if (themes.includes('growth')) {
    directions.push({
      category: '성장과 발전',
      reason: '자아 성장에 관심이 많으신 것 같습니다',
      examples: ['자기계발', '성공 스토리', '멘토링 에세이'],
    });
  }

  if (themes.includes('philosophy')) {
    directions.push({
      category: '사색과 통찰',
      reason: '철학적 질문과 깊은 사유를 즐기시는군요',
      examples: ['철학 입문서', '사상사', '실존주의 문학'],
    });
  }

  return directions.slice(0, 4);
}

/**
 * 추천 도서 생성 (AI 기반)
 */
async function generateRecommendedBooks(
  userId: string,
  preference: any,
  bigFiveScores: any,
  persona: any
): Promise<RecommendedBookForReport[]> {
  try {
    const openAI = getOpenAIService();

    // OpenAI에 확장된 선호도 전달
    // 페르소나와 Big Five는 프롬프트에 텍스트로 포함됨
    const recommendations = await openAI.generatePersonalizedRecommendations(
      preference.preferred_genres || [],
      [],
      [],
      8, // 8권 추천
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

    // 알라딘 API로 실제 책 검색은 recommendation.service.ts와 동일한 로직 사용
    // 여기서는 간단히 OpenAI 추천을 그대로 반환
    return recommendations.map((rec, index) => ({
      id: `temp-${index}`, // 임시 ID
      title: rec.title,
      author: rec.author || '저자 미상',
      reason: rec.reason,
      matchScore: rec.score,
    }));
  } catch (error) {
    console.error('추천 도서 생성 실패:', error);
    return [];
  }
}

/**
 * AI 종합 분석 텍스트 생성
 */
async function generateAISummary(
  preference: any,
  bigFiveScores: any,
  persona: any
): Promise<string> {
  try {
    const openAI = getOpenAIService();

    const systemMessage = '당신은 독서 전문 상담사입니다. 사용자의 독서 취향을 분석하고 따뜻한 격려와 통찰을 제공합니다.';

    const userMessage = `
다음 사용자의 독서 선호도와 성격 분석을 바탕으로,
따뜻하고 개인화된 종합 분석 메시지를 작성해주세요. (200-300자)

**페르소나**: ${persona.title}
${persona.keyTraits.map((trait: string) => `- ${trait}`).join('\n')}

**성격 특성 (Big Five)**:
- 개방성: ${bigFiveScores.openness}/100
- 성실성: ${bigFiveScores.conscientiousness}/100
- 외향성: ${bigFiveScores.extraversion}/100
- 친화성: ${bigFiveScores.agreeableness}/100
- 정서적 안정성: ${bigFiveScores.emotional_stability}/100

**독서 선호**:
- 선호 장르: ${(preference.preferred_genres || []).join(', ')}
- 독서 목적: ${(preference.reading_purposes || []).join(', ')}
- 선호 분위기: ${(preference.preferred_moods || []).join(', ')}
- 선호 테마: ${(preference.preferred_themes || []).join(', ')}

이 사용자만의 독서 여정과 성장 가능성에 대해 격려하는 메시지를 작성해주세요.
`;

    // OpenAI API 직접 호출
    const response = await openAI['client'].chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content || `${persona.title}로서, 당신만의 독특한 독서 여정을 시작해보세요.`;
  } catch (error) {
    console.error('AI 종합 분석 생성 실패:', error);
    return `${persona.title}로서, 당신만의 독특한 독서 여정을 시작해보세요. 책을 통해 새로운 세계를 발견하고 성장하는 즐거움을 느끼실 수 있을 것입니다.`;
  }
}

/**
 * 레포트 저장
 */
async function saveReport(userId: string, report: OnboardingReport): Promise<void> {
  try {
    // 기존 레포트가 있으면 업데이트, 없으면 생성
    const { data: existing } = await supabase
      .from('onboarding_reports')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase
        .from('onboarding_reports')
        .update({
          report_data: report,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      // id 생성: rep_timestamp_userid 형식
      const reportId = `rep_${Date.now()}_${userId.substring(0, 8)}`;

      await supabase.from('onboarding_reports').insert({
        id: reportId,
        user_id: userId,
        report_data: report,
      });
    }
  } catch (error) {
    console.error('레포트 저장 실패:', error);
    // 저장 실패해도 레포트는 반환 (클라이언트에서 사용 가능)
  }
}

/**
 * 저장된 레포트 조회
 */
export async function getOnboardingReport(userId: string): Promise<OnboardingReport | null> {
  try {
    const { data, error } = await supabase
      .from('onboarding_reports')
      .select('report_data')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.report_data as OnboardingReport;
  } catch (error) {
    console.error('레포트 조회 실패:', error);
    return null;
  }
}
