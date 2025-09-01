"use client";
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { autoLoginTestUser, getCurrentUser, login, loginTelegram } from '../api/services/authService';
import { getTelegramPhotoUrl, getTelegramUser, initTelegramWebApp, isTelegramWebApp } from '../api/services/telegramService';
import type { User } from '../dto/user';

type AuthContextType = {
    user: User | null,
    loading: boolean,
    logout: () => void,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 1. Провайдер
export function AuthProvider({children} : {children: ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Инициализация Telegram Mini App
    useEffect(() => {
        if (isTelegramWebApp()) {
            initTelegramWebApp();
        }
    }, []);
    
    const fetchUser = async () => {
        const access_token = localStorage.getItem('access_token');
        
        if (access_token) {
            try {
                const currentUser = await getCurrentUser(access_token);
                setUser(currentUser);
            } catch (error) {
                console.error('Ошибка получения пользователя:', error);
                // Если токен недействителен, пробуем авторизоваться заново
                await autoLoginTestUser();
                const newToken = localStorage.getItem('access_token');
                if (newToken) {
                    try {
                        const currentUser = await getCurrentUser(newToken);
                        setUser(currentUser);
                    } catch (retryError) {
                        console.error('Ошибка повторной авторизации:', retryError);
                    }
                }
            }
        } else {
            // Проверяем Telegram Mini App или используем тестового пользователя
            const telegramUser = getTelegramUser();
            
            if (telegramUser) {
                // Авторизация через Telegram
                try {
                    console.log('🔐 Авторизация через Telegram Mini App');
                    console.log('👤 Telegram пользователь:', telegramUser);
                    
                    // Получаем фото пользователя из Telegram
                    const telegramPhotoUrl = getTelegramPhotoUrl();
                    
                    // Авторизация через Telegram API
                    const authData = getTelegramAuthData();
                    if (authData) {
                        const loginResult = await loginTelegram(authData.initData);
                        if (loginResult) {
                            localStorage.setItem('access_token', loginResult.access_token);
                            // Обогащаем данные пользователя Telegram информацией
                            const enrichedUser = {
                                ...loginResult.user,
                                telegramId: telegramUser.id,
                                firstName: telegramUser.first_name,
                                lastName: telegramUser.last_name,
                                username: telegramUser.username,
                                telegramPhotoUrl: telegramPhotoUrl,
                                photoUrl: loginResult.user.photoUrl || telegramPhotoUrl,
                                language: telegramUser.language_code || 'ru'
                            };
                            setUser(enrichedUser);
                        }
                    } else {
                        // Fallback на авторизацию по telegramId
                        const loginResult = await login(telegramUser.id.toString());
                        if (loginResult) {
                            localStorage.setItem('access_token', loginResult.access_token);
                            const enrichedUser = {
                                ...loginResult.user,
                                telegramId: telegramUser.id,
                                firstName: telegramUser.first_name,
                                lastName: telegramUser.last_name,
                                username: telegramUser.username,
                                telegramPhotoUrl: telegramPhotoUrl,
                                photoUrl: loginResult.user.photoUrl || telegramPhotoUrl,
                                language: telegramUser.language_code || 'ru'
                            };
                            setUser(enrichedUser);
                        }
                    }
                } catch (error) {
                    console.error('Ошибка Telegram авторизации:', error);
                    // Fallback на тестового пользователя
                    await tryTestUserLogin();
                }
            } else {
                // Тестирование вне Telegram
                await tryTestUserLogin();
            }
        }
        
        async function tryTestUserLogin() {
            try {
                console.log('🧪 Авторизация тестового пользователя (режим разработки)');
                const loginResult = await autoLoginTestUser();
                if (loginResult) {
                    setUser(loginResult.user);
                }
            } catch (error) {
                console.error('Ошибка автоматической авторизации:', error);
            }
        }
        
        setLoading(false);
    };
    
    const logout = () => {
        setUser(null);
        localStorage.removeItem('access_token');
    };
    
    // Загружаем при монтировании пользователя (один раз за сессию и передаем дальше как контекст)
    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{user, loading, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

// Хук для провайдера авторизации
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth should be used only within the range of AuthProvider")
    }
    return context;
}