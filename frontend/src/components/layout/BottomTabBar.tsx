import { Link, useLocation } from 'react-router-dom';

interface TabItem {
  path: string;
  icon: string;
  label: string;
}

const tabItems: TabItem[] = [
  { path: '/', icon: '🏠', label: '홈' },
  { path: '/search', icon: '🔍', label: '검색' },
  { path: '/wishlist', icon: '💫', label: '위시리스트' },
  { path: '/profile', icon: '👤', label: '프로필' },
];

export default function BottomTabBar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-light border-t border-border-gray z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg
              transition-all duration-300 flex-1 max-w-[100px]
              ${
                isActive(item.path)
                  ? 'text-ios-green'
                  : 'text-text-secondary active:scale-95'
              }
            `}
          >
            {/* Icon */}
            <span
              className={`
                text-2xl transition-all duration-300
                ${isActive(item.path) ? 'scale-110' : 'scale-100'}
              `}
            >
              {item.icon}
            </span>

            {/* Label */}
            <span
              className={`
                text-xs font-medium transition-all duration-300
                ${isActive(item.path) ? 'font-semibold' : 'font-normal'}
              `}
            >
              {item.label}
            </span>

            {/* Active Indicator Dot */}
            {isActive(item.path) && (
              <div className="absolute bottom-1 w-1 h-1 bg-ios-green rounded-full" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
