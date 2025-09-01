import { Test } from "@/app/dto/test";
import { apiFetch } from "../api";

// Типы для статистики пользователя
export interface UserStatsResponse {
    totalTests: number;
    completedTests: number;
    averageScore: number;
    lastTestDate: string | null;
    riskLevel: 'low' | 'medium' | 'high' | null;
}

// Типы для истории тестов
export interface TestHistoryItem {
    id: string;
    createdAt: string;
    completedAt?: string;
    testType: string;
    test?: {
        name: string;
        type: string;
        maxScore?: number;
    };
    score: number;
    maxScore?: number;
    percentage?: number;
    isCompleted: boolean;
    resultLevel?: 'low' | 'medium' | 'high';
}

export async function getTests() : Promise<Test[]> {
    try {
        const response = await apiFetch<Test[] | Record<string, Test>>("/tests", {
            method: 'GET'
        });
        
        // Backend возвращает объект, а не массив, поэтому преобразуем
        if (response && typeof response === 'object' && !Array.isArray(response)) {
            const testsArray = Object.values(response);
            console.log('✅ Получены тесты с backend (объект):', testsArray.length);
            return testsArray;
        }
        
        // Если это уже массив
        if (Array.isArray(response)) {
            console.log('✅ Получены тесты с backend (массив):', response.length);
            return response;
        }
        
        // Если backend вернул пустой объект, возвращаем пустой массив
        if (response && typeof response === 'object' && Object.keys(response).length === 0) {
            console.log('✅ Backend вернул пустые тесты');
            return [];
        }
        
        console.warn('⚠️ Неожиданный формат ответа от backend:', response);
        return [];
    } catch (error) {
        console.error('❌ Ошибка загрузки тестов с backend:', error);
        // При ошибке возвращаем пустой массив
        return [];
    }
}
export async function getTestByType(type: string) : Promise<Test> {
    return await apiFetch<Test>(`/tests/type/${type}`, {
        method: 'GET'
    })
}

// Получение истории тестов пользователя
export async function getUserHistory(params?: { limit?: number; offset?: number }): Promise<TestHistoryItem[]> {
    try {
        // Получаем историю с backend
        const query = new URLSearchParams();
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.offset) query.append('offset', params.offset.toString());
        
        const response = await apiFetch<TestHistoryItem[]>(`/history?${query.toString()}`, {
            method: 'GET'
        });
        
        console.log('📋 История с backend:', response);
        
        // Если backend вернул пустой объект или массив, возвращаем пустой массив
        if (!response || (Array.isArray(response) && response.length === 0) || (typeof response === 'object' && Object.keys(response).length === 0)) {
            console.log('✅ Backend вернул пустую историю, очищаем локальные данные');
            // Очищаем локальные данные, так как backend пустой
            if (typeof window !== 'undefined') {
                localStorage.removeItem('test_results');
                localStorage.removeItem('user_stats');
            }
            return [];
        }
        
        if (Array.isArray(response) && response.length > 0) {
            console.log('✅ Получено', response.length, 'результатов из БД');
            return response;
        }
        
        // Если response - объект с данными, преобразуем в массив
        if (typeof response === 'object' && response !== null) {
            const resultsArray = Object.values(response);
            if (resultsArray.length > 0) {
                console.log('✅ Получено', resultsArray.length, 'результатов из БД (объект)');
                return resultsArray;
            }
        }
        
        return [];
    } catch (error) {
        console.warn('Ошибка загрузки истории с backend:', error);
        // При ошибке не используем локальные данные, возвращаем пустой массив
        return [];
    }
}

// Получение статистики пользователя
export async function getUserStats(): Promise<UserStatsResponse> {
    try {
        // Получаем статистику с backend - используем query parameter period=all для получения всех данных
        const response = await apiFetch<any>('/history/stats?period=all', {
            method: 'GET'
        });
        
        console.log('📊 Статистика с backend:', response);
        
        if (response) {
            // Преобразуем в нужный формат
            const stats: UserStatsResponse = {
                totalTests: 8, // Всегда 8 тестов в системе
                completedTests: response.totalTests || response.completedTests || 0,
                averageScore: Math.round(response.averageScore || 0),
                lastTestDate: response.lastTestDate,
                riskLevel: response.riskLevel || 'low'
            };
            
            console.log('✅ Получена статистика с backend:', stats);
            return stats;
        }
    } catch (error) {
        console.warn('Ошибка загрузки статистики с backend:', error);
        console.error('Детали ошибки:', error);
    }
    
    // Если backend не работает или нет данных, возвращаем пустую статистику
    // и очищаем локальные данные
    if (typeof window !== 'undefined') {
        localStorage.removeItem('test_results');
        localStorage.removeItem('user_stats');
    }
    
    return {
        totalTests: 8, // Всего 8 тестов в системе
        completedTests: 0,
        averageScore: 0,
        lastTestDate: null,
        riskLevel: 'low'
    };
}

// Получение истории по типу теста
export async function getTestTypeHistory(testType: string) {
    return await apiFetch(`/history/test-type/${testType}`, {
        method: 'GET'
    });
}

// Получение прогресса по тесту
export async function getTestProgress(testType: string, days: number = 30) {
    return await apiFetch(`/history/progress/${testType}?days=${days}`, {
        method: 'GET'
    });
}

// Начать тест
export async function startTest(testId: string) {
    try {
        console.log('🎯 Начинаем тест с ID:', testId);
        const result = await apiFetch('/tests/start', {
            method: 'POST',
            body: JSON.stringify({ testId })
        });
        console.log('✅ Тест начат, получен результат:', result);
        return result;
    } catch (error) {
        console.error('❌ Ошибка начала теста:', error);
        // При ошибке backend НЕ создаем локальные fallback данные
        // чтобы избежать проблем с синхронизацией
        throw new Error(`Не удалось начать тест: ${error}`);
    }
}

// Отправить результат теста
export async function submitTestResult(data: {
    resultId: string;
    answers: Record<string, any>;
    timeSpent: number;
    maxScore?: number;
    emotionalState?: Record<string, any>;
}) {
    console.log('📤 Отправка результата теста:', data);
    
    // Правильно рассчитываем процент и scores
    const correctAnswers = data.answers.correct || 0;
    const totalAnswers = data.answers.total || data.maxScore || 1;
    const percentage = Math.round((correctAnswers / totalAnswers) * 100);
    
    // Определяем уровень результата
    let resultLevel: 'high' | 'medium' | 'low' = 'medium';
    if (percentage >= 75) resultLevel = 'high';
    else if (percentage >= 50) resultLevel = 'medium';
    else resultLevel = 'low';

    // Пытаемся отправить на backend СНАЧАЛА
    try {
        const backendResult = await apiFetch('/tests/submit', {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                answers: {
                    ...data.answers,
                    correct: correctAnswers,
                    total: totalAnswers
                }
            })
        });
        
        console.log('✅ Результат отправлен на backend:', backendResult);
        
        // Если backend успешно принял результат, НЕ сохраняем локально
        // Backend является основным источником данных
        console.log('✅ Результат отправлен на backend, локальное сохранение отключено');
        
        return backendResult;
    } catch (error) {
        console.warn('⚠️ Не удалось отправить результат на backend:', error);
        
        // При ошибке backend НЕ сохраняем локально, чтобы избежать дублирования
        // данных и проблем с синхронизацией
        console.log('❌ Локальное сохранение отключено для избежания дублирования данных');
        
        // Возвращаем ошибку
        throw new Error(`Не удалось отправить результат на backend: ${error}`);
    }
}

// Обновление локальной статистики
function updateLocalStats() {
    if (typeof window === 'undefined') return;
    
    try {
        const localResults = JSON.parse(localStorage.getItem('test_results') || '[]');
        const completedTests = localResults.filter((r: any) => r.isCompleted);
        
        if (completedTests.length > 0) {
            const totalScore = completedTests.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0);
            const averageScore = Math.round(totalScore / completedTests.length);
            
            const stats = {
                totalTests: completedTests.length,
                averageScore: averageScore,
                lastTestDate: completedTests[0].completedAt,
                lastUpdate: new Date().toISOString()
            };
            
            localStorage.setItem('user_stats', JSON.stringify(stats));
            console.log('📊 Локальная статистика обновлена:', stats);
        }
    } catch (error) {
        console.error('❌ Ошибка обновления локальной статистики:', error);
    }
}