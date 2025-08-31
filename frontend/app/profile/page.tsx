"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserStats, UserStatsResponse } from "../api/services/testService";

import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../providers/useAuth";
import { formatDateSafe } from "../utils/dateUtils";

interface UserStats {
    totalTests: number;
    completedTests: number;
    averageScore: number;
    lastTestDate: string | null;
    riskLevel: 'low' | 'medium' | 'high' | null;
}

const Profile : React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка статистики пользователя
    useEffect(() => {
        const loadUserStats = async () => {
            if (!user) return;
            
            try {
                setLoading(true);
                const stats: UserStatsResponse = await getUserStats();
                
                // Преобразуем данные API в нужный формат с правильными типами
                const formattedStats: UserStats = {
                    totalTests: stats.totalTests || 0,
                    completedTests: stats.completedTests || 0,
                    averageScore: Math.round(stats.averageScore || 0),
                    lastTestDate: stats.lastTestDate && typeof stats.lastTestDate === 'string' && stats.lastTestDate.length > 0
                        ? formatDateSafe(stats.lastTestDate, 'ru-RU', 'Дата недоступна') 
                        : null,
                    riskLevel: stats.riskLevel || 'low'
                };
                
                setUserStats(formattedStats);
            } catch (error) {
                console.error('Ошибка загрузки статистики:', error);
                setError('Не удалось загрузить статистику');
                // getUserStats уже возвращает fallback данные при ошибке
                setUserStats(null);
            } finally {
                setLoading(false);
            }
        };

        loadUserStats();
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
            <div className="relative flex items-center">
                <Link 
                    href="/"
                    className="hover:cursor-pointer active:scale-[0.95] transition-all duration-300 w-[48px] h-[48px] rounded-full bg-[white] flex justify-center items-center"
                    style={{zIndex: 1}}
                >
                    					<Image src="/icons/back.svg"  alt="Назад" width={10} height={14} style={{ width: 'auto', height: 'auto' }} />
                </Link>
                <div
                    className="pointer-events-none absolute left-0 right-0 text-[20px] text-center font-[600]"
                    style={{zIndex: 0}}
                >
                    {t('profile.title')}
                </div>

            </div>
            
            {/* Ошибка */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span>⚠️</span>
                    <p className="text-[14px]">{error}</p>
                </div>
            )}
            
            {/* Telegram ID вместо статуса подключения */}
            {user?.telegramId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-700 font-medium">
                        Telegram ID: {user.telegramId}
                    </span>
                </div>
            )}
            
            <div className="flex justify-center">
                <div className="flex flex-col items-center gap-1">
                    <div className="relative w-[100px] h-[100px] rounded-full border-2 border-[#8DC63F]">
                        {user?.telegramPhotoUrl ? (
                            <Image 
                                src={user.telegramPhotoUrl} 
                                alt="Telegram Avatar" 
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
                    <div className="font-[600] text-[16px]">
                        {user?.firstName && user?.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user?.firstName || user?.username || t('common.user')
                        }
                    </div>
                    {/* Статистика пользователя */}
                    <div className="text-center mt-2">
                        {userStats ? (
                            <>
                                <div className="font-[400] text-[12px] text-gray-800">
                                    {t('profile.tests_completed')}: {userStats.completedTests} {t('history.score_from')} {userStats.totalTests}
                                </div>
                                <div className="font-[400] text-[12px] text-gray-800">
                                    {t('profile.average_score')}: {userStats.averageScore}%
                                </div>
                                {userStats.lastTestDate && (
                                    <div className="font-[400] text-[12px] text-gray-800">
                                        {t('profile.last_test')}: {userStats.lastTestDate}
                                    </div>
                                )}
                                {userStats.riskLevel && (
                                    <div className="font-[400] text-[12px] mt-1">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-[500] ${
                                            userStats.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                                            userStats.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {t(`profile.risk_level.${userStats.riskLevel}`, userStats.riskLevel)}
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="font-[400] text-[12px] text-gray-600">
                                {loading ? t('common.loading') : t('profile.no_stats', 'Статистика недоступна')}
                            </div>
                        )}
                    </div>
                    
                    {/* Дополнительная информация пользователя */}
                    {user && (
                        <div className="text-center mt-1">
                            {user.language && (
                                <div className="font-[400] text-[10px] text-gray-600">
                                    {t('profile.language')}: {user.language.toUpperCase()}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex flex-col gap-4">
                <Link href="/tests" className="flex flex-col gap-2 rounded-[12px] bg-[#8DC63F] p-4 hover:bg-[#7BB62D] active:scale-[0.98] transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full w-[38px] h-[38px] bg-white/15 flex justify-center items-center">
                            <span className="text-white text-lg">🧠</span>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-[600] text-[16px] text-white">{t('profile.cognitive_diagnostics')}</h3>
                            <p className="text-[14px] text-white/80">{t('profile.cognitive_description')}</p>
                        </div>
                    </div>
                </Link>

                <Link href="/history" className="flex flex-col gap-2 rounded-[12px] bg-[#1C2D56] p-4 hover:bg-[#2A3A6A] active:scale-[0.98] transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full w-[38px] h-[38px] bg-white/15 flex justify-center items-center">
                            <span className="text-white text-lg">📊</span>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-[600] text-[16px] text-white">{t('profile.statistics')}</h3>
                            <p className="text-[14px] text-white/80">{t('profile.statistics_description')}</p>
                        </div>
                    </div>
                </Link>

                <Link href="/settings" className="flex flex-col gap-2 rounded-[12px] bg-[#FDB933] p-4 hover:bg-[#E6A82E] active:scale-[0.98] transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full w-[38px] h-[38px] bg-white/40 flex justify-center items-center">
                            <span className="text-white text-lg">⚙️</span>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-[600] text-[16px] text-white">{t('profile.settings')}</h3>
                            <p className="text-[14px] text-white/80">{t('profile.settings_description')}</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Profile;
