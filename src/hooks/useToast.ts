import Toast from 'react-native-toast-message';
import { ToastType, ToastMessage } from '@/types';

interface UseToastReturn {
  show: (message: ToastMessage) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  hide: () => void;
}

export default function useToast(): UseToastReturn {
  const show = (message: ToastMessage) => {
    Toast.show({
      type: message.type,
      text1: message.title,
      text2: message.message,
      visibilityTime: message.duration || 3000,
    });
  };

  const showSuccess = (title: string, message?: string) => {
    show({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    show({ type: 'error', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    show({ type: 'info', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    show({ type: 'warning', title, message });
  };

  const hide = () => {
    Toast.hide();
  };

  return {
    show,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hide,
  };
}