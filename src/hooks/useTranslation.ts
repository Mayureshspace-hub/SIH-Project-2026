import { useTranslation as useTranslationOriginal } from 'react-i18next';

export const useTranslate = () => {
  const { t, i18n } = useTranslationOriginal();

  const translate = (key: string, options?: any) => t(key, options);
  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);
  const getCurrentLanguage = () => i18n.language;

  return {
    t: translate,
    translate,
    changeLanguage,
    getCurrentLanguage,
    i18n
  };
};
