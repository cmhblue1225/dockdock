import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: '🏠', label: '홈' },
  { path: '/search', icon: '🔍', label: '검색' },
  { path: '/wishlist', icon: '💫', label: '위시리스트' },
  { path: '/profile', icon: '👤', label: '프로필' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-[260px] h-screen bg-sidebar-bg border-r border-border-gray fixed left-0 top-0 p-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 px-2 mb-8 group">
        <div className="text-4xl transition-transform duration-300 group-hover:rotate-6">
          📚
        </div>
        <span className="text-2xl font-bold text-text-primary">독독</span>
      </Link>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1 mb-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              relative flex items-center gap-3 px-4 py-3 rounded-xl
              transition-all duration-300 ease-out
              overflow-hidden group
              ${
                isActive(item.path)
                  ? 'bg-ios-green text-white'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary hover:translate-x-1'
              }
            `}
          >
            {/* Active Indicator */}
            {!isActive(item.path) && (
              <div className="absolute left-0 top-0 bottom-0 w-0 bg-ios-green transition-all duration-300 group-hover:w-1" />
            )}

            <span className="text-xl transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </span>
            <span className="text-[15px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Continue Reading Widget (임시 - 나중에 실제 데이터 연결) */}
      <div className="bg-gradient-to-br from-surface to-surface-light rounded-2xl p-4 mb-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-custom">
        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
          계속 읽기
        </div>

        <div className="flex gap-3 mb-4">
          <div className="w-14 h-20 bg-gradient-to-br from-ios-green to-ios-green-dark rounded-lg flex items-center justify-center text-2xl shadow-custom">
            📖
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-sm font-semibold text-text-primary mb-1 line-clamp-2">
              독서 중인 책
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-border-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-ios-green rounded-full transition-all duration-500"
                  style={{ width: '42%' }}
                />
              </div>
              <span className="text-xs font-semibold text-ios-green">42%</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Widget */}
      <div className="bg-surface-light rounded-xl p-3 transition-all duration-300 hover:bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ios-green text-white flex items-center justify-center text-lg font-semibold">
            {user?.email?.[0]?.toUpperCase() || '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              {user?.email?.split('@')[0] || '독서러버'}
            </div>
            <button
              onClick={signOut}
              className="text-xs text-text-secondary hover:text-ios-green transition-colors"
            >
              로그아웃
            </button>
          </div>
          <svg
            className="w-5 h-5 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
