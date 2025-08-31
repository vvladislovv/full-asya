import { useLanguage } from "@/app/hooks/useLanguage";

interface StroopTestResultComponentProps {
    restart: () => void;
    result: number;
    setCurrentTestIndex: (index: number) => void;
    currentTestIndex: number;
}
export const StoopTestResultComponent : React.FC<StroopTestResultComponentProps> = ({restart, result, setCurrentTestIndex, currentTestIndex}) => {
    const { t } = useLanguage();
    return (
        <div>
            <div className="flex flex-col mt-12 h-full">
                <div className="flex flex-col items-center">
                    <div className="text-[20px] leading-[24px] font-[600] text-[#1E1E1E] mb-8">{t('game.test_result')}</div>
                    <div className="relative bg-[#E0E4E9] w-[178px] h-[178px] rounded-full p-4">
                        <svg className="absolute top-0 left-0 z-20" xmlns="http://www.w3.org/2000/svg" version="1.1" width="178" height="178">
                            <defs>
                                <linearGradient id="GradientColor" x1="24%" y1="0%" x2="72%" y2="100%">
                                    <stop offset="24.07%" stopColor="#D9452B" />
                                    <stop offset="72.35%" stopColor="#FDB933" />
                                </linearGradient>
                            </defs>
                            <circle 
                                cx="89"
                                cy="89" 
                                r="81"
                                fill="none" 
                                stroke="url(#GradientColor)"
                                strokeDasharray={2 * Math.PI * 81}
                                strokeDashoffset={2 * Math.PI * 81 * (1 - result / 12)}
                                strokeWidth="16"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="bg-[#F2F5F9] w-full rounded-full h-full flex items-center justify-center">
                            <div className="flex flex-col gap-[4px] items-center">
                                <span className="font-[500] text-[16px] leading-[16px]">{result/12 > 0.75 ? t('game.high_level') : result/12>0.5 ? t('game.medium_level') : t('game.low_level')}</span>
                                <div>
                                    <span className="font-[600] text-[20px] leading-[24px]">{result}/</span>
                                    <span className="font-[500] text-[18px] leading-[24px]">12</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="font-[400] text-[14px] leading-[18px] mt-8 text-center text-gray-600 px-6 max-w-sm">
                        {result/12 > 0.75 
                            ? 'Отличный результат! Ваша способность к концентрации и подавлению интерференции очень хороша.'
                            : result/12 > 0.5 
                            ? 'Хороший результат! Есть потенциал для улучшения концентрации внимания.'
                            : 'Результат можно улучшить. Тренировка внимания поможет лучше справляться с отвлекающими факторами.'
                        }
                    </p>
                </div>
            </div>
            <div className="w-full absolute left-0 bottom-0 p-4 flex flex-col gap-2">
                <button onClick={() => window.history.back()} className="cursor-pointer py-[18px] border border-gray-300 rounded-[43px] flex justify-center transition-all duration-300 active:scale-[0.97] bg-gray-50">
                    <span className="text-[16px] font-[500] text-gray-600">Вернуться к списку тестов</span>
                </button>
            </div>
        </div>
    )
}