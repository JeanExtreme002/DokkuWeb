import { useEffect, useState } from 'react';

import { usePageTranslation } from '@/i18n/utils';

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

export const useAppNameValidation = (name: string) => {
  const { t } = usePageTranslation();
  const trimmedName = name.trim();
  if (trimmedName.length === 0) return { isValid: false, message: '' };

  const startsWithLetter = /^[a-zA-Z]/.test(trimmedName);
  const endsWithLetterOrNumber = /[a-zA-Z0-9]$/.test(trimmedName);
  const letterCount = (trimmedName.match(/[a-zA-Z]/g) || []).length;

  if (trimmedName.length < 3) {
    return { isValid: false, message: t('name.validation.minLength') };
  }
  if (!startsWithLetter) {
    return { isValid: false, message: t('name.validation.startsWithLetter') };
  }
  if (!endsWithLetterOrNumber) {
    return { isValid: false, message: t('name.validation.endsWithAlnum') };
  }
  if (letterCount < 3) {
    return { isValid: false, message: t('name.validation.minLetters') };
  }
  if (trimmedName.length > 50) {
    return { isValid: false, message: t('name.validation.maxLength') };
  }

  return { isValid: true, message: '' };
};
