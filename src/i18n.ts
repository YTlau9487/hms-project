import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import zhTW from './locales/zh-TW/translation.json';
import zhCN from './locales/zh-CN/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'zh-TW': { translation: zhTW },
      'zh-CN': { translation: zhCN },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    // Non-blocking initialization: i18n initializes asynchronously
    // so it doesn't block the initial page render
    initImmediate: true,
  });

export default i18n;
