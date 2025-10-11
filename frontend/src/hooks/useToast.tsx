import { useCallback } from 'react';
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

      // 닫기 함수
      const handleClose = () => {
        try {
          root.unmount();
          if (toastContainer.parentNode) {
            document.body.removeChild(toastContainer);
          }
        } catch (error) {
          // 이미 제거된 경우 무시
          console.debug('Toast already removed');
        }
      };

      // 토스트 렌더링
      const root = createRoot(toastContainer);
      root.render(<Toast message={message} type={type} duration={duration} onClose={handleClose} />);

      // duration 후 제거 (안전장치)
      setTimeout(handleClose, duration + 500); // 애니메이션 시간 고려
    },
    []
  );

  return { showToast };
}
