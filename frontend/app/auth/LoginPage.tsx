"use client";
import { useEffect, useState } from "react";
import { login } from "../api/services/authService";
import ExtensionCleanup from "../components/ExtensionCleanup";
import { LoginDto } from "../dto/user";
import { useLanguage } from "@/app/hooks/useLanguage";

export const LoginPage = () => {
    const { t } = useLanguage();
    const [telegramId, setTelegramId] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Авто-логин для Telegram Mini App
    useEffect(() => {
        const tryTelegramLogin = async () => {
            if (typeof window !== "undefined") {
                // Проверяем, открыт ли в Telegram Mini App
                const { getTelegramUserWithFallback, getAppMode, initTelegramWebApp } = await import("../telegram/telegram");
                
                // Инициализируем Telegram WebApp если доступен
                initTelegramWebApp();
                
                const appMode = getAppMode();
                const telegramUser = getTelegramUserWithFallback();
                
                if (appMode === 'telegram' && telegramUser) {
                    console.log('🔗 Обнаружен Telegram Mini App, попытка авто-логина');
                    setLoading(true);
                    setError("");
                    setSuccess(false);
                    
                    try {
                        // Используем telegramId для авторизации
                        const res: LoginDto = await login(telegramUser.id.toString());
                        setSuccess(true);
                        localStorage.setItem('access_token', res.access_token);
                        setTimeout(() => {
                            window.location.href = "/";
                        }, 1000);
                    } catch (error: unknown) {
                        console.warn('⚠️ Ошибка Telegram авторизации, показываем форму входа');
                        setError("");
                        setLoading(false);
                    }
                } else if (appMode === 'web' && telegramUser) {
                    console.log('🧪 Режим разработки, используем тестового пользователя');
                    // В режиме разработки можем сразу авторизоваться или показать форму
                    // Показываем форму для возможности тестирования разных пользователей
                }
            }
        };
        tryTelegramLogin();
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!telegramId.trim()) {
            setError(t('auth.enter_telegram_id'));
            return;
        }
        setLoading(true);
        setError("");
        setSuccess(false);
        login(telegramId.trim())
            .then((res : LoginDto) => {
                setSuccess(true);
                localStorage.setItem('access_token', res.access_token);
                setTimeout(() => {
                    window.location.href = "/"
                }, 1000);
            })
            .catch((error) => {
                setError(error.message || t('auth.error'));
            })
            .finally(() => setLoading(false))
    }
    return (
        <ExtensionCleanup>
            <div className="w-screen h-screen relative flex justify-center items-center bg-gradient-to-br from-green-50 via-lime-50 to-yellow-50" suppressHydrationWarning>
                {/* Декоративные элементы на фоне */}
                <div className="absolute top-20 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{backgroundColor: '#8DC63F'}} suppressHydrationWarning></div>
                <div className="absolute top-40 right-20 w-72 h-72 bg-lime-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000" suppressHydrationWarning></div>
                <div className="absolute -bottom-8 left-40 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" suppressHydrationWarning></div>
                
                <div className="relative w-full h-full md:w-[500px] md:h-auto md:bg-white/80 md:backdrop-blur-sm md:shadow-2xl md:border md:border-white/20 rounded-[30px] flex justify-center items-center p-8" suppressHydrationWarning>
                    <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col items-center gap-6 w-full max-w-sm" suppressHydrationWarning>
                        <div className="text-center mb-4" suppressHydrationWarning>
                            <h1 className="text-[32px] font-[700] bg-gradient-to-r from-black to-lime-600 bg-clip-text text-transparent mb-2" suppressHydrationWarning>
                                {t('auth.welcome')}
                            </h1>
                            <p className="text-gray-500 text-sm" suppressHydrationWarning>{t('auth.login_prompt')}</p>
                        </div>
                        
                        <div className="w-full space-y-4" suppressHydrationWarning>
                            <div className="relative group" suppressHydrationWarning>
                                <input 
                                    value={telegramId}
                                    onChange={(e) => setTelegramId(e.target.value)}
                                    className="w-full focus:outline-none bg-white/70 backdrop-blur-sm border border-gray-200 focus:border-[var(--green)] focus:ring-1 focus:ring-green-200 px-5 py-4 rounded-[20px] transition-all duration-300 placeholder-gray-400 shadow-sm hover:shadow-md"
                                    placeholder={t('auth.telegram_id')}
                                    type="text"
                                    suppressHydrationWarning
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full relative overflow-hidden cursor-pointer active:scale-[0.98] hover:scale-[1.02] transition-all duration-300 rounded-[25px] p-4 shadow-lg hover:shadow-xl group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{background: loading ? 'linear-gradient(to right, #1a2a0d, #333)' : 'linear-gradient(to right, #2f4215, black)'}}
                            suppressHydrationWarning
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" suppressHydrationWarning></div>
                            <span className="relative text-white font-[600] text-lg flex items-center justify-center gap-2" suppressHydrationWarning>
                                {loading && (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" suppressHydrationWarning></div>
                                )}
                                {loading ? t('auth.logging_in') : t('auth.login')}
                            </span>
                        </button>

                        <div className="w-full space-y-4" suppressHydrationWarning>
                            <div className="text-center" suppressHydrationWarning>
                                {success && <h3 className="text-[16px] font-[600] text-green-400" suppressHydrationWarning>{t('auth.success')}</h3>}
                                {error && <h3 className="text-[24px] font-[600] text-red-400" suppressHydrationWarning>{error}</h3>}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </ExtensionCleanup>
    )
}
