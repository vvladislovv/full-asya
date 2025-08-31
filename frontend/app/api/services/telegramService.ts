// Сервис для работы с Telegram данными
export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    language_code?: string;
}

export interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
        user?: TelegramUser;
        chat?: {
            id: number;
            type: string;
        };
        start_param?: string;
    };
    ready(): void;
    expand(): void;
    close(): void;
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isActive: boolean;
        show(): void;
        hide(): void;
        enable(): void;
        disable(): void;
        onClick(callback: () => void): void;
    };
}

// Получение данных Telegram Mini App
export function getTelegramData(): TelegramWebApp | null {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        return (window as any).Telegram.WebApp;
    }
    return null;
}

// Получение пользователя Telegram
export function getTelegramUser(): TelegramUser | null {
    const webApp = getTelegramData();
    return webApp?.initDataUnsafe?.user || null;
}

// Проверка, запущено ли приложение в Telegram
export function isTelegramWebApp(): boolean {
    return getTelegramData() !== null;
}

// Получение языка пользователя Telegram
export function getTelegramLanguage(): string {
    const user = getTelegramUser();
    return user?.language_code || 'ru';
}

// Получение аватара пользователя Telegram
export function getTelegramPhotoUrl(): string | null {
    const user = getTelegramUser();
    return user?.photo_url || null;
}

// Инициализация Telegram Mini App
export function initTelegramWebApp(): void {
    const webApp = getTelegramData();
    if (webApp) {
        webApp.ready();
        console.log('🚀 Telegram Mini App инициализирован');
    }
}

// Подготовка данных для авторизации через Telegram
export function getTelegramAuthData(): { initData: string; user: TelegramUser } | null {
    const webApp = getTelegramData();
    if (webApp?.initData && webApp.initDataUnsafe?.user) {
        return {
            initData: webApp.initData,
            user: webApp.initDataUnsafe.user
        };
    }
    return null;
}

