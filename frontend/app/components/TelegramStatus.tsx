"use client";
import { isTelegramWebApp } from "../api/services/telegramService";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useAuth } from "../providers/useAuth";

interface TelegramStatusProps {
    className?: string;
}

export default function TelegramStatus({ className = "" }: TelegramStatusProps) {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isTelegram = isTelegramWebApp();

    if (!isTelegram) {
        return null; // Не показываем компонент вне Telegram
    }

    return (
        <div className={`flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-blue-700 font-medium">
                {user?.telegramId 
                    ? t('profile.telegram_connected') 
                    : t('profile.telegram_not_connected')
                }
            </span>
            {user?.telegramId && (
                <span className="text-xs text-blue-600">
                    ID: {user.telegramId}
                </span>
            )}
        </div>
    );
}

