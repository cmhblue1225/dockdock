/**
 * 프리미엄 온보딩을 위한 Framer Motion 애니메이션 variants
 * Netflix × Apple × Spotify 스타일
 */

import { Variants } from 'framer-motion';

/**
 * 페이지 전환 애니메이션
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for smooth entrance
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * 페이지 fade 전환 (방향 없이)
 */
export const pageFadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * 카드 등장 애니메이션 (Scale + Fade)
 */
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 0.5,
    },
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
  },
};

/**
 * 컨테이너 - Stagger Children (순차 등장)
 */
export const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * 컨테이너 - 빠른 Stagger
 */
export const fastContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

/**
 * 아이템 - 아래에서 위로 등장
 */
export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

/**
 * 버튼 애니메이션
 */
export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
  },
};

/**
 * 체크마크 애니메이션 (선택 시)
 */
export const checkmarkVariants: Variants = {
  hidden: {
    scale: 0,
    rotate: -180,
    opacity: 0,
  },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
  exit: {
    scale: 0,
    rotate: 180,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * 진행률 바 애니메이션
 */
export const progressBarVariants: Variants = {
  initial: {
    scaleX: 0,
    originX: 0,
  },
  animate: {
    scaleX: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * 숫자 카운팅 (진행률 등)
 */
export const counterVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * 모달/오버레이 배경
 */
export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * 모달 컨텐츠 (Scale + Fade)
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * 로딩 스피너 회전
 */
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

/**
 * 펄스 애니메이션 (강조)
 */
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

/**
 * Glow 효과 애니메이션
 */
export const glowVariants: Variants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
  },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(59, 130, 246, 0)',
      '0 0 20px 5px rgba(59, 130, 246, 0.4)',
      '0 0 0 0 rgba(59, 130, 246, 0)',
    ],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

/**
 * 책 표지 3D 효과용 variants
 */
export const bookCoverVariants: Variants = {
  hidden: {
    opacity: 0,
    rotateY: -90,
  },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 15,
    },
  },
  hover: {
    scale: 1.05,
    rotateY: 5,
    transition: {
      type: 'spring',
      stiffness: 300,
    },
  },
};

/**
 * 슬라이드 진입 (좌측에서)
 */
export const slideFromLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

/**
 * 슬라이드 진입 (우측에서)
 */
export const slideFromRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

/**
 * Wave 애니메이션용 delay 계산
 */
export const getWaveDelay = (index: number, total: number): number => {
  return (index / total) * 0.5;
};

/**
 * 트랜지션 설정
 */
export const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
};

export const smoothTransition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export const fastTransition = {
  duration: 0.3,
  ease: 'easeOut' as const,
};

/**
 * ============================================
 * 🎭 고급 애니메이션 (Phase 2)
 * ============================================
 */

/**
 * 3D Card Flip 애니메이션
 */
export const cardFlipVariants: Variants = {
  front: {
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  back: {
    rotateY: 180,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * 3D Depth 레이어 (Parallax)
 */
export const parallaxLayerVariants = {
  background: {
    y: 0,
    transition: {
      duration: 0,
    },
  },
  foreground: {
    y: 0,
    transition: {
      duration: 0,
    },
  },
};

/**
 * Magnetic Hover 효과 (마우스 끌어당김)
 */
export const magneticVariants: Variants = {
  initial: {
    x: 0,
    y: 0,
  },
  hover: {
    scale: 1.1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

/**
 * Ripple Effect (물결 효과)
 */
export const rippleVariants: Variants = {
  initial: {
    opacity: 1,
    scale: 0,
  },
  animate: {
    opacity: 0,
    scale: 2.5,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Morph Animation (형태 변환)
 */
export const morphVariants: Variants = {
  circle: {
    borderRadius: '50%',
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
  square: {
    borderRadius: '0%',
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
  rounded: {
    borderRadius: '24px',
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
};

/**
 * Float Animation (떠다니기)
 */
export const floatVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

/**
 * Bounce 효과 (튕김)
 */
export const bounceVariants: Variants = {
  initial: {
    scale: 1,
  },
  bounce: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.2, 0.5, 0.8, 1],
    },
  },
};

/**
 * Shake 효과 (흔들림)
 */
export const shakeVariants: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
};

/**
 * Stagger Grid (그리드 순차 등장)
 */
export const staggerGridContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

/**
 * Zoom In/Out
 */
export const zoomVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Reveal Animation (커튼 효과)
 */
export const revealVariants: Variants = {
  hidden: {
    clipPath: 'inset(0 100% 0 0)',
  },
  visible: {
    clipPath: 'inset(0 0% 0 0)',
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * Blur In/Out
 */
export const blurVariants: Variants = {
  initial: {
    opacity: 0,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Rotate & Scale
 */
export const rotateScaleVariants: Variants = {
  initial: {
    rotate: -180,
    scale: 0,
    opacity: 0,
  },
  animate: {
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 20,
    },
  },
};

/**
 * Typewriter 효과용 transition
 */
export const typewriterTransition = {
  duration: 0.05,
  ease: 'linear' as const,
};

/**
 * Elastic 효과
 */
export const elasticTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 10,
};

/**
 * Smooth Elastic (덜 강한 elastic)
 */
export const smoothElasticTransition = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 15,
};

/**
 * 3D Perspective 설정 (부모 요소에 적용)
 */
export const perspective3D = {
  perspective: 1000,
  perspectiveOrigin: 'center',
  transformStyle: 'preserve-3d' as const,
};

/**
 * Particle Burst Effect용 위치 계산
 */
export const getParticleBurstPosition = (index: number, total: number) => {
  const angle = (index / total) * Math.PI * 2;
  const distance = 50 + Math.random() * 50;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
};

/**
 * Stagger Delay 계산 (커스텀)
 */
export const getStaggerDelay = (index: number, staggerTime: number = 0.08): number => {
  return index * staggerTime;
};
