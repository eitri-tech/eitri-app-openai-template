import { useState, useCallback } from "react";

interface UseToastReturn {
  showToast: boolean;
  displayToast: (duration?: number) => void;
  hideToast: () => void;
}

/**
 * Hook customizado para gerenciar o estado e exibição de toasts
 * @param defaultDuration - Duração padrão em milissegundos (padrão: 5000ms)
 * @returns Objeto com estado e funções para controlar o toast
 */
export const useToast = (defaultDuration: number = 5000): UseToastReturn => {
  const [showToast, setShowToast] = useState(false);

  const displayToast = useCallback((duration: number = defaultDuration) => {
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, duration);
  }, [defaultDuration]);

  const hideToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return {
    showToast,
    displayToast,
    hideToast,
  };
};
