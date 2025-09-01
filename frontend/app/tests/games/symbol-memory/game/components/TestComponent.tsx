import { useLanguage } from "@/app/hooks/useLanguage";
import React, { useEffect, useState } from "react";
import { Symbol } from "../SymbolMemoryGame";
import styles from './CardAnimations.module.css';

interface TestComponentProps {
    allSymbols: Symbol[],
    randomSymbols: Symbol[]
    restart: () => void;
    setCurrentTestIndex: (index: number) => void;
    onNextTest?: () => void;
    onBackToList?: () => void;
    onSubmitResults?: (answers: Record<string, any>, correctAnswers: number, totalAnswers: number) => void;
}
type Answer = 'Yes' | 'No'
export const SymbolMemoryTestComponent : React.FC<TestComponentProps> = ({randomSymbols, allSymbols, restart, setCurrentTestIndex, onNextTest, onBackToList, onSubmitResults}) => {
    const { t } = useLanguage();
    const timer = 3000;
    const [showResult, setShowResult] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [result, setResult] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [cardAnimation, setCardAnimation] = useState('animateIn');
    const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
    
    const handleAnswer = React.useCallback((answer : Answer, symbol : Symbol) => {
        if (isAnswered) return;
        const isInRandomList = randomSymbols.includes(symbol);
        const correct = (isInRandomList && answer === 'Yes') || (!isInRandomList && answer === 'No');
        setIsAnswered(true);
        setIsCorrect(correct);
        if (correct) {
            setResult((prev) => prev + 1);
        }
        setTimeout(() => {
            setCardAnimation('animateOut');
            setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
                setIsAnswered(false);
                setIsCorrect(false);
                setCardAnimation('animateIn');
            }, 300);
        }, 1500);
    }, [isAnswered, randomSymbols]);

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
        if (currentIndex >= allSymbols.length) {
            // Отправляем результаты перед показом результата
            if (onSubmitResults) {
                onSubmitResults(userAnswers, result, allSymbols.length);
            }
            setShowResult(true);
            return;
        }
        if (isAnswered) return;
        
        const timeout = setTimeout(() => {
            // Если пользователь не нажал, автоматически засчитываем 'No'
            handleAnswer('No', allSymbols[currentIndex]);
        }, timer);
        return () => clearTimeout(timeout);
    }, [showResult, currentIndex, allSymbols, isAnswered, handleAnswer]);

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
                                    strokeDashoffset={2 * Math.PI * 81 * (1 - result / allSymbols.length)}
                                    strokeWidth="16"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="bg-[#F2F5F9] w-full rounded-full h-full flex items-center justify-center">
                                <div className="flex flex-col gap-[4px] items-center">
                                    <span className="font-[500] text-[16px] leading-[16px]">{result/allSymbols.length > 0.75 ? t('game.high_level') : result/allSymbols.length>0.5 ? t('game.medium_level') : t('game.low_level')}</span>
                                    <div>
                                        <span className="font-[600] text-[20px] leading-[24px]">{result}/</span>
                                        <span className="font-[500] text-[18px] leading-[24px]">{allSymbols.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="font-[400] text-[14px] leading-[18px] mt-8 text-center text-gray-600 px-6 max-w-sm">
                            {result/allSymbols.length > 0.75 
                                ? t('game.symbol_good')
                                : result/allSymbols.length > 0.5 
                                ? t('game.symbol_medium')
                                : t('game.symbol_bad')
                            }
                        </p>
                    </div>
                </div>
                <div className="w-full absolute left-0 bottom-0 p-4 flex flex-col gap-2">
                    <button onClick={() => window.history.back()} className="cursor-pointer py-[18px] border border-gray-300 rounded-[43px] flex justify-center transition-all duration-300 active:scale-[0.97] bg-gray-50">
                        <span className="text-[16px] font-[500] text-gray-600">{t('game.back_to_list')}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[20px] font-[600] text-[#1E1E1E] mb-4">
                {t('game.card_number')} {currentIndex + 1} {t('game.of')} {allSymbols.length}
            </div>
            <div className="text-[18px] font-[500] text-[#1E1E1E] mb-8 text-center px-4">
                {t('game.was_image_shown')}
            </div>
            
            <div
                onClick={() => !isAnswered && handleAnswer('Yes', allSymbols[currentIndex])}
                className={`
                    ${styles.card}
                    ${styles[cardAnimation]}
                    ${isAnswered ? (isCorrect ? styles.correct : styles.incorrect) : ''}
                    ${isAnswered ? styles.answered : ''}
                `}
            >
                {allSymbols[currentIndex] && (
                    <div>{allSymbols[currentIndex].symbol}</div>
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
                <div className="text-[16px] text-[#666]">
                    {t('game.auto_answer_no')} {Math.ceil(timer / 1000)} {t('game.seconds')}
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