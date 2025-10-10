export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          📚 독독 (DockDock)
        </h1>
        <p className="text-text-secondary text-lg">
          독서 관리 플랫폼에 오신 것을 환영합니다!
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 독서 중인 책 */}
          <div className="bg-surface p-6 rounded-2xl shadow-custom">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">
              📖 독서 중인 책
            </h2>
            <p className="text-text-secondary">
              현재 읽고 있는 책이 없습니다.
            </p>
          </div>

          {/* 최근 기록 */}
          <div className="bg-surface p-6 rounded-2xl shadow-custom">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">
              ✍️ 최근 기록
            </h2>
            <p className="text-text-secondary">
              독서 기록이 없습니다.
            </p>
          </div>

          {/* 독서 통계 */}
          <div className="bg-surface p-6 rounded-2xl shadow-custom">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">
              📊 독서 통계
            </h2>
            <p className="text-text-secondary">
              통계를 확인해보세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
