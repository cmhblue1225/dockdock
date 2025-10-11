import { getOpenAIService } from './openai.service';
import { supabase } from './supabase.service';
import {
  OnboardingData,
  OnboardingReport,
  PersonalityProfile,
  ReadingPersona,
  RadarChartPoint,
  RecommendedBookPreview,
  GrowthPotential,
  ReportStatistics,
  ReadingDNA,
} from '../types/report';

/**
 * 온보딩 레포트 서비스
 * 사용자의 온보딩 응답을 분석하여 감성적이고 전문적인 레포트 생성
 */
class ReportService {
  /**
   * 온보딩 레포트 생성
   */
  async generateReport(userId: string, onboardingData: OnboardingData): Promise<OnboardingReport> {
    console.log(`[ReportService] 레포트 생성 시작 - userId: ${userId}`);

    try {
      // 1. 성격 프로필 계산 (Big Five 기반)
      const personalityProfile = this.calculatePersonalityProfile(onboardingData);

      // 2. 독서 페르소나 결정
      const persona = this.determinePersona(onboardingData, personalityProfile);

      // 3. 독서 DNA 분석
      const readingDNA = await this.analyzeReadingDNA(onboardingData);

      // 4. 레이더 차트 데이터 생성
      const radarChartData = this.generateRadarChartData(personalityProfile);

      // 5. 추천 도서 생성
      const recommendedBooks = await this.generateRecommendedBooks(userId, onboardingData);

      // 6. 성장 가능성 분석
      const growthPotential = this.analyzeGrowthPotential(onboardingData);

      // 7. 통계 요약
      const statistics = this.calculateStatistics(onboardingData);

      // 8. AI 텍스트 생성 (요약 및 맺음말)
      const { executiveSummary, closingMessage } = await this.generateAITexts(
        persona,
        personalityProfile,
        readingDNA
      );

      // 레포트 객체 구성
      const report: OnboardingReport = {
        reportId: `rep_${Date.now()}_${userId.substring(0, 8)}`,
        userId,
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        persona,
        personalityProfile,
        readingDNA,
        radarChartData,
        recommendedBooks,
        growthPotential,
        statistics,
        executiveSummary,
        closingMessage,
      };

      // 9. 데이터베이스에 저장
      await this.saveReport(report);

      console.log(`[ReportService] 레포트 생성 완료 - reportId: ${report.reportId}`);
      return report;
    } catch (error) {
      console.error(`[ReportService] 레포트 생성 실패:`, error);
      throw new Error('레포트 생성에 실패했습니다');
    }
  }

  /**
   * 성격 프로필 계산 (Big Five 기반 독서 성향 매핑)
   */
  private calculatePersonalityProfile(data: OnboardingData): PersonalityProfile {
    // Openness (개방성) - 장르 다양성, 난이도 선호, 주제 선택
    let opennessScore = 50; // 기본값
    if (data.favorite_genres && data.favorite_genres.length >= 4) opennessScore += 20;
    if (data.preferred_difficulty === 'challenging') opennessScore += 15;
    if (data.preferred_themes && data.preferred_themes.includes('fantasy')) opennessScore += 15;
    opennessScore = Math.min(100, opennessScore);

    // Conscientiousness (성실성) - 독서 속도, 목적
    let conscientiousnessScore = 50;
    if (data.reading_pace === 'slow') conscientiousnessScore += 20;
    if (data.purposes?.includes('learning')) conscientiousnessScore += 15;
    if (data.preferred_length === 'long') conscientiousnessScore += 15;
    conscientiousnessScore = Math.min(100, conscientiousnessScore);

    // Extraversion (외향성) - 감정 선호, 분위기
    let extraversionScore = 50;
    if (data.preferred_moods?.includes('bright')) extraversionScore += 15;
    if (data.preferred_emotions?.includes('humor')) extraversionScore += 15;
    if (data.preferred_narrative_styles?.includes('conversational')) extraversionScore += 10;
    if (data.preferred_moods?.includes('dark')) extraversionScore -= 15;
    extraversionScore = Math.max(0, Math.min(100, extraversionScore));

    // Agreeableness (친화성) - 주제 선호
    let agreeablenessScore = 50;
    if (data.preferred_themes?.includes('friendship')) agreeablenessScore += 15;
    if (data.preferred_themes?.includes('love')) agreeablenessScore += 15;
    if (data.preferred_themes?.includes('family')) agreeablenessScore += 10;
    if (data.preferred_emotions?.includes('touching')) agreeablenessScore += 10;
    agreeablenessScore = Math.min(100, agreeablenessScore);

    // Neuroticism (신경성, 낮을수록 안정적) - 분위기, 감정
    let neuroticismScore = 50;
    if (data.preferred_moods?.includes('bright')) neuroticismScore -= 15;
    if (data.preferred_emotions?.includes('horror')) neuroticismScore += 20;
    if (data.preferred_emotions?.includes('tension')) neuroticismScore += 10;
    if (data.preferred_moods?.includes('philosophical')) neuroticismScore -= 10;
    neuroticismScore = Math.max(0, Math.min(100, neuroticismScore));

    const getLevel = (score: number): 'low' | 'moderate' | 'high' => {
      if (score < 40) return 'low';
      if (score < 70) return 'moderate';
      return 'high';
    };

    return {
      openness: {
        score: opennessScore,
        level: getLevel(opennessScore),
        description:
          opennessScore >= 70
            ? '새로운 경험과 아이디어에 매우 개방적입니다.'
            : opennessScore >= 40
              ? '익숙한 것과 새로운 것의 균형을 추구합니다.'
              : '검증된 고전적인 작품을 선호합니다.',
      },
      conscientiousness: {
        score: conscientiousnessScore,
        level: getLevel(conscientiousnessScore),
        description:
          conscientiousnessScore >= 70
            ? '계획적이고 체계적인 독서 스타일입니다.'
            : conscientiousnessScore >= 40
              ? '계획적이면서도 융통성 있는 독서 스타일입니다.'
              : '자유롭고 즉흥적인 독서를 즐깁니다.',
      },
      extraversion: {
        score: extraversionScore,
        level: getLevel(extraversionScore),
        description:
          extraversionScore >= 70
            ? '활기차고 외향적인 이야기를 선호합니다.'
            : extraversionScore >= 40
              ? '혼자만의 독서와 토론 모두를 즐깁니다.'
              : '조용하고 내면적인 이야기를 선호합니다.',
      },
      agreeableness: {
        score: agreeablenessScore,
        level: getLevel(agreeablenessScore),
        description:
          agreeablenessScore >= 70
            ? '타인의 감정에 깊이 공감하는 성향입니다.'
            : agreeablenessScore >= 40
              ? '감정적 공감과 이성적 분석을 균형있게 합니다.'
              : '객관적이고 분석적인 관점을 선호합니다.',
      },
      neuroticism: {
        score: neuroticismScore,
        level: neuroticismScore < 40 ? 'low' : neuroticismScore < 70 ? 'moderate' : 'high',
        description:
          neuroticismScore < 40
            ? '정서적으로 안정적인 독서 경험을 선호합니다.'
            : neuroticismScore < 70
              ? '다양한 감정의 독서 경험을 수용합니다.'
              : '강렬하고 자극적인 독서 경험을 추구합니다.',
      },
    };
  }

  /**
   * 독서 페르소나 결정
   */
  private determinePersona(data: OnboardingData, profile: PersonalityProfile): ReadingPersona {
    // 성격 프로필과 선호도를 기반으로 페르소나 결정
    const isHighOpenness = profile.openness.score >= 70;
    const isHighAgreeableness = profile.agreeableness.score >= 70;
    const emotionalRange = data.preferred_emotions?.length || 0;
    const moodDiversity = data.preferred_moods?.length || 0;

    // 페르소나 타입 결정 로직
    let title = '균형잡힌 독서가';
    let subtitle = '다양한 세계를 탐험하는 당신';
    let icon = '📚';
    let colorTheme = { primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899' };
    let description = '당신은 균형잡힌 독서 성향을 가지고 있습니다.';
    let keyTraits = ['균형잡힌 독서 페이스', '다양한 장르 수용', '안정적인 선호도'];
    let readingStrategy = [
      '자신만의 독서 루틴을 만들어보세요',
      '한 달에 한 번은 새로운 장르에 도전해보세요',
    ];

    // 감성적 탐험가
    if (isHighOpenness && isHighAgreeableness && emotionalRange >= 3) {
      title = '감성적인 탐험가';
      subtitle = '깊은 감정과 새로운 세계를 동시에 추구하는 당신';
      icon = '🌌';
      colorTheme = { primary: '#ec4899', secondary: '#f97316', accent: '#8b5cf6' };
      description =
        '당신은 책을 통해 새로운 세계를 탐험하면서도, 깊은 감정의 울림을 놓치지 않는 독특한 독서가입니다.';
      keyTraits = [
        '깊은 감정 이입 능력',
        '새로운 세계에 대한 호기심',
        '균형잡힌 독서 페이스',
        '다양한 장르 수용력',
        '성찰적 독서 태도',
      ];
      readingStrategy = [
        '감정적으로 몰입할 수 있는 시간대를 선택하세요',
        '한 권을 깊이 읽은 후 다른 장르로 전환해보세요',
        '독서 노트를 작성하며 자신의 감정을 기록하세요',
      ];
    }
    // 지적 탐구자
    else if (isHighOpenness && profile.conscientiousness.score >= 60) {
      title = '지적인 탐구자';
      subtitle = '깊이 있는 사고와 배움을 추구하는 당신';
      icon = '🔍';
      colorTheme = { primary: '#3b82f6', secondary: '#06b6d4', accent: '#8b5cf6' };
      description = '당신은 책을 통해 세상을 이해하고, 지적 호기심을 충족시키는 것을 즐깁니다.';
      keyTraits = ['높은 지적 호기심', '체계적인 독서', '깊이 있는 사고', '비판적 독서'];
      readingStrategy = [
        '독서 후 핵심 내용을 정리하는 습관을 가지세요',
        '다양한 관점의 책을 교차해서 읽어보세요',
        '독서 토론에 참여해보세요',
      ];
    }
    // 감성적 몽상가
    else if (isHighAgreeableness && moodDiversity >= 3) {
      title = '감성적인 몽상가';
      subtitle = '깊은 감정과 상상의 세계를 즐기는 당신';
      icon = '🌙';
      colorTheme = { primary: '#a855f7', secondary: '#ec4899', accent: '#f97316' };
      description = '당신은 책 속 인물들의 감정에 깊이 공감하며, 상상의 세계에서 위안을 얻습니다.';
      keyTraits = ['뛰어난 공감 능력', '풍부한 상상력', '섬세한 감수성', '감정적 몰입'];
      readingStrategy = [
        '조용하고 편안한 공간에서 읽으세요',
        '감정이 풍부한 시간대에 독서하세요',
        '책의 여운을 충분히 음미하세요',
      ];
    }

    return {
      title,
      subtitle,
      icon,
      colorTheme,
      description,
      keyTraits,
      readingStrategy,
    };
  }

  /**
   * 독서 DNA 분석 (AI 기반)
   */
  private async analyzeReadingDNA(data: OnboardingData): Promise<ReadingDNA> {
    const openAI = getOpenAIService();

    // AI 프롬프트 생성
    const prompt = `다음 독서 선호도 데이터를 분석하여 각 카테고리별로 감성적이고 전문적인 분석 텍스트를 작성해주세요:

독서 목적: ${data.purposes?.join(', ') || '미제공'}
선호 장르: ${data.favorite_genres?.join(', ') || '미제공'}
책 길이: ${data.preferred_length || '미제공'}
독서 속도: ${data.reading_pace || '미제공'}
선호 난이도: ${data.preferred_difficulty || '미제공'}
선호 분위기: ${data.preferred_moods?.join(', ') || '미제공'}
선호 감정: ${data.preferred_emotions?.join(', ') || '미제공'}
서술 스타일: ${data.preferred_narrative_styles?.join(', ') || '미제공'}
선호 주제: ${data.preferred_themes?.join(', ') || '미제공'}

각 카테고리별로 2-3문장의 분석 텍스트를 작성해주세요:
1. purposes_analysis - 독서 목적에 대한 분석
2. style_analysis - 독서 스타일에 대한 분석
3. atmosphere_analysis - 분위기 및 감정 선호에 대한 분석
4. content_analysis - 콘텐츠 선호에 대한 분석

JSON 형식으로 응답해주세요.`;

    try {
      const response = await openAI['client'].chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 독서 성향 분석 전문가입니다. 사용자의 선호도를 깊이 있게 분석하여 감성적이고 전문적인 텍스트를 작성합니다.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });

      const aiAnalysis = JSON.parse(response.choices[0]?.message?.content || '{}');

      return {
        purposes: {
          primary: data.purposes?.[0] || 'leisure',
          secondary: data.purposes?.slice(1) || [],
          analysis:
            aiAnalysis.purposes_analysis ||
            '당신의 독서 목적은 명확하며, 책을 통해 의미있는 경험을 추구합니다.',
        },
        style: {
          length: data.preferred_length || 'medium',
          pace: data.reading_pace || 'medium',
          difficulty: data.preferred_difficulty || 'moderate',
          analysis:
            aiAnalysis.style_analysis || '당신은 자신에게 맞는 독서 스타일을 잘 파악하고 있습니다.',
        },
        atmosphere: {
          moods: data.preferred_moods || [],
          emotions: data.preferred_emotions || [],
          dominantMood: data.preferred_moods?.[0] || 'neutral',
          emotionalRange: this.calculateEmotionalRange(data.preferred_emotions?.length || 0),
          analysis:
            aiAnalysis.atmosphere_analysis ||
            '당신은 다양한 분위기와 감정의 책을 즐길 수 있는 넓은 스펙트럼을 가지고 있습니다.',
        },
        content: {
          themes: data.preferred_themes || [],
          narrativeStyles: data.preferred_narrative_styles || [],
          genres: data.favorite_genres || [],
          primaryTheme: data.preferred_themes?.[0] || 'growth',
          analysis:
            aiAnalysis.content_analysis ||
            '당신이 선호하는 콘텐츠는 당신의 독서 정체성을 잘 반영하고 있습니다.',
        },
      };
    } catch (error) {
      console.error('[ReportService] AI 분석 실패, 기본 분석 사용:', error);
      // AI 실패 시 기본 분석 반환
      return {
        purposes: {
          primary: data.purposes?.[0] || 'leisure',
          secondary: data.purposes?.slice(1) || [],
          analysis: '당신의 독서 목적은 명확하며, 책을 통해 의미있는 경험을 추구합니다.',
        },
        style: {
          length: data.preferred_length || 'medium',
          pace: data.reading_pace || 'medium',
          difficulty: data.preferred_difficulty || 'moderate',
          analysis: '당신은 자신에게 맞는 독서 스타일을 잘 파악하고 있습니다.',
        },
        atmosphere: {
          moods: data.preferred_moods || [],
          emotions: data.preferred_emotions || [],
          dominantMood: data.preferred_moods?.[0] || 'neutral',
          emotionalRange: this.calculateEmotionalRange(data.preferred_emotions?.length || 0),
          analysis: '당신은 다양한 분위기와 감정의 책을 즐길 수 있는 넓은 스펙트럼을 가지고 있습니다.',
        },
        content: {
          themes: data.preferred_themes || [],
          narrativeStyles: data.preferred_narrative_styles || [],
          genres: data.favorite_genres || [],
          primaryTheme: data.preferred_themes?.[0] || 'growth',
          analysis: '당신이 선호하는 콘텐츠는 당신의 독서 정체성을 잘 반영하고 있습니다.',
        },
      };
    }
  }

  /**
   * 감정 범위 계산
   */
  private calculateEmotionalRange(emotionCount: number): 'narrow' | 'moderate' | 'wide' {
    if (emotionCount <= 2) return 'narrow';
    if (emotionCount <= 4) return 'moderate';
    return 'wide';
  }

  /**
   * 레이더 차트 데이터 생성
   */
  private generateRadarChartData(profile: PersonalityProfile): RadarChartPoint[] {
    return [
      {
        subject: '개방성',
        value: profile.openness.score,
        category: 'personality',
        description: '새로운 경험 수용',
      },
      {
        subject: '성실성',
        value: profile.conscientiousness.score,
        category: 'personality',
        description: '계획적 독서',
      },
      {
        subject: '외향성',
        value: profile.extraversion.score,
        category: 'personality',
        description: '사회적 에너지',
      },
      {
        subject: '친화성',
        value: profile.agreeableness.score,
        category: 'personality',
        description: '공감 능력',
      },
      {
        subject: '안정성',
        value: 100 - profile.neuroticism.score, // 역전환 (높을수록 안정적)
        category: 'personality',
        description: '정서 안정',
      },
    ];
  }

  /**
   * 추천 도서 생성 (간소화 버전)
   */
  private async generateRecommendedBooks(
    userId: string,
    data: OnboardingData
  ): Promise<RecommendedBookPreview[]> {
    // TODO: 실제 추천 시스템 연동
    // 현재는 목업 데이터 반환
    return [
      {
        bookId: 'book_1',
        title: '달러구트 꿈 백화점',
        author: '이미예',
        coverImage: '/placeholder-book1.jpg',
        overallMatchScore: 92,
        tagline: '당신의 감성과 상상력이 만나는 완벽한 공간',
        reasons: [
          {
            category: 'mood',
            matchScore: 95,
            reason: '따뜻하고 감성적인 분위기가 당신의 선호와 완벽히 일치합니다',
            relatedPreferences: data.preferred_moods || [],
          },
        ],
      },
      {
        bookId: 'book_2',
        title: '아몬드',
        author: '손원평',
        coverImage: '/placeholder-book2.jpg',
        overallMatchScore: 88,
        tagline: '감정에 대한 깊은 성찰을 선사하는 작품',
        reasons: [
          {
            category: 'theme',
            matchScore: 92,
            reason: '성장과 자기 이해의 여정이 중심입니다',
            relatedPreferences: data.preferred_themes || [],
          },
        ],
      },
      {
        bookId: 'book_3',
        title: '트렌드 코리아 2024',
        author: '김난도',
        coverImage: '/placeholder-book3.jpg',
        overallMatchScore: 78,
        tagline: '배움과 영감을 동시에 얻는 지적 여정',
        reasons: [
          {
            category: 'genre',
            matchScore: 80,
            reason: '에세이 장르로 편안하게 읽을 수 있습니다',
            relatedPreferences: data.favorite_genres || [],
          },
        ],
      },
    ];
  }

  /**
   * 성장 가능성 분석
   */
  private analyzeGrowthPotential(data: OnboardingData): GrowthPotential {
    const genreCount = data.favorite_genres?.length || 0;
    const currentScope: 'narrow' | 'moderate' | 'diverse' =
      genreCount <= 2 ? 'narrow' : genreCount <= 4 ? 'moderate' : 'diverse';

    // 현재 선호하지 않는 영역 추천
    const explorationAreas = [
      {
        area: '고전 문학',
        reason: '깊은 통찰과 시대를 초월한 가치를 발견할 수 있습니다',
        difficulty: 'moderate' as const,
      },
      {
        area: 'SF/판타지',
        reason: '상상력을 확장하고 새로운 세계관을 경험할 수 있습니다',
        difficulty: 'easy' as const,
      },
      {
        area: '심리학/철학',
        reason: '인간과 세상에 대한 깊은 이해를 도울 수 있습니다',
        difficulty: 'challenging' as const,
      },
    ];

    const growthPath =
      currentScope === 'narrow'
        ? '현재 선호하는 장르를 중심으로, 조금씩 인접한 장르로 확장해보세요. 당신의 독서 세계가 더욱 풍요로워질 것입니다.'
        : currentScope === 'moderate'
          ? '이미 다양한 장르를 즐기고 있습니다. 이제는 각 장르의 깊이를 더해가며, 가끔 완전히 새로운 영역에 도전해보세요.'
          : '매우 다양한 독서 경험을 하고 계십니다. 이제는 깊이 있는 독서나, 도전적인 주제의 책들로 한 단계 더 성장해보세요.';

    return {
      currentScope,
      explorationAreas,
      growthPath,
    };
  }

  /**
   * 통계 요약 계산
   */
  private calculateStatistics(data: OnboardingData): ReportStatistics {
    // 응답 수 계산
    const responses = [
      data.purposes,
      data.favorite_genres,
      data.preferred_length,
      data.reading_pace,
      data.preferred_difficulty,
      data.preferred_moods,
      data.preferred_emotions,
      data.preferred_narrative_styles,
      data.preferred_themes,
    ];
    const totalResponses = responses.filter((r) => r && (Array.isArray(r) ? r.length > 0 : r)).length;

    // 다양성 점수 (선택한 옵션 수 기반)
    const genreCount = data.favorite_genres?.length || 0;
    const moodCount = data.preferred_moods?.length || 0;
    const emotionCount = data.preferred_emotions?.length || 0;
    const themeCount = data.preferred_themes?.length || 0;
    const diversityScore = Math.min(100, ((genreCount + moodCount + emotionCount + themeCount) / 20) * 100);

    // 명확성 점수 (응답의 일관성, 여기서는 완성도로 대체)
    const clarityScore = Math.min(100, (totalResponses / 9) * 100);

    // 완성도
    const completionRate = Math.floor((totalResponses / 9) * 100);

    return {
      totalResponses,
      diversityScore: Math.floor(diversityScore),
      clarityScore: Math.floor(clarityScore),
      completionRate,
    };
  }

  /**
   * AI 텍스트 생성 (요약 및 맺음말)
   */
  private async generateAITexts(
    persona: ReadingPersona,
    profile: PersonalityProfile,
    readingDNA: ReadingDNA
  ): Promise<{ executiveSummary: string; closingMessage: string }> {
    const openAI = getOpenAIService();

    const prompt = `다음은 사용자의 독서 성향 분석 결과입니다:

페르소나: ${persona.title} - ${persona.subtitle}
개방성: ${profile.openness.score} (${profile.openness.level})
성실성: ${profile.conscientiousness.score} (${profile.conscientiousness.level})
외향성: ${profile.extraversion.score} (${profile.extraversion.level})
친화성: ${profile.agreeableness.score} (${profile.agreeableness.level})
안정성: ${100 - profile.neuroticism.score} (${profile.neuroticism.level})

독서 목적: ${readingDNA.purposes.primary}, ${readingDNA.purposes.secondary.join(', ')}
독서 스타일: ${readingDNA.style.length}, ${readingDNA.style.pace}, ${readingDNA.style.difficulty}
선호 분위기: ${readingDNA.atmosphere.moods.join(', ')}
주요 테마: ${readingDNA.content.primaryTheme}

이 정보를 바탕으로:
1. executive_summary: 사용자의 독서 성향을 2-3문장으로 감성적이고 전문적으로 요약해주세요.
2. closing_message: 사용자에게 독서 여정을 응원하는 따뜻하고 격려하는 맺음말을 2-3문장으로 작성해주세요.

JSON 형식으로 응답해주세요.`;

    try {
      const response = await openAI['client'].chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              '당신은 감성적이고 전문적인 독서 상담가입니다. 사용자에게 따뜻하면서도 깊이 있는 메시지를 전달합니다.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
      });

      const aiTexts = JSON.parse(response.choices[0]?.message?.content || '{}');

      return {
        executiveSummary:
          aiTexts.executive_summary ||
          '당신은 독특하고 가치있는 독서 성향을 가지고 있습니다. 이는 풍요로운 독서 생활의 토대가 될 것입니다.',
        closingMessage:
          aiTexts.closing_message ||
          '독서는 자신을 발견하고 세상을 이해하는 여정입니다. 즐거운 독서 여정을 응원합니다! 📚✨',
      };
    } catch (error) {
      console.error('[ReportService] AI 텍스트 생성 실패, 기본 텍스트 사용:', error);
      return {
        executiveSummary:
          '당신은 독특하고 가치있는 독서 성향을 가지고 있습니다. 이는 풍요로운 독서 생활의 토대가 될 것입니다.',
        closingMessage:
          '독서는 자신을 발견하고 세상을 이해하는 여정입니다. 즐거운 독서 여정을 응원합니다! 📚✨',
      };
    }
  }

  /**
   * 레포트 저장
   */
  private async saveReport(report: OnboardingReport): Promise<void> {
    try {
      const { error } = await supabase.from('onboarding_reports').upsert({
        id: report.reportId,
        user_id: report.userId,
        report_data: report,
        version: report.version,
        created_at: report.createdAt,
        updated_at: report.createdAt,
      });

      if (error) {
        console.error('[ReportService] 레포트 저장 실패:', error);
        throw error;
      }

      console.log(`[ReportService] 레포트 저장 완료: ${report.reportId}`);
    } catch (error) {
      console.error('[ReportService] 레포트 저장 중 오류:', error);
      // 저장 실패해도 레포트 생성은 성공으로 처리 (선택적 저장)
    }
  }

  /**
   * 사용자의 레포트 조회
   */
  async getUserReport(userId: string): Promise<OnboardingReport | null> {
    try {
      const { data, error } = await supabase
        .from('onboarding_reports')
        .select('report_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 레코드 없음
          return null;
        }
        throw error;
      }

      return data?.report_data || null;
    } catch (error) {
      console.error('[ReportService] 레포트 조회 실패:', error);
      return null;
    }
  }
}

// 싱글톤 인스턴스
let reportService: ReportService | null = null;

export const getReportService = (): ReportService => {
  if (!reportService) {
    reportService = new ReportService();
  }
  return reportService;
};
