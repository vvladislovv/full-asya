"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserHistory, TestHistoryItem } from "../api/services/testService";

import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../providers/useAuth";
import { formatDateSafe } from "../utils/dateUtils";

interface HistoryItem {
    id: string;
    date: string;
    testType: string;
    testName: string;
    score: number;
    maxScore: number;
    percentage: number;
    resultLevel: 'high' | 'medium' | 'low';
    status: 'completed' | 'in_progress' | 'failed';
}

const History : React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка истории тестов
    useEffect(() => {
        const loadHistory = async () => {
            if (!user) return;
            
            try {
                setLoading(true);
                const response: TestHistoryItem[] = await getUserHistory({ limit: 50 });
                
                // getUserHistory уже возвращает массив или пустой массив при ошибке
                const formattedHistory: HistoryItem[] = response.map((item: TestHistoryItem) => ({
                    id: item.id,
                    date: formatDateSafe(item.completedAt || item.createdAt, 'ru-RU', 'Дата недоступна'),
                    testType: item.testType || item.test?.type || 'UNKNOWN',
                    testName: item.test?.name || t(`test_types.${item.testType}`, 'Неизвестный тест'),
                    score: item.score || 0,
                    maxScore: item.maxScore || item.test?.maxScore || 10,
                    percentage: item.percentage || ((item.score || 0) / (item.maxScore || item.test?.maxScore || 10)) * 100,
                    resultLevel: getResultLevel(item.score || 0, item.maxScore || item.test?.maxScore || 10),
                    status: item.isCompleted ? 'completed' : 'in_progress'
                }));
                
                setHistoryData(formattedHistory);
            } catch (error) {
                console.error('Ошибка загрузки истории:', error);
                setError('Не удалось загрузить историю тестов');
                // getUserHistory уже обрабатывает ошибки и возвращает пустой массив
                setHistoryData([]);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [user, t]);

    const getResultLevel = (score: number, maxScore: number): 'high' | 'medium' | 'low' => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'high';
        if (percentage >= 60) return 'medium';
        return 'low';
    };

    const getResultColor = (resultLevel: string) => {
        switch (resultLevel) {
            case "low":
                return "#D9452B";
            case "medium":
                return "#FDB933";
            case "high":
            default:
                return "#8DC63F";
        }
    };

    const getResultText = (resultLevel: string, percentage: number) => {
        switch (resultLevel) {
            case "low":
                return `${Math.round(percentage)}% - ${t('history.result_levels.low')}`;
            case "medium":
                return `${Math.round(percentage)}% - ${t('history.result_levels.medium')}`;
            case "high":
            default:
                return `${Math.round(percentage)}% - ${t('history.result_levels.high')}`;
        }
    };

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
                    {t('home.history')}
                </div>

            </div>

            {/* Ошибка */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span>⚠️</span>
                    <p className="text-[14px]">{error}</p>
                </div>
            )}

            {/* История тестов */}
            <div className="flex flex-col gap-3">
                <h2 className="font-[600] text-[16px] text-[#1E1E1E]">{t('history.test_history')}</h2>
                
                {historyData.length === 0 ? (
                    <div className="bg-white rounded-[12px] p-6 text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="font-[600] text-[16px] text-[#1E1E1E] mb-1">{t('history.history_empty')}</p>
                        <p className="text-[14px] text-gray-700">{t('history.history_empty_description')}</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {historyData.map((item) => (
                            <div key={item.id} className="bg-white rounded-[12px] p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full w-[38px] h-[38px] bg-[#8DC63F] flex justify-center items-center">
                                            <span className="text-white text-lg">🧠</span>
                                        </div>
                                        <div>
                                            <h3 className="font-[600] text-[14px] text-[#1E1E1E]">
                                                {item.testName}
                                            </h3>
                                            <p className="text-[12px] text-gray-700">
                                                {item.date}
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
                                            {item.score} {t('history.score_from')} {item.maxScore}
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