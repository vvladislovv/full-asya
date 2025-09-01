"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { useLanguage } from "@/app/hooks/useLanguage";
import { useAuth } from "../providers/useAuth";

const SettingsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const { t, language, setLanguage, isLoading } = useLanguage();
    


    const handleLogout = () => {
        logout();
        // Перенаправляем на главную страницу после выхода
        window.location.href = '/';
    };



    return (
        <div className="bg-[#F2F5F9] w-screen h-screen px-4 py-6 flex flex-col gap-3">
            {/* Заголовок */}
            <div className="relative flex items-center">
                <Link 
                    href="/profile"
                    className="hover:cursor-pointer active:scale-[0.95] transition-all duration-300 w-[48px] h-[48px] rounded-full bg-[white] flex justify-center items-center"
                    style={{zIndex: 1}}
                >
                    <Image src="/icons/back.svg" alt={t('common.back')} width={10} height={14} style={{ width: 'auto', height: 'auto' }} />
                </Link>
                <div
                    className="pointer-events-none absolute left-0 right-0 text-[20px] text-center font-[600] flex items-center justify-center gap-2"
                    style={{zIndex: 0}}
                >
                    <Image src="/icons/user-settings.svg" alt="Settings" width="20" height="20" style={{ width: 'auto', height: 'auto' }} />
                    {t('settings.title')}
                </div>

            </div>

            {/* Основной контент */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Профиль пользователя */}
                <div className="bg-white rounded-[16px] p-4">
                    <h3 className="font-[600] text-[16px] text-gray-800 mb-3">{t('settings.profile_info')}</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative w-[60px] h-[60px] rounded-full border-2 border-[#8DC63F]">
                            {user?.telegramPhotoUrl ? (
                                <Image 
                                    src={user.telegramPhotoUrl} 
                                    alt="Avatar" 
                                    className="object-cover rounded-full" 
                                    fill
                                />
                            ) : (
                                <Image 
                                    src="/images/avatar.png" 
                                    alt="Avatar" 
                                    className="object-cover rounded-full" 
                                    fill
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-[600] text-[16px] text-gray-800">
                                {user?.firstName && user?.lastName 
                                    ? `${user.firstName} ${user.lastName}`
                                    : user?.firstName || user?.username || t('common.user')
                                }
                            </h3>
                            <p className="text-[14px] text-gray-700">
                                {user?.telegramId ? `Telegram ID: ${user.telegramId}` : 'Telegram не подключен'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Настройки языка */}
                <div className="bg-white rounded-[16px] p-4">
                    <h3 className="font-[600] text-[16px] text-gray-800 mb-3">{t('settings.language_settings')}</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] text-gray-700">{t('profile.language')}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setLanguage('ru')}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    language === 'ru' 
                                        ? 'bg-[#8DC63F] text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                🇷🇺 RU
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    language === 'en' 
                                        ? 'bg-[#8DC63F] text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                🇺🇸 EN
                            </button>
                        </div>
                    </div>
                </div>

                {/* Кнопка выхода */}
                <div>
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-red-500 hover:bg-red-600 hover:shadow-lg active:scale-[0.98] active:shadow-sm transition-all duration-200 text-white font-[600] py-4 px-6 rounded-[16px] flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-red-300"
                    >
                        <span className="text-lg">🚪</span>
                        {t('settings.logout')}
                    </button>
                </div>




            </div>
        </div>
    );
};

export default SettingsPage;
