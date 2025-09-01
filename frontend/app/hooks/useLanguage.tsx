"use client";
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { updateUserLanguage } from '../api/services/authService';
import { useAuth } from '../providers/useAuth';

type Language = 'ru' | 'en';

interface Translations {
  [key: string]: any;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('ru');
  const [isLoading, setIsLoading] = useState(false);
  const [translations, setTranslations] = useState<Translations>({});

  // Загрузка переводов из JSON файлов
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const [ruTranslations, enTranslations] = await Promise.all([
          import('../i18n/locales/ru.json'),
          import('../i18n/locales/en.json')
        ]);
        
        setTranslations({
          ru: ruTranslations.default,
          en: enTranslations.default
        });
      } catch (error) {
        console.error('Ошибка загрузки переводов:', error);
        // Fallback на базовые переводы
        setTranslations({
          ru: {},
          en: {}
        });
      }
    };

    loadTranslations();
  }, []);

  // Автоматическое определение языка из базы данных пользователя
  useEffect(() => {
    // Используем язык из профиля пользователя, если он есть
    if (user?.language) {
      setLanguageState(user.language as Language);
      console.log(`🌍 Язык установлен из БД: ${user.language}`);
      return;
    }
    
    // Если пользователь не авторизован или язык не установлен, используем русский по умолчанию
    setLanguageState('ru'); 
    console.log(`🌍 Язык установлен по умолчанию: ru`);
  }, [user]);

  const setLanguage = async (newLanguage: Language) => {
    if (newLanguage === language) return;
    
    setIsLoading(true);
    try {
      setLanguageState(newLanguage);
      
      // Сохраняем язык на сервере, если пользователь авторизован
      if (user?.id) {
        await updateUserLanguage(user.id, newLanguage);
        console.log(`🌍 Язык сохранен в БД: ${newLanguage}`);
      }
      
      console.log(`🌍 Язык изменен на: ${newLanguage}`);
    } catch (error) {
      console.error('Ошибка смены языка:', error);
      // Откатываем изменения при ошибке
      setLanguageState(language);
    } finally {
      setIsLoading(false);
    }
  };

  const t = (key: string, fallback?: string): string => {
    if (!translations[language]) {
      return fallback || key;
    }

    // Поддержка вложенных ключей (например: "profile.title")
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value[k] !== undefined) {
        value = value[k];
      } else {
        // Если перевод не найден, пробуем другой язык
        const otherLang = language === 'ru' ? 'en' : 'ru';
        if (translations[otherLang]) {
          let otherValue = translations[otherLang];
          for (const otherK of keys) {
            if (otherValue && typeof otherValue === 'object' && otherValue[otherK] !== undefined) {
              otherValue = otherValue[otherK];
            } else {
              otherValue = undefined;
              break;
            }
          }
          if (otherValue) {
            return otherValue;
          }
        }
        
        // Если перевод не найден ни в одном языке, возвращаем fallback или ключ
        if (fallback) return fallback;
        
        console.warn(`⚠️ Перевод не найден для ключа: ${key}`);
        return key;
      }
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage должен использоваться внутри LanguageProvider');
  }
  return context;
}