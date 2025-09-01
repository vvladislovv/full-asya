"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../providers/useAuth";

// Интерфейс для результата теста
interface TestResult {
    id: string;
    testType: string;
    score: number;
    maxScore: number;
    percentage: number;
    resultLevel: 'high' | 'medium' | 'low';
    completedAt: string;
    test?: {
        name: string;
        type: string;
        difficulty: string;
    };
}

// Функция для получения истории тестов напрямую
async function fetchTestHistory(): Promise<TestResult[]> {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.warn('Нет токена авторизации');
            return [];
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/history?limit=100`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Ошибка API:', response.status, response.statusText);
            return [];
        }

        const data = await response.json();
        console.log('📋 Данные API истории:', data);

        // Обрабатываем разные форматы ответа
        let results: any[] = [];
        
        if (Array.isArray(data)) {
            results = data;
        } else if (data && typeof data === 'object') {
            // Если это объект с числовыми ключами, преобразуем в массив
            results = Object.values(data);
        }

        console.log(`✅ Обработано ${results.length} результатов`);

        // Преобразуем к нужному формату
        return results.map((item: any) => ({
            id: item.id,
            testType: item.testType,
            score: item.score || 0,
            maxScore: item.maxScore || 10,
            percentage: item.percentage || 0,
            resultLevel: item.resultLevel || 'medium',
            completedAt: item.completedAt || item.createdAt,
            test: item.test
        })).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    } catch (error) {
        console.error('❌ Ошибка загрузки истории:', error);
        return [];
    }
}

// Названия тестов на русском
const getTestName = (testType: string, testObj?: any): string => {
    if (testObj?.name) return testObj.name;
    
    const names: Record<string, string> = {
        'VISUAL_MEMORY': 'Визуальная память',
        'VERBAL_MEMORY': 'Вербальная память', 
        'AUDITORY_MEMORY': 'Рече-слуховая память',
        'DIGIT_SPAN': 'Объём цифр',
        'VISUAL_ATTENTION': 'Зрительное внимание',
        'STROOP_TEST': 'Тест Струпа',
        'ARITHMETIC': 'Счётные операции',
        'SYMBOL_MEMORY': 'Символьная память'
    };
    return names[testType] || testType;
};

// Функция форматирования даты
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Дата недоступна';
    }
};

// Цвет для уровня результата
const getResultColor = (level: string): string => {
    switch (level) {
        case 'high': return '#8DC63F';
        case 'medium': return '#FDB933';
        case 'low': return '#D9452B';
        default: return '#8DC63F';
    }
};

// Текст для уровня результата
const getResultText = (level: string, percentage: number): string => {
    const percent = Math.round(percentage);
    switch (level) {
        case 'high': return `${percent}% - Высокий`;
        case 'medium': return `${percent}% - Средний`;
        case 'low': return `${percent}% - Низкий`;
        default: return `${percent}%`;
    }
};

const History: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [historyData, setHistoryData] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка истории
    useEffect(() => {
        const loadHistory = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log('🔄 Загружаем историю тестов...');
                const results = await fetchTestHistory();
                
                console.log(`📊 Загружено результатов: ${results.length}`);
                setHistoryData(results);
                
            } catch (error) {
                console.error('❌ Ошибка загрузки истории:', error);
                setError('Не удалось загрузить историю тестов');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadHistory();
        } else {
            setLoading(false);
            setError('Необходимо авторизоваться для просмотра истории');
        }
    }, [user]);

    if (loading) {
        return (
            <div className="bg-[#F2F5F9] w-screen h-screen px-4 py-6 flex flex-col gap-3">
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DC63F]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F2F5F9] w-screen h-screen px-4 py-6 flex flex-col gap-3">
            {/* Заголовок */}
            <div className="relative flex items-center">
                <Link 
                    href="/"
                    className="hover:cursor-pointer active:scale-[0.95] transition-all duration-300 w-[48px] h-[48px] rounded-full bg-[white] flex justify-center items-center"
                    style={{zIndex: 1}}
                >
                    <Image src="/icons/back.svg" alt="Назад" width={10} height={14} style={{ width: 'auto', height: 'auto' }} />
                </Link>
                <div
                    className="pointer-events-none absolute left-0 right-0 text-[20px] text-center font-[600]"
                    style={{zIndex: 0}}
                >
                    История тестов
                </div>
            </div>

            {/* Ошибка */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <span>⚠️</span>
                        <p className="text-[14px]">{error}</p>
                    </div>
                </div>
            )}

            {/* Статистика */}
            {historyData.length > 0 && (
                <div className="bg-white rounded-[12px] p-4 mb-4">
                    <h3 className="font-[600] text-[16px] text-[#1E1E1E] mb-3">📊 Статистика</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-[24px] font-[700] text-[#8DC63F]">{historyData.length}</div>
                            <div className="text-[12px] text-gray-600">Тестов пройдено</div>
                        </div>
                        <div>
                            <div className="text-[24px] font-[700] text-[#8DC63F]">
                                {Math.round(historyData.reduce((sum, item) => sum + item.percentage, 0) / historyData.length)}%
                            </div>
                            <div className="text-[12px] text-gray-600">Средний балл</div>
                        </div>
                    </div>
                </div>
            )}

            {/* История тестов */}
            <div className="flex flex-col gap-3">
                <h2 className="font-[600] text-[16px] text-[#1E1E1E]">
                    🧠 История тестов ({historyData.length})
                </h2>
                
                {historyData.length === 0 ? (
                    <div className="bg-white rounded-[12px] p-6 text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="font-[600] text-[16px] text-[#1E1E1E] mb-1">История пуста</p>
                        <p className="text-[14px] text-gray-700">Пройдите тесты, чтобы увидеть результаты здесь</p>
                        <Link 
                            href="/tests"
                            className="inline-block mt-4 bg-[#8DC63F] text-white px-6 py-2 rounded-lg font-[500] hover:bg-[#7BB62D] transition-colors"
                        >
                            Пройти тесты
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
                        {historyData.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="bg-white rounded-[12px] p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full w-[38px] h-[38px] bg-[#8DC63F] flex justify-center items-center">
                                            <span className="text-white text-lg">🧠</span>
                                        </div>
                                        <div>
                                            <h3 className="font-[600] text-[14px] text-[#1E1E1E]">
                                                {getTestName(item.testType, item.test)}
                                            </h3>
                                            <p className="text-[12px] text-gray-700">
                                                {formatDate(item.completedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div 
                                        className="px-3 py-1 rounded-full text-[12px] font-[500] text-white"
                                        style={{ backgroundColor: getResultColor(item.resultLevel) }}
                                    >
                                        {getResultText(item.resultLevel, item.percentage)}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-700">📊</span>
                                        <span className="text-[13px] text-[#1E1E1E]">
                                            {item.score} из {item.maxScore} баллов
                                        </span>
                                    </div>
                                    <div className="text-[12px] text-gray-700">
                                        {Math.round(item.percentage)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;