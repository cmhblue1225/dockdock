import { ReactNode } from 'react';

interface BookCardProps {
  coverImageUrl?: string;
  title: string;
  author?: string;
  subtitle?: string; // 추가 정보 (완독일 등)
  progress?: number; // 0-100
  rating?: number; // 1-5
  icon?: string; // 이모지 또는 아이콘
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export default function BookCard({
  coverImageUrl,
  title,
  author,
  subtitle,
  progress,
  rating,
  icon = '📚',
  onClick,
  className = '',
  children,
}: BookCardProps) {
  return (
    <div
      className={`group cursor-pointer transition-all duration-300 hover:-translate-y-1 ${className}`}
      onClick={onClick}
    >
      {/* Book Cover */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-custom group-hover:shadow-custom-lg transition-shadow duration-300 mb-3">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ios-green to-ios-green-dark flex items-center justify-center text-6xl">
            {icon}
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="text-center px-1">
        <h3 className="font-semibold text-sm text-text-primary mb-1 line-clamp-2">
          {title}
        </h3>

        {author && (
          <p className="text-xs text-text-secondary mb-2 line-clamp-1">
            {author}
          </p>
        )}

        {subtitle && (
          <p className="text-xs text-text-secondary mb-2 line-clamp-1">
            {subtitle}
          </p>
        )}

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mb-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="flex-1 h-1.5 bg-border-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-ios-green transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-ios-green">
                {progress}%
              </span>
            </div>
          </div>
        )}

        {/* Rating */}
        {rating !== undefined && (
          <div className="flex items-center justify-center gap-0.5 text-warning">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'fill-current' : 'fill-border-gray'}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        )}

        {/* Custom Children */}
        {children}
      </div>
    </div>
  );
}
