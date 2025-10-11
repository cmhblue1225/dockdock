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

        // Premium Gradient Colors (온보딩용)
        'premium-blue': '#3b82f6',
        'premium-purple': '#8b5cf6',
        'premium-pink': '#ec4899',
        'premium-indigo': '#6366f1',
        'premium-violet': '#a855f7',
      },
      backgroundImage: {
        // 프리미엄 그라데이션
        'gradient-premium': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'gradient-premium-hover': 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        'gradient-card': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
        // Glass morphism 배경
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
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
        // Premium shadows (온보딩용)
        'premium': '0 4px 20px rgba(59, 130, 246, 0.15)',
        'premium-lg': '0 10px 40px rgba(59, 130, 246, 0.2)',
        'premium-xl': '0 20px 60px rgba(59, 130, 246, 0.25)',
        // Glow effects
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        // Glass morphism
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
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
        // Premium animations
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
          },
          '50%': {
            boxShadow: '0 0 20px 5px rgba(59, 130, 246, 0.4)',
          },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'scale-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideUp: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        slideUpFade: 'slideUpFade 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pageEnter: 'pageEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        // Premium animations
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'scale-pulse': 'scale-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
