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
        
        console.warn('⚠️ Неожиданный формат ответа от backend:', response);
        return [];
    } catch (error) {
        console.error('❌ Ошибка загрузки тестов с backend:', error);
        throw error;
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
        
        if (Array.isArray(response) && response.length > 0) {
            console.log('✅ Получено', response.length, 'результатов из БД');
            return response;
        }
    } catch (error) {
        console.warn('Ошибка загрузки истории с backend, используем локальные данные:', error);
    }
    
    // Если backend не работает или нет данных, используем локальные
    if (typeof window !== 'undefined') {
        const localResults = JSON.parse(localStorage.getItem('test_results') || '[]');
        const { limit = 50, offset = 0 } = params || {};
        console.log('📱 Используем локальные данные:', localResults.length, 'результатов');
        return localResults.slice(offset, offset + limit);
    }
    
    return [];
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
        console.warn('Ошибка загрузки статистики с backend, используем локальные данные:', error);
        console.error('Детали ошибки:', error);
    }
    
    // Если backend не работает или нет данных, используем локальные
    if (typeof window !== 'undefined') {
        const localResults = JSON.parse(localStorage.getItem('test_results') || '[]');
        const completedTests = localResults.filter((r: any) => r.isCompleted);
        const totalTests = completedTests.length;
        
        if (totalTests > 0) {
            // Правильно рассчитываем средний балл как среднее от процентов
            const totalPercentage = completedTests.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0);
            const averageScore = Math.round(totalPercentage / totalTests);
            
            const lastTestDate = completedTests[0].completedAt;
            
            console.log('📊 Локальная статистика:', {
                totalTests: 8,
                completedTests: totalTests,
                averageScore,
                lastTestDate,
                totalPercentage
            });
            
            return {
                totalTests: 8, // Всего 8 тестов в системе
                completedTests: totalTests,
                averageScore,
                lastTestDate,
                riskLevel: 'low'
            };
        }
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
        // Создаем локальный результат как fallback
        const fallbackResult = {
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: 'local_user',
            testId: testId,
            isCompleted: false,
            createdAt: new Date().toISOString()
        };
        console.log('📱 Создан локальный fallback результат:', fallbackResult);
        return fallbackResult;
    }
}

// Отправить результат теста
export async function submitTestResult(data: {
    resultId: string;
    answers: Record<string, any>;
    timeSpent: number;
    maxScore?: number;
    emotionalState?: Record<string, any>;
    testType?: string;
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
        
        // Если backend успешно принял результат, сохраняем локально для синхронизации
        if (typeof window !== 'undefined') {
            const localResults = JSON.parse(localStorage.getItem('test_results') || '[]');
            
            const newResult = {
                id: data.resultId,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                testType: data.testType || 'UNKNOWN',
                score: correctAnswers,
                maxScore: totalAnswers,
                percentage: percentage,
                isCompleted: true,
                resultLevel: resultLevel,
                timeSpent: data.timeSpent,
                details: data.answers
            };
            
            localResults.unshift(newResult);
            localStorage.setItem('test_results', JSON.stringify(localResults));
            console.log('✅ Результат синхронизирован локально:', newResult);
            
            // Обновляем общую статистику
            updateLocalStats();
        }
        
        return backendResult;
    } catch (error) {
        console.warn('⚠️ Не удалось отправить результат на backend, сохраняем локально:', error);
        
        // ВСЕГДА сохраняем результат локально для отображения в истории
        if (typeof window !== 'undefined') {
            const localResults = JSON.parse(localStorage.getItem('test_results') || '[]');
            
            const newResult = {
                id: data.resultId,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                testType: data.testType || 'UNKNOWN',
                score: correctAnswers,
                maxScore: totalAnswers,
                percentage: percentage,
                isCompleted: true,
                resultLevel: resultLevel,
                timeSpent: data.timeSpent,
                details: data.answers
            };
            
            localResults.unshift(newResult);
            localStorage.setItem('test_results', JSON.stringify(localResults));
            console.log('✅ Результат сохранен локально (fallback):', newResult);
            
            // Обновляем общую статистику
            updateLocalStats();
        }
        
        // Возвращаем локальный результат
        return { id: data.resultId, success: true, local: true };
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