import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('Kisan MargLanguage', lng);
  };

  const languages = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-stone-500" />
      <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              i18n.language === lang.code
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
            title={lang.label}
          >
            {lang.nativeLabel}
          </button>
        ))}
      </div>
    </div>
  );
};
