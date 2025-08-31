// Авторизация через Telegram Mini App
export async function loginTelegram(telegramInitData: string) {
    return await apiFetch<LoginDto>('/auth/telegram', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ telegramInitData })
    });
}
import { LoginDto, User } from "@/app/dto/user";
import { apiFetch } from "../api";

export async function getCurrentUser(access_token : string) {
    return await apiFetch<User | null>('/auth/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`
        },
        credentials: 'include'
    });
};

export async function login(telegramId : string) {
    return await apiFetch<LoginDto>('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({telegramId})
    })
};

export async function refresh(userId : string) {
    return await apiFetch<string>('/auth/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({userId})
    }) 
};

// Автоматическая авторизация тестового пользователя для разработки
export async function autoLoginTestUser() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ telegramId: '123456789' })
        });
        
        if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
        }
        
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        return data;
    } catch (error) {
        console.error('Auto login failed:', error);
        return null;
    }
}

// Обновление языка пользователя
export async function updateUserLanguage(userId: string, language: 'ru' | 'en') {
    return await apiFetch(`/users/${userId}/language`, {
        method: 'PATCH',
        body: JSON.stringify({ language })
    });
} 