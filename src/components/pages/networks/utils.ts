import { usePageTranslation } from '@/i18n/utils';

export const useNetworkNameValidation = (name: string) => {
  const { t } = usePageTranslation();
  const trimmedName = name.trim();
  if (trimmedName.length === 0) return { isValid: false, message: '' };

  if (trimmedName.length < 3) {
    return { isValid: false, message: t('modals.create.validation.minLength') };
  }
  if (!/^[a-zA-Z]/.test(trimmedName)) {
    return { isValid: false, message: t('modals.create.validation.startsWithLetter') };
  }
  if (trimmedName.length > 30) {
    return { isValid: false, message: t('modals.create.validation.maxLength') };
  }
  if (trimmedName.endsWith('-')) {
    return { isValid: false, message: t('modals.create.validation.endsWithHyphen') };
  }

  return { isValid: true, message: '' };
};
