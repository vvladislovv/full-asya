// Обработчик ошибок API
export interface ApiError {
    statusCode: number;
    message: string;
    errorCode?: string;
    timestamp: string;
    path: string;
    method: string;
}

export function handleApiError(error: any): string {
    if (error instanceof Error) {
        // Если это ошибка API с детальной информацией
        if (error.message.includes('API ERROR:')) {
            try {
                const errorText = error.message.split(': ')[2];
                const errorData: ApiError = JSON.parse(errorText);
                
                switch (errorData.errorCode) {
                    case 'DATABASE_ERROR':
                        return 'Ошибка базы данных. Попробуйте позже.';
                    case 'AUTH_ERROR':
                        return 'Ошибка авторизации. Войдите заново.';
                    case 'VALIDATION_ERROR':
                        return 'Ошибка валидации данных.';
                    case 'NOT_FOUND':
                        return 'Запрашиваемые данные не найдены.';
                    default:
                        return errorData.message || 'Произошла ошибка сервера.';
                }
            } catch (parseError) {
                return 'Ошибка обработки ответа сервера.';
            }
        }
        
        // Обычные ошибки сети
        if (error.message.includes('Failed to fetch')) {
            return 'Не удалось подключиться к серверу.';
        }
        
        if (error.message.includes('Load failed')) {
            return 'Ошибка загрузки данных.';
        }
        
        return error.message;
    }
    
    return 'Произошла неизвестная ошибка.';
}

export function logApiError(error: any, context: string = 'API') {
    console.error(`❌ ${context} Error:`, error);
    
    if (error instanceof Error && error.message.includes('API ERROR:')) {
        try {
            const errorText = error.message.split(': ')[2];
            const errorData: ApiError = JSON.parse(errorText);
            console.error('📊 Error Details:', {
                statusCode: errorData.statusCode,
                errorCode: errorData.errorCode,
                message: errorData.message,
                path: errorData.path,
                method: errorData.method,
                timestamp: errorData.timestamp
            });
        } catch (parseError) {
            console.error('⚠️ Could not parse error details');
        }
    }
}


