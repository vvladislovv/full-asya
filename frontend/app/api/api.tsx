import { API_URL } from "@/settings";

// Автоматическая авторизация тестового пользователя
async function ensureAuthenticated(): Promise<string | null> {
    let access_token = localStorage.getItem('access_token');
    
    // Если токена нет, попробуем авторизоваться
    if (!access_token) {
        console.log('🔑 Токен отсутствует, выполняем автоматическую авторизацию...');
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ telegramId: '123456789' })
            });
            
            if (response.ok) {
                const data = await response.json();
                access_token = data.access_token;
                localStorage.setItem('access_token', access_token);
                console.log('✅ Автоматическая авторизация успешна');
            }
        } catch (error) {
            console.error('❌ Ошибка автоматической авторизации:', error);
        }
    }
    
    return access_token;
}

export async function apiFetch<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const access_token = await ensureAuthenticated();
    
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(access_token && { "Authorization": `Bearer ${access_token}` }),
            "Content-Type": "application/json",
            ...(options?.headers || {})
        },
    });
    
    // Если получили 401, попробуем переавторизоваться один раз
    if (res.status === 401 && access_token) {
        console.log('🔄 Токен недействителен, повторная авторизация...');
        localStorage.removeItem('access_token');
        const newToken = await ensureAuthenticated();
        
        if (newToken) {
            const retryRes = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: {
                    "Authorization": `Bearer ${newToken}`,
                    "Content-Type": "application/json",
                    ...(options?.headers || {})
                },
            });
            
            if (!retryRes.ok) {
                const errorText = await retryRes.text();
                throw new Error(`API ERROR: ${retryRes.status}: ${errorText}`)
            }
            return retryRes.json() as Promise<T>;
        }
    }
    
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API ERROR: ${res.status}: ${errorText}`)
    }
    return res.json() as Promise<T>;
}