import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  blurVariants,
  cardVariants,
  floatVariants,
  staggerGridContainerVariants,
  itemVariants,
  magneticVariants,
  glowVariants,
  containerVariants,
  pageFadeVariants,
  zoomVariants,
} from '../lib/animations';
import api from '../lib/api';
import type { OnboardingReport } from '../types/report';
import BookDetailModal from '../components/BookDetailModal';

/**
 * 온보딩 레포트 페이지
 * Netflix × Apple × Spotify 스타일의 프리미엄 감성 레포트
 */
export default function OnboardingReportPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState<OnboardingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // 실제 API 호출
      const response = await api.get('/api/v1/onboarding/report');

      if (response.data.success) {
        setReport(response.data.data);
      } else {
        throw new Error(response.data.message || '레포트를 불러오는데 실패했습니다');
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load report:', err);
      const errorMessage = err.response?.data?.message || err.message || '레포트를 불러오는데 실패했습니다.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleStartReading = () => {
    navigate('/');
  };

  const handleSaveReport = async () => {
    // TODO: 레포트 저장 로직
    alert('레포트가 저장되었습니다!');
  };

  if (loading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-white text-lg">레포트를 생성하고 있습니다...</p>
          <p className="text-purple-300 text-sm mt-2">당신의 독서 DNA를 분석 중입니다</p>
        </div>
      </motion.div>
    );
  }

  if (error || !report) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || '레포트를 찾을 수 없습니다.'}</p>
          <motion.button
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            온보딩 다시하기
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const { persona, personalityProfile, readingDNA, radarChartData, recommendedBooks, growthPotential, statistics } =
    report;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden"
      variants={pageFadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section - 페르소나 소개 */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: `radial-gradient(circle, ${persona.colorTheme.primary}40 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 페르소나 아이콘 */}
          <motion.div
            className="text-9xl mb-8"
            variants={floatVariants}
            animate="animate"
          >
            {persona.icon}
          </motion.div>

          {/* 타이틀 */}
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"
            variants={itemVariants}
          >
            {persona.title}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-purple-200 mb-12"
            variants={itemVariants}
          >
            {persona.subtitle}
          </motion.p>

          {/* 설명 */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-white/20"
            variants={blurVariants}
          >
            <p className="text-lg leading-relaxed text-white/90">{persona.description}</p>
          </motion.div>

          {/* 핵심 특징 */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
            variants={staggerGridContainerVariants}
          >
            {persona.keyTraits.map((trait, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-purple-600/50 to-pink-600/50 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <p className="font-medium">{trait}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* 스크롤 표시 */}
          <motion.div
            className="mt-16"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-sm text-purple-300 mb-2">아래로 스크롤하여 더 알아보기</p>
            <div className="w-6 h-10 border-2 border-purple-400 rounded-full mx-auto flex items-start justify-center p-2">
              <motion.div
                className="w-1 h-3 bg-purple-400 rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Personality Profile - 레이더 차트 */}
      <section className="relative py-20 px-4">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={blurVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            당신의 독서 성향 분석
          </motion.h2>
          <motion.p
            className="text-purple-200 text-center mb-12 text-lg"
            variants={itemVariants}
          >
            Big Five 성격 이론을 독서 성향에 적용한 분석 결과입니다
          </motion.p>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* 레이더 차트 */}
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
              variants={cardVariants}
              whileHover="hover"
            >
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarChartData}>
                  <PolarGrid stroke="#ffffff40" />
                  <PolarAngleAxis dataKey="subject" stroke="#ffffff" tick={{ fill: '#ffffff' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#ffffff40" tick={{ fill: '#ffffff80' }} />
                  <Radar
                    name="독서 성향"
                    dataKey="value"
                    stroke={persona.colorTheme.primary}
                    fill={persona.colorTheme.primary}
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* 성격 프로필 상세 */}
            <motion.div
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {Object.entries(personalityProfile).map(([key, value]) => (
                <motion.div
                  key={key}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                  variants={itemVariants}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold capitalize">
                      {key === 'openness' && '개방성'}
                      {key === 'conscientiousness' && '성실성'}
                      {key === 'extraversion' && '외향성'}
                      {key === 'agreeableness' && '친화성'}
                      {key === 'neuroticism' && '안정성'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        value.level === 'high'
                          ? 'bg-green-500/20 text-green-300'
                          : value.level === 'moderate'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {value.level === 'high' ? '높음' : value.level === 'moderate' ? '보통' : '낮음'}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${persona.colorTheme.primary}, ${persona.colorTheme.secondary})`,
                        }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${value.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-purple-200">{value.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Reading DNA */}
      <section className="relative py-20 px-4 bg-black/30">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            독서 DNA 분석
          </motion.h2>
          <motion.p
            className="text-purple-200 text-center mb-12 text-lg"
            variants={itemVariants}
          >
            당신만의 독특한 독서 유전자를 발견하세요
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 독서 목적 */}
            <motion.div
              className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
              variants={cardVariants}
              whileHover="hover"
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-3xl mr-3">🎯</span>
                독서 목적
              </h3>
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-purple-500/50 rounded-full text-sm font-medium mr-2 mb-2">
                  주 목적: {readingDNA.purposes.primary}
                </span>
                {readingDNA.purposes.secondary.map((purpose) => (
                  <span
                    key={purpose}
                    className="inline-block px-4 py-2 bg-purple-400/30 rounded-full text-sm mr-2 mb-2"
                  >
                    {purpose}
                  </span>
                ))}
              </div>
              <p className="text-purple-100 leading-relaxed">{readingDNA.purposes.analysis}</p>
            </motion.div>

            {/* 독서 스타일 */}
            <motion.div
              className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
              variants={cardVariants}
              whileHover="hover"
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-3xl mr-3">📖</span>
                독서 스타일
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-purple-200">책 길이:</span>
                  <span className="font-medium">{readingDNA.style.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">독서 속도:</span>
                  <span className="font-medium">{readingDNA.style.pace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">선호 난이도:</span>
                  <span className="font-medium">{readingDNA.style.difficulty}</span>
                </div>
              </div>
              <p className="text-blue-100 leading-relaxed">{readingDNA.style.analysis}</p>
            </motion.div>

            {/* 분위기 & 감정 */}
            <motion.div
              className="bg-gradient-to-br from-pink-600/20 to-rose-600/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
              variants={cardVariants}
              whileHover="hover"
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-3xl mr-3">💭</span>
                분위기 & 감정
              </h3>
              <div className="mb-4">
                <p className="text-sm text-purple-200 mb-2">선호 분위기:</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {readingDNA.atmosphere.moods.map((mood) => (
                    <span key={mood} className="px-3 py-1 bg-pink-500/30 rounded-full text-sm">
                      {mood}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-purple-200 mb-2">선호 감정:</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {readingDNA.atmosphere.emotions.map((emotion) => (
                    <span key={emotion} className="px-3 py-1 bg-rose-500/30 rounded-full text-sm">
                      {emotion}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-purple-300">
                  지배적 분위기: <strong>{readingDNA.atmosphere.dominantMood}</strong> | 감정 범위:{' '}
                  <strong>{readingDNA.atmosphere.emotionalRange}</strong>
                </p>
              </div>
              <p className="text-pink-100 leading-relaxed">{readingDNA.atmosphere.analysis}</p>
            </motion.div>

            {/* 콘텐츠 선호 */}
            <motion.div
              className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
              variants={cardVariants}
              whileHover="hover"
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-3xl mr-3">📚</span>
                콘텐츠 선호
              </h3>
              <div className="mb-4">
                <p className="text-sm text-purple-200 mb-2">선호 테마:</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {readingDNA.content.themes.map((theme) => (
                    <span key={theme} className="px-3 py-1 bg-indigo-500/30 rounded-full text-sm">
                      {theme}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-purple-200 mb-2">서술 스타일:</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {readingDNA.content.narrativeStyles.map((style) => (
                    <span key={style} className="px-3 py-1 bg-violet-500/30 rounded-full text-sm">
                      {style}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-purple-300">
                  주요 테마: <strong>{readingDNA.content.primaryTheme}</strong>
                </p>
              </div>
              <p className="text-indigo-100 leading-relaxed">{readingDNA.content.analysis}</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Recommended Books */}
      <section className="relative py-20 px-4">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            당신을 위한 추천 도서
          </motion.h2>
          <motion.p
            className="text-purple-200 text-center mb-12 text-lg"
            variants={itemVariants}
          >
            독서 DNA와 성격 프로필을 기반으로 선별한 책들입니다
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {recommendedBooks.map((book) => (
              <motion.div
                key={book.bookId}
                className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 group"
                variants={zoomVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* 책 표지 */}
                <div className="relative h-64 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-6xl">📖</span>
                  {/* TODO: 실제 이미지로 교체 */}
                  {/* <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" /> */}

                  {/* 매칭 점수 배지 */}
                  <motion.div
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full"
                    variants={glowVariants}
                    animate="animate"
                  >
                    <span className="text-purple-900 font-bold text-sm">{book.overallMatchScore}% 매칭</span>
                  </motion.div>
                </div>

                {/* 책 정보 */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-purple-300 text-sm mb-4">{book.author}</p>
                  <p className="text-sm text-purple-100 italic mb-4">&ldquo;{book.tagline}&rdquo;</p>

                  {/* 추천 이유 */}
                  <div className="space-y-2">
                    {book.reasons.slice(0, 2).map((reason, idx) => (
                      <div key={idx} className="text-xs bg-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-purple-200">
                            {reason.category === 'mood' && '분위기'}
                            {reason.category === 'theme' && '테마'}
                            {reason.category === 'genre' && '장르'}
                            {reason.category === 'style' && '스타일'}
                            {reason.category === 'personality' && '성격'}
                          </span>
                          <span className="text-green-300 font-bold">{reason.matchScore}%</span>
                        </div>
                        <p className="text-purple-100">{reason.reason}</p>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    onClick={() => {
                      setSelectedBookId(book.bookId);
                      setIsModalOpen(true);
                    }}
                    className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    자세히 보기
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Growth Potential */}
      <section className="relative py-20 px-4 bg-black/30">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={blurVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            성장 가능성
          </motion.h2>
          <motion.p
            className="text-purple-200 text-center mb-12 text-lg"
            variants={itemVariants}
          >
            더 넓은 독서 세계로 나아가기 위한 제안
          </motion.p>

          {/* 현재 범위 */}
          <motion.div
            className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20"
            variants={cardVariants}
          >
            <h3 className="text-2xl font-bold mb-4">현재 독서 범위</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{
                    width:
                      growthPotential.currentScope === 'narrow'
                        ? '33%'
                        : growthPotential.currentScope === 'moderate'
                          ? '66%'
                          : '100%',
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm font-medium">
                {growthPotential.currentScope === 'narrow' && '좁음'}
                {growthPotential.currentScope === 'moderate' && '보통'}
                {growthPotential.currentScope === 'diverse' && '다양함'}
              </span>
            </div>
            <p className="text-purple-100 leading-relaxed">{growthPotential.growthPath}</p>
          </motion.div>

          {/* 탐험 추천 영역 */}
          <motion.div
            className="space-y-4"
            variants={staggerGridContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {growthPotential.explorationAreas.map((area, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                variants={itemVariants}
                whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-xl font-bold">{area.area}</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      area.difficulty === 'easy'
                        ? 'bg-green-500/20 text-green-300'
                        : area.difficulty === 'moderate'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {area.difficulty === 'easy' ? '쉬움' : area.difficulty === 'moderate' ? '보통' : '도전적'}
                  </span>
                </div>
                <p className="text-purple-100">{area.reason}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Closing & CTA */}
      <section className="relative py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/20"
            variants={blurVariants}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6"
              variants={itemVariants}
            >
              당신의 독서 여정을 응원합니다
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-purple-100 leading-relaxed mb-8"
              variants={itemVariants}
            >
              {report.closingMessage}
            </motion.p>

            {/* 통계 요약 */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              variants={staggerGridContainerVariants}
            >
              <motion.div
                className="bg-white/10 rounded-xl p-4"
                variants={itemVariants}
              >
                <p className="text-3xl font-bold text-purple-300">{statistics.totalResponses}</p>
                <p className="text-sm text-purple-200">응답 수</p>
              </motion.div>
              <motion.div
                className="bg-white/10 rounded-xl p-4"
                variants={itemVariants}
              >
                <p className="text-3xl font-bold text-pink-300">{statistics.diversityScore}</p>
                <p className="text-sm text-purple-200">다양성</p>
              </motion.div>
              <motion.div
                className="bg-white/10 rounded-xl p-4"
                variants={itemVariants}
              >
                <p className="text-3xl font-bold text-blue-300">{statistics.clarityScore}</p>
                <p className="text-sm text-purple-200">명확성</p>
              </motion.div>
              <motion.div
                className="bg-white/10 rounded-xl p-4"
                variants={itemVariants}
              >
                <p className="text-3xl font-bold text-green-300">{statistics.completionRate}%</p>
                <p className="text-sm text-purple-200">완성도</p>
              </motion.div>
            </motion.div>

            {/* CTA 버튼들 */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={itemVariants}
            >
              <motion.button
                onClick={handleStartReading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/50"
                variants={magneticVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                독서 시작하기 📚
              </motion.button>

              <motion.button
                onClick={handleSaveReport}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl font-bold text-lg"
                variants={magneticVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                레포트 저장하기 💾
              </motion.button>
            </motion.div>
          </motion.div>

          {/* 프로필에서 다시 보기 안내 */}
          <motion.p
            className="mt-8 text-sm text-purple-300"
            variants={itemVariants}
          >
            이 레포트는 프로필 페이지에서 언제든 다시 볼 수 있습니다
          </motion.p>
        </motion.div>
      </section>

      {/* Book Detail Modal */}
      {selectedBookId && (
        <BookDetailModal
          bookId={selectedBookId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBookId(null);
          }}
        />
      )}
    </motion.div>
  );
}
