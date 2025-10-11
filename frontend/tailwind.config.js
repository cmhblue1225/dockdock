/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 올리브 그린 + 베이지 톤 (메인 컬러 시스템)
        'ios-green': '#4F6815',        // Primary - 올리브 그린 (메인 포인트 컬러)
        'ios-green-dark': '#3D5010',   // Primary Dark (hover, active 상태)
        'ios-green-light': '#6B8A1E',  // Primary Light (배경용)

        // Background & Surface
        'background': '#F0E6DA',        // 기본 배경 (surface와 동일)
        'surface': '#F0E6DA',           // 베이지 배경
        'surface-light': '#FEFDFB',     // 카드/서피스 (거의 흰색)
        'sidebar-bg': '#FFFFFF',        // 사이드바 배경 (데스크톱)

        // Colors (기존 호환성)
        'primary': '#4F6815',           // ios-green과 동일
        'secondary': '#3D5010',         // ios-green-dark와 동일

        // Text Colors
        'text-primary': '#2C2C2C',      // 주요 텍스트
        'text-secondary': '#8E8E93',    // 보조 텍스트

        // Border & Utility
        'border-color': '#E5E5E0',      // 테두리 색상
        'border-gray': '#E5E5E0',       // 테두리 색상 (별칭)

        // Status Colors
        'success': '#34C759',
        'warning': '#FF9500',
        'error': '#FF3B30',
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
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translate(-50%, 20px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideUp: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        slideUpFade: 'slideUpFade 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pageEnter: 'pageEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
