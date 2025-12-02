'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import nlTranslations from './translations/nl.json';
import enTranslations from './translations/en.json';
import arTranslations from './translations/ar.json';
import trTranslations from './translations/tr.json';

export type Language = 'nl' | 'en' | 'ar' | 'tr';

const translations = {
  nl: nlTranslations,
  en: enTranslations,
  ar: arTranslations,
  tr: trTranslations,
};

interface LanguageContextType {
  language: Language; // UI language
  setLanguage: (lang: Language) => void;
  poemLanguage: Language; // Poem output language
  setPoemLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('nl');
  const [poemLanguage, setPoemLanguageState] = useState<Language>('nl');

  // Load languages from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'nl' || savedLanguage === 'en' || savedLanguage === 'ar' || savedLanguage === 'tr')) {
      setLanguageState(savedLanguage);
    }
    
    const savedPoemLanguage = localStorage.getItem('poemLanguage') as Language;
    if (savedPoemLanguage && (savedPoemLanguage === 'nl' || savedPoemLanguage === 'en' || savedPoemLanguage === 'ar' || savedPoemLanguage === 'tr')) {
      setPoemLanguageState(savedPoemLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Update HTML lang and dir attributes for accessibility
    document.documentElement.lang = lang;
    // Set RTL for Arabic
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  const setPoemLanguage = (lang: Language) => {
    setPoemLanguageState(lang);
    localStorage.setItem('poemLanguage', lang);
  };

  // Translation function with nested key support and parameter replacement
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Dutch if translation not found
        value = translations.nl;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters in the string
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  // Update HTML lang and dir attributes when language changes
  useEffect(() => {
    document.documentElement.lang = language;
    // Set RTL for Arabic
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, poemLanguage, setPoemLanguage, t }}>
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

