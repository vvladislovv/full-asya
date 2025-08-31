"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginPage } from "./auth/LoginPage";
import ExtensionCleanup from "./components/ExtensionCleanup";

import SafeHydration from "./components/SafeHydration";
import { useLanguage } from "./hooks/useLanguage";
import { useAuth } from "./providers/useAuth";

export default function Home() {
  const router = useRouter();
  // 1 Получаем пользователя из провайдера
  const { user } = useAuth();
  // 2 Получаем функции для работы с языками
  const { t } = useLanguage();
  
  // 3 Если нет пользователя то отправляем на регистрацию
  if (!user) {
    return <LoginPage />
  }
  
  return (
    <ExtensionCleanup>
      <SafeHydration fallback={
        <div className="bg-[#E8ECF5] w-screen h-screen flex items-center justify-center" suppressHydrationWarning>
          <div className="text-center" suppressHydrationWarning>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DC63F] mx-auto mb-4" suppressHydrationWarning></div>
            <p className="text-[#0E0F0F]" suppressHydrationWarning>{t('common.loading')}</p>
          </div>
        </div>
      }>
        <div 
          className="bg-[#E8ECF5] w-screen h-screen relative px-4 py-6 sm:px-16 sm:py-12"
          style={{fontFamily: 'SF Pro Text, Arial, sans-serif', color: 'black'}}
          suppressHydrationWarning
        >
          <div className="h-full flex flex-col gap-6" suppressHydrationWarning>
            <div className="flex flex-col gap-4" suppressHydrationWarning> 
              <div className="flex justify-between items-start" suppressHydrationWarning>
                <h1 
                  className="text-[#0E0F0F] text-[22px] leading-[22px] font-[600] flex-1"
                  suppressHydrationWarning
                >
                  {t('home.greeting')}, {user?.firstName || user?.username || t('common.user', 'Пользователь')}
                </h1>
              </div>
              <p 
                className="font-[400] text-[14px] leading-[16px] text-black opacity-70"
                suppressHydrationWarning
              >
                {t('home.description')}
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-[6px] sm:gap-4" suppressHydrationWarning>
              <div className="flex gap-[6px] sm:gap-4" suppressHydrationWarning>
                <button
                  onClick={() => router.push('/tests')}
                  className="cursor-pointer relative flex-1 bg-[#8DC63F] rounded-[24px] active:scale-[0.97] transition-all duration-300"
                  suppressHydrationWarning
                >
                  <div className="h-full p-4 flex flex-col gap-4 justify-between" suppressHydrationWarning>
                    <div className="flex flex-col gap-1 items-start" suppressHydrationWarning>
                      <div className="rounded-full bg-white/70 w-[56px] h-[56px] flex justify-center items-center" suppressHydrationWarning>
                        <Image src="/icons/document.svg" alt="Document" width="24" height="24" style={{ width: 'auto', height: 'auto' }} />
                      </div>
                      <div className="relative h-[90px] w-full" suppressHydrationWarning>
                        <Image src="/images/testAndPractices.svg" alt="Test And Practices Image" fill />
                      </div>
                      <p className="font-[400] text-[13px] leading-[16px] text-[black/70] text-left" suppressHydrationWarning>
                        {t('home.tests_description')}
                      </p>
                    </div>
                    <div className="font-[600] text-[#1E1E1E] text-[16px] text-left" suppressHydrationWarning>{t('home.tests_and_practices')}</div>
                  </div>
                </button>
                <div className="flex-1 flex flex-col gap-2" suppressHydrationWarning>

                  <button 
                    onClick={() =>
                      router.push('/history')
                    } 
                    className="flex-1 cursor-pointer bg-[#1C2D56] rounded-[24px] active:scale-[0.97] transition-all duration-300 p-4 text-white"
                    suppressHydrationWarning
                  >
                    <div className="flex flex-col gap-6 items-start" suppressHydrationWarning>
                      <div className="rounded-full bg-white/15 w-[56px] h-[56px] flex justify-center items-center" suppressHydrationWarning>
                        <Image src="/icons/history.svg" alt="History" width="24" height="24" style={{ width: 'auto', height: 'auto' }} />
                      </div>
                      <div className="font-[600] text-[16px] leading-[16px]" suppressHydrationWarning>
                        {t('home.history')}
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => router.push('/profile')}
                    className="flex-1 cursor-pointer bg-[#FDB933] active:scale-[0.97] transition-all duration-300 rounded-[24px] p-4"
                    suppressHydrationWarning
                  >
                    <div className="flex flex-col gap-6 items-start" suppressHydrationWarning>
                      <div className="rounded-full bg-white/40 w-[56px] h-[56px] flex justify-center items-center" suppressHydrationWarning>
                        <Image src="/icons/user-settings.svg" alt="User Settings" width="24" height="24" style={{ width: 'auto', height: 'auto' }} />
                      </div>
                      <div className="font-[600] text-[16px] leading-[16px]" suppressHydrationWarning>
                        {t('home.profile')}
                      </div>
                    </div>
                  </button>

                </div>
              </div>

              <Link href="/consultation" className="cursor-pointer relative active:scale-[0.97] transition-all duration-300 bg-white rounded-[24px] p-4 overflow-hidden" suppressHydrationWarning>
                <div className="absolute top-2 right-4 h-full w-[140px]" suppressHydrationWarning>
                  <Image src="/images/manager.png" alt="Manager" fill priority/>
                </div>
                <div className="flex flex-col gap-6 items-start" suppressHydrationWarning>
                  <div className="rounded-full bg-[#E8ECF5] w-[56px] h-[56px] flex justify-center items-center" suppressHydrationWarning>
                    <Image src="/icons/write.svg" alt="Write" width="24" height="24" style={{ width: 'auto', height: 'auto' }} />
                  </div>
                  <div className="font-[600] text-[16px] leading-[16px] text-left" suppressHydrationWarning>
                    {t('home.consultation')}
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </div>
      </SafeHydration>
    </ExtensionCleanup>
  );
}
