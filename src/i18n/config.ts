/**
 * Internationalization Configuration
 * Supports Arabic and English with dynamic direction (RTL/LTR)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ar: { translation: arTranslations },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

/**
 * Set document direction and font based on language
 */
export const setLanguageDirection = (lng: string) => {
  const isArabic = lng === 'ar';
  const html = document.documentElement;
  
  // Set direction
  html.dir = isArabic ? 'rtl' : 'ltr';
  html.lang = lng;
  
  // Set font family
  if (isArabic) {
    // Import Amiri font for Arabic
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Amiri', serif";
  } else {
    // Import Inter font for English
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Inter', sans-serif";
  }
};

i18n.on('languageChanged', setLanguageDirection);
setLanguageDirection(i18n.language);

export default i18n;
