/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 브라운/베이지 톤 (기존 목업 디자인)
        primary: '#D4A574',       // 브라운/골드
        secondary: '#8B7355',     // 다크 브라운
        accent: '#E8B88B',        // 라이트 브라운
        background: '#F5F5F0',    // 아이보리/베이지
        surface: '#FEFDFB',       // 화이트
        'sidebar-bg': '#FFFFFF',  // 사이드바
        'text-primary': '#2C2C2C',   // 다크 그레이
        'text-secondary': '#8E8E93', // 그레이
        'ios-green': '#5E6B3D',      // 로그인 화면의 올리브 그린
        'border-color': '#E5E5E0',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'SF Pro Display',
          'sans-serif',
        ],
      },
      boxShadow: {
        'custom': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'custom-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'custom-xl': '0 20px 60px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
