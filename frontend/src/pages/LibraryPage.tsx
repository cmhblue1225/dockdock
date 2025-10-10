export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          내 서재
        </h1>

        <div className="bg-surface p-12 rounded-2xl shadow-custom text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            서재가 비어있습니다
          </h2>
          <p className="text-text-secondary mb-6">
            책을 검색하여 독서를 시작해보세요!
          </p>
          <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors">
            책 검색하기
          </button>
        </div>
      </div>
    </div>
  );
}
