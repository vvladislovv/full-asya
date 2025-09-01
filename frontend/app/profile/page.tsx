"use client";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../providers/useAuth";

const Profile : React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

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
