import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';

interface AppLayoutProps {
  children?: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-[260px] min-h-screen pb-16 lg:pb-0">
        <div className="animate-pageEnter">
          {children || <Outlet />}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />
    </div>
  );
}
