import { useLanguage } from "@/app/hooks/useLanguage";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import styles from './CardAnimations.module.css';

interface TestComponentProps {
    allImages: string[];
    randomImages: string[];
    initialTimer: number | null;
    restart: () => void;
    setCurrentTestIndex: (index: number) => void;
    currentTestIndex: number;
    onNextTest?: () => void;
    onBackToList?: () => void;
    onSubmitResults?: (answers: Record<string, any>, correctAnswers: number, totalAnswers: number) => void;
}
type Answer = 'Yes' | 'No'
export const TestComponent : React.FC<TestComponentProps> = ({initialTimer, randomImages, allImages, restart, setCurrentTestIndex, currentTestIndex, onNextTest, onBackToList, onSubmitResults}) => {
    const { t } = useLanguage();
    const timer = (initialTimer ?? 300) * 10;
    const [showResult, setShowResult] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [result, setResult] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [cardAnimation, setCardAnimation] = useState('animateIn');
    const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
    
    const handleAnswer = useCallback((answer : Answer, image : string) => {
        if (isAnswered) return;
        
        const isInRandomList = randomImages.includes(image);
        const correct = (isInRandomList && answer === 'Yes') || (!isInRandomList && answer === 'No');
        
        setIsAnswered(true);
        setIsCorrect(correct);
        
        // Сохраняем ответ пользователя
        setUserAnswers(prev => ({
            ...prev,
            [`question_${currentIndex}`]: {
                image,
                userAnswer: answer,
                correctAnswer: isInRandomList ? 'Yes' : 'No',
                isCorrect: correct
            }
        }));
        
        // Увеличиваем результат только если картинка была в списке для запоминания И пользователь ответил "Да"
        if (correct) {
            setResult((prev) => prev + 1);
        }
        
        // Показываем результат на 1.5 секунды, затем переходим к следующей карточке
        setTimeout(() => {
            setCardAnimation('animateOut');
            setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
                setIsAnswered(false);
                setIsCorrect(false);
                setCardAnimation('animateIn');
            }, 300);
        }, 1500);
    }, [isAnswered, randomImages])

    const handleRestart = () => {
        setShowResult(false);
        setCurrentIndex(0);
        setResult(0);
        setIsAnswered(false);
        setIsCorrect(false);
        setCardAnimation('animateIn');

        restart();
    };
    useEffect(() => {
        if (showResult) return;
        if (currentIndex >= allImages.length) {
            // Отправляем результаты перед показом результата
            if (onSubmitResults) {
                onSubmitResults(userAnswers, result, allImages.length);
            }
            setShowResult(true);
            return;
        }
        if (isAnswered) return;
        
        const timeout = setTimeout(() => {
            // Если пользователь не нажал, автоматически засчитываем 'No'
            handleAnswer('No', allImages[currentIndex]);
        }, timer);
        return () => clearTimeout(timeout);
    }, [showResult, currentIndex, allImages, randomImages, isAnswered, handleAnswer, timer]);

    if (showResult) {
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
                                    strokeDashoffset={2 * Math.PI * 81 * (1 - result / randomImages.length)}
                                    strokeWidth="16"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="bg-[#F2F5F9] w-full rounded-full h-full flex items-center justify-center">
                                <div className="flex flex-col gap-[4px] items-center">
                                    <span className="font-[500] text-[16px] leading-[16px]">{result/randomImages.length > 0.75 ? t('game.high_level') : result/randomImages.length>0.5 ? t('game.medium_level') : t('game.low_level')}</span>
                                    <div>
                                        <span className="font-[600] text-[20px] leading-[24px]">{result}/</span>
                                        <span className="font-[500] text-[18px] leading-[24px]">{randomImages.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="font-[400] text-[14px] leading-[18px] mt-8 text-center text-gray-600 px-6 max-w-sm">
                            {result/randomImages.length > 0.75 
                                ? t('results.high_performance', 'Отличный результат! Ваша зрительная память работает очень хорошо.')
                                : result/randomImages.length > 0.5 
                                ? t('results.medium_performance', 'Хороший результат! Есть потенциал для развития зрительной памяти.')
                                : t('results.low_performance', 'Результат можно улучшить. Тренировка зрительного внимания поможет.')
                            }
                        </p>
                    </div>
                </div>
                <div className="w-full absolute left-0 bottom-0 p-4 flex flex-col gap-2">
                    {onBackToList && (
                        <button onClick={onBackToList} className="cursor-pointer py-[18px] border border-gray-300 rounded-[43px] flex justify-center transition-all duration-300 active:scale-[0.97] bg-gray-50">
                            <span className="text-[16px] font-[500] text-gray-600">{t('game.back_to_list')}</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[20px] font-[600] text-[#1E1E1E] mb-4">
                {t('game.card_number')} {currentIndex + 1} {t('game.of')} {allImages.length}
            </div>
            <div className="text-[18px] font-[500] text-[#1E1E1E] mb-8">
                {t('game.was_image_shown')}
            </div>
            
            <div
                onClick={() => !isAnswered && handleAnswer('Yes', allImages[currentIndex])}
                className={`
                    ${styles.card}
                    ${styles[cardAnimation]}
                    ${isAnswered ? (isCorrect ? styles.correct : styles.incorrect) : ''}
                    ${isAnswered ? styles.answered : ''}
                `}
            >
                {allImages[currentIndex] && (
                    <Image 
                        src={allImages[currentIndex]} 
                        alt="Картинка" 
                        width={200} 
                        height={200} 
                        style={{objectFit: 'contain', width: "auto", height: "auto"}}
                        onError={(e) => {
                            console.error('Image failed to load:', allImages[currentIndex]);
                            e.currentTarget.src = '/images/apple.png'; // fallback image
                        }}
                        priority
                    />
                )}
                
                {/* Иконка результата */}
                {isAnswered && (
                    <div className={`
                        ${styles.resultIcon}
                        ${isCorrect ? styles.correct : styles.incorrect}
                    `}>
                        {isCorrect ? '✓' : '✕'}
                    </div>
                )}
            </div>

            {!isAnswered && (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-4">
                        <button 
                            onClick={() => handleAnswer('Yes', allImages[currentIndex])}
                            className="bg-[#8DC63F] text-white px-8 py-3 rounded-full font-[600] text-[16px] hover:bg-[#7BB62D] active:scale-[0.95] transition-all duration-300"
                        >
                            {t('game.yes')}
                        </button>
                        <button 
                            onClick={() => handleAnswer('No', allImages[currentIndex])}
                            className="bg-[#D9452B] text-white px-8 py-3 rounded-full font-[600] text-[16px] hover:bg-[#C23E29] active:scale-[0.95] transition-all duration-300"
                        >
                            {t('game.no')}
                        </button>
                    </div>
                    <div className="text-[14px] text-[#666]">
                        {t('game.auto_answer_no')} {Math.ceil(timer / 1000)} {t('game.seconds')}
                    </div>
                </div>
            )}
            
            {isAnswered && (
                <div className={`text-[18px] font-[600] ${isCorrect ? 'text-[#8DC63F]' : 'text-[#D9452B]'}`}>
                    {isCorrect ? t('game.correct') : t('game.incorrect')}
                </div>
            )}
        </div>
    )
}