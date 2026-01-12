import { useEffect, useState } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

export const validateAppName = (name: string) => {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) return { isValid: false, message: '' };

  const startsWithLetter = /^[a-zA-Z]/.test(trimmedName);
  const endsWithLetterOrNumber = /[a-zA-Z0-9]$/.test(trimmedName);
  const letterCount = (trimmedName.match(/[a-zA-Z]/g) || []).length;

  if (trimmedName.length < 3) {
    return { isValid: false, message: '(mínimo 3 caracteres)' };
  }
  if (!startsWithLetter) {
    return { isValid: false, message: '(deve começar com uma letra)' };
  }
  if (!endsWithLetterOrNumber) {
    return { isValid: false, message: '(deve terminar com letra ou número)' };
  }
  if (letterCount < 3) {
    return { isValid: false, message: '(mínimo 3 letras)' };
  }
  if (trimmedName.length > 50) {
    return { isValid: false, message: '(máximo 50 caracteres)' };
  }

  return { isValid: true, message: '' };
};
