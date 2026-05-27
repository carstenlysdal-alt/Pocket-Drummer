'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, TranslationKey } from './translations';

export type Language = 'da' | 'en' | 'de' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('da');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pocketdrummer_language') as Language;
      if (saved && ['da', 'en', 'de', 'es'].includes(saved)) {
        setLanguageState(saved);
      } else if (typeof navigator !== 'undefined') {
        const pref = navigator.language.slice(0, 2) as Language;
        if (['da', 'en', 'de', 'es'].includes(pref)) {
          setLanguageState(pref);
        }
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pocketdrummer_language', lang);
    }
  };

  const t = (key: TranslationKey): string => {
    const group = translations[language];
    return group[key] || translations['da'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
