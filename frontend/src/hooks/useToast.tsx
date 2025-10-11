import { useState, useCallback } from 'react';
import Toast, { ToastProps } from '../components/ui/Toast';
import { createRoot } from 'react-dom/client';

interface ToastOptions {
  duration?: number;
}

export function useToast() {
  const showToast = useCallback(
    (
      message: string,
      type: ToastProps['type'] = 'info',
      options: ToastOptions = {}
    ) => {
      const { duration = 3000 } = options;

      // 토스트 컨테이너 생성
      const toastContainer = document.createElement('div');
      toastContainer.className = 'fixed top-4 right-4 z-50';
      document.body.appendChild(toastContainer);

      // 토스트 렌더링
      const root = createRoot(toastContainer);
      root.render(<Toast message={message} type={type} duration={duration} />);

      // duration 후 제거
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(toastContainer);
      }, duration + 500); // 애니메이션 시간 고려
    },
    []
  );

  return { showToast };
}
