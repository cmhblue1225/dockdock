import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // 책 검색 쿼리
  const { data, isLoading, error } = useQuery({
    queryKey: ['books', 'search', activeSearch],
    queryFn: async () => {
      if (!activeSearch) return null;

      const response = await api.get('/api/books', {
        params: { search: activeSearch }
      });

      return response.data;
    },
    enabled: !!activeSearch,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setActiveSearch(searchTerm.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          책 검색
        </h1>

        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="책 제목 또는 ISBN을 입력하세요..."
              className="flex-1 px-6 py-4 border border-border-color rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            />
            <button
              type="submit"
              className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-secondary transition-colors"
            >
              검색
            </button>
          </div>
        </form>

        {/* 검색 결과 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-secondary">검색 중...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            검색 중 오류가 발생했습니다.
          </div>
        )}

        {data && data.success && (
          <div className="space-y-4">
            <p className="text-text-secondary">
              {data.data.books ? `${data.data.books.length}개의 결과를 찾았습니다` : '책 정보를 불러왔습니다'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data.data.books || [data.data]).map((book: any) => (
                <div
                  key={book.id}
                  className="bg-surface p-6 rounded-xl shadow-custom hover:shadow-custom-lg transition-shadow"
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-64 object-contain mb-4 rounded-lg"
                  />
                  <h3 className="font-semibold text-lg text-text-primary mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-2">{book.author}</p>
                  <p className="text-text-secondary text-sm">{book.publisher}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!activeSearch && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-text-secondary text-lg">
              책 제목이나 ISBN을 검색해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
