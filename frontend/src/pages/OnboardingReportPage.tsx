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
import api from '../lib/api';
import type { OnboardingReport } from '../types/report';

/**
 * 온보딩 레포트 페이지 (Simple Version)
 * 백엔드 타입 구조에 맞춘 간단한 버전
 */
export default function OnboardingReportPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState<OnboardingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

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
          <p className="text-white text-lg">레포트를 불러오고 있습니다...</p>
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

  // 레이더 차트 데이터 변환 (recharts 형식에 맞춤)
  const radarChartData = report.bigFive.radarChartData.map(point => ({
    subject: point.subject,
    value: point.A,
    fullMark: point.fullMark,
  }));

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section - 페르소나 */}
        <motion.section
          className="text-center mb-16"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-8xl mb-6">{report.persona.icon}</div>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            {report.persona.title}
          </h1>
          <p className="text-xl text-purple-200 mb-6">{report.persona.subtitle}</p>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-3xl mx-auto">
            <p className="text-lg leading-relaxed">{report.persona.description}</p>
          </div>

          {/* 핵심 특징 */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {report.persona.keyTraits.map((trait, index) => (
              <motion.span
                key={index}
                className="px-4 py-2 bg-purple-600/50 rounded-full text-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                {trait}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* Big Five 성격 분석 */}
        <motion.section
          className="mb-16"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">독서 성향 분석</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 레이더 차트 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarChartData}>
                  <PolarGrid stroke="#ffffff40" />
                  <PolarAngleAxis dataKey="subject" stroke="#ffffff" tick={{ fill: '#ffffff', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#ffffff40" tick={{ fill: '#ffffff80' }} />
                  <Radar
                    name="점수"
                    dataKey="value"
                    stroke="#a855f7"
                    fill="#a855f7"
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
            </div>

            {/* 성격 프로필 상세 */}
            <div className="space-y-4">
              {Object.entries(report.bigFive.profile).map(([key, trait]) => (
                <div key={key} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{trait.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        trait.level === 'high'
                          ? 'bg-green-500/20 text-green-300'
                          : trait.level === 'moderate'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {trait.level === 'high' ? '높음' : trait.level === 'moderate' ? '보통' : '낮음'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${trait.score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-purple-200">{trait.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 독서 DNA */}
        <motion.section
          className="mb-16"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">독서 DNA</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {report.readingDNA.map((dna, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl mb-3">{dna.icon}</div>
                <h3 className="text-xl font-bold mb-2">{dna.title}</h3>
                <p className="text-sm text-purple-100">{dna.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 독서 성향 분석 */}
        <motion.section
          className="mb-16"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">독서 스타일</h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{report.readingStyle.mainStyle.title}</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-white/20 rounded-full h-3">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${report.readingStyle.mainStyle.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{report.readingStyle.mainStyle.percentage}%</span>
              </div>
              <p className="text-purple-100">{report.readingStyle.mainStyle.description}</p>
            </div>

            {report.readingStyle.subStyles.map((style, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{style.title}</span>
                  <span className="text-sm">{style.percentage}%</span>
                </div>
                <div className="bg-white/20 rounded-full h-2 mb-2">
                  <div
                    className="h-full bg-purple-500/70 rounded-full"
                    style={{ width: `${style.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-purple-200">{style.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 추천 도서 */}
        {report.recommendedBooks.length > 0 && (
          <motion.section
            className="mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">추천 도서</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {report.recommendedBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <h3 className="text-lg font-bold mb-2">{book.title}</h3>
                  <p className="text-sm text-purple-300 mb-3">{book.author}</p>
                  <div className="bg-purple-600/30 rounded-lg p-3 mb-3">
                    <p className="text-xs text-purple-100">{book.reason}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-200">매칭 점수</span>
                    <span className="text-lg font-bold text-green-400">{book.matchScore}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* AI 종합 분석 */}
        {report.aiSummary && (
          <motion.section
            className="mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-xl rounded-3xl p-8 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6">AI 종합 분석</h2>
              <p className="text-lg leading-relaxed text-purple-100">{report.aiSummary}</p>
            </div>
          </motion.section>
        )}

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <motion.button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            독서 시작하기 📚
          </motion.button>
          <p className="mt-4 text-sm text-purple-300">이 레포트는 프로필 페이지에서 언제든 다시 볼 수 있습니다</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
