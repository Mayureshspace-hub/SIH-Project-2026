/** Locale-aware display helpers. Keep API/database values unchanged and format only UI values. */
export type SupportedLanguage = 'en' | 'hi' | 'mr';

const localeByLanguage: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
};

export const getLocale = (language?: string) =>
  localeByLanguage[(language?.split('-')[0] as SupportedLanguage) || 'en'] || localeByLanguage.en;

export const formatNumber = (value: number, language?: string, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(getLocale(language), options).format(value);

export const formatCurrency = (value: number, language?: string) =>
  new Intl.NumberFormat(getLocale(language), {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);

export const formatDate = (value: Date | string | number, language?: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(getLocale(language), options).format(new Date(value));

export const formatTime = (value: Date | string | number, language?: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(getLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(new Date(value));
