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
