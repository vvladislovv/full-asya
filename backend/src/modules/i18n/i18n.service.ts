import { Injectable, Logger } from '@nestjs/common';
import { Language } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);
  private translations: Record<Language, Record<string, any>> = {
    [Language.ru]: {},
    [Language.en]: {}
  };

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    try {
      const localesDir = path.join(__dirname, 'locales');
      
      // Load Russian translations
      const ruPath = path.join(localesDir, 'ru.json');
      if (fs.existsSync(ruPath)) {
        const ruTranslations = JSON.parse(fs.readFileSync(ruPath, 'utf8'));
        this.translations[Language.ru] = ruTranslations;
        this.logger.log('✅ Russian translations loaded');
      } else {
        this.logger.warn('⚠️ ru.json file not found, using fallback translations');
        this.translations[Language.ru] = this.getFallbackTranslations('ru');
      }

      // Load English translations
      const enPath = path.join(localesDir, 'en.json');
      if (fs.existsSync(enPath)) {
        const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
        this.translations[Language.en] = enTranslations;
        this.logger.log('✅ English translations loaded');
      } else {
        this.logger.warn('⚠️ en.json file not found, using fallback translations');
        this.translations[Language.en] = this.getFallbackTranslations('en');
      }

      this.logger.log(`🌍 I18n initialization completed. Available languages: ${Object.keys(this.translations).join(', ')}`);
    } catch (error) {
      this.logger.error('❌ Error loading translations:', error);
      // Use fallback translations
      this.translations = {
        [Language.ru]: this.getFallbackTranslations('ru'),
        [Language.en]: this.getFallbackTranslations('en')
      };
    }
  }

  private getFallbackTranslations(lang: string): Record<string, any> {
    const fallbackTranslations = {
      ru: {
        common: { 
          success: 'Успешно', 
          error: 'Ошибка',
          loading: 'Загрузка...',
          notFound: 'Не найдено'
        },
        tests: { 
          types: { 
            VISUAL_MEMORY: 'Визуальная память',
            VERBAL_MEMORY: 'Вербальная память',
            AUDITORY_MEMORY: 'Рече-слуховая память',
            DIGIT_SPAN: 'Объём цифр',
            VISUAL_ATTENTION: 'Зрительное внимание',
            STROOP_TEST: 'Тест Струпа',
            ARITHMETIC: 'Арифметика',
            SYMBOL_MEMORY: 'Символьная память'
          }
        }
      },
      en: {
        common: { 
          success: 'Success', 
          error: 'Error',
          loading: 'Loading...',
          notFound: 'Not Found'
        },
        tests: { 
          types: { 
            VISUAL_MEMORY: 'Visual Memory',
            VERBAL_MEMORY: 'Verbal Memory',
            AUDITORY_MEMORY: 'Auditory Memory',
            DIGIT_SPAN: 'Digit Span',
            VISUAL_ATTENTION: 'Visual Attention',
            STROOP_TEST: 'Stroop Test',
            ARITHMETIC: 'Arithmetic',
            SYMBOL_MEMORY: 'Symbol Memory'
          }
        }
      }
    };
    
    return fallbackTranslations[lang] || fallbackTranslations['ru'];
  }

  translate(key: string, language: Language = Language.ru, params?: Record<string, any>): string {
    const keys = key.split('.');
    let translation: any = this.translations[language];

    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to Russian if translation not found
        translation = this.translations[Language.ru];
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }

    if (typeof translation === 'string') {
      // Replace parameters in translation
      if (params) {
        return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey] || match;
        });
      }
      return translation;
    }

    return key;
  }

  translateObject(obj: Record<string, any>, language: Language = Language.ru): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.startsWith('i18n:')) {
        // Translate if value starts with 'i18n:'
        const translationKey = value.substring(5);
        result[key] = this.translate(translationKey, language);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.translateObject(value, language);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  getAvailableLanguages(): Language[] {
    return Object.keys(this.translations) as Language[];
  }

  getTranslations(language: Language): Record<string, any> {
    return this.translations[language] || this.translations[Language.ru];
  }

  addTranslation(language: Language, key: string, value: string): void {
    if (!this.translations[language]) {
      this.translations[language] = {};
    }

    const keys = key.split('.');
    let current = this.translations[language];

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
  }

  // Specific methods for different modules

  getDementiaRecommendations(riskLevel: string, language: Language): string {
    return this.translate(`dementia.recommendations.${riskLevel}`, language);
  }

  getEmotionalRecommendation(state: string, language: Language): string {
    return this.translate(`emotional.recommendations.${state}`, language);
  }

  getTestTypeName(testType: string, language: Language): string {
    return this.translate(`test_types.${testType}`, language);
  }

  getTestStageName(stage: string, language: Language): string {
    return this.translate(`tests.stages.${stage}`, language);
  }

  getTestLevelName(level: string, language: Language): string {
    return this.translate(`results.${level}`, language);
  }
}