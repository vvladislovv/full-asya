// Локальные определения типов для Telegram
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    [key: string]: unknown;
  };
  ready(): void;
  expand(): void;
  enableClosingConfirmation(): void;
  colorScheme: 'light' | 'dark';
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  BackButton?: {
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Определяет, открыт ли сайт в Telegram Mini App
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  const wa = window.Telegram?.WebApp;
  // В реальном Mini App у объекта есть непустой initData / initDataUnsafe.user
  return !!(wa && (wa.initData && wa.initData.length > 0 || wa.initDataUnsafe?.user));
}

// Для тестирования вне Telegram - проверяем наличие Telegram WebApp
export function isTelegramAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.Telegram?.WebApp);
}

// Определяет режим работы: Telegram Mini App или обычный веб
export function getAppMode(): 'telegram' | 'web' {
  if (isTelegramWebApp()) return 'telegram';
  return 'web';
}

// Получает user info из Telegram WebApp
export function getTelegramUser(): TelegramUser | null {
  if (isTelegramWebApp()) {
    return window.Telegram?.WebApp.initDataUnsafe?.user || null;
  }
  return null;
}

// Получает initData (для подписи)
export function getTelegramInitData(): string {
  if (isTelegramWebApp()) {
    return window.Telegram?.WebApp.initData || '';
  }
  return '';
}

// Пример функции для автоматического логина через Telegram
export async function telegramAutoLogin(apiLogin: (data: { telegramInitData: string }) => Promise<unknown>): Promise<unknown | null> {
  const user = getTelegramUser();
  const initData = getTelegramInitData();
  if (user && initData) {
    // Обычно backend принимает initData и возвращает JWT
    return apiLogin({ telegramInitData: initData });
  }
  return null;
}

// Инициализация Telegram WebApp с проверкой доступности
export function initTelegramWebApp(): void {
  if (typeof window === 'undefined') return;
  
  const tg = window.Telegram?.WebApp;
  if (tg) {
    console.log('🔗 Telegram WebApp обнаружен, инициализация...');
    
    try {
      tg.ready();
      tg.expand();
      
      // Настройка темы
      if (tg.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      
      // Настройка цветов под наш дизайн
      tg.setHeaderColor('#E8ECF5');
      tg.setBackgroundColor('#E8ECF5');
      
      console.log('✅ Telegram WebApp инициализирован');
      console.log('👤 Пользователь:', tg.initDataUnsafe?.user);
      console.log('💬 Чат:', tg.initDataUnsafe?.chat);
      console.log('🎨 Тема:', tg.colorScheme);
    } catch (error) {
      console.warn('⚠️ Ошибка инициализации Telegram WebApp:', error);
    }
  } else {
    console.log('🌐 Работаем в обычном веб-режиме (не Telegram Mini App)');
  }
}

// Создание тестового пользователя для разработки вне Telegram
export function createTestTelegramUser(): TelegramUser {
  return {
    id: 123456789,
    first_name: 'Test',
    last_name: 'User',
    username: 'test_user',
    language_code: 'en'
  };
}

// Получение пользователя с fallback для тестирования
export function getTelegramUserWithFallback(): TelegramUser | null {
  const realUser = getTelegramUser();
  if (realUser) {
    return realUser;
  }
  
  // Для тестирования вне Telegram возвращаем тестового пользователя
  if (getAppMode() === 'web') {
    console.log('🧪 Используем тестового пользователя для разработки');
    return createTestTelegramUser();
  }
  
  return null;
} 