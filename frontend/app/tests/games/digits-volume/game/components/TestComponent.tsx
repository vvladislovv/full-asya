"use client";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useEffect, useState } from "react";

interface TestComponentProps {
    randomNumbers: number[];
    restart: () => void;
    setCurrentTestIndex: (index: number) => void;
    currentTestIndex: number;
    onNextTest?: () => void;
    onBackToList?: () => void;
    onSubmitResults?: (answers: Record<string, any>, correctAnswers: number, totalAnswers: number) => void;
}

export const DigitsTestComponent: React.FC<TestComponentProps> = ({ randomNumbers, restart, setCurrentTestIndex, currentTestIndex, onNextTest, onBackToList, onSubmitResults}) => {
    const { t } = useLanguage();
    // Fisher-Yates shuffle
    function shuffle(array: number[]) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    const [shuffledNumbers, setShuffledNumbers] = useState<number[]>(() => shuffle(randomNumbers));
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [feedback, setFeedback] = useState<{ [key: number]: 'correct' | 'incorrect' }>({});
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});

    const handleRestart = () => {
        setShowResult(false);
        setResult(0);
        setCurrentIndex(0);
        setFeedback({});
        setButtonsDisabled(false);
        setShuffledNumbers(shuffle(randomNumbers));
        restart();
    };

    const handleAnswer = (answer: number, index: number) => {
        if (buttonsDisabled) return;
        const isCorrect = randomNumbers[currentIndex] === answer;
        
        // Сохраняем ответ пользователя
        setUserAnswers(prev => ({
            ...prev,
            [`question_${currentIndex}`]: {
                expectedNumber: randomNumbers[currentIndex],
                userAnswer: answer,
                isCorrect: isCorrect
            }
        }));
        
        if (isCorrect) {
            setFeedback(prev => ({ ...prev, [index]: 'correct' }));
            setResult((prev) => prev + 1);
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            if (nextIndex >= randomNumbers.length) {
                setButtonsDisabled(true);
                // Отправляем результаты перед показом результата
                if (onSubmitResults) {
                    onSubmitResults(userAnswers, result + 1, randomNumbers.length);
                }
                setTimeout(() => setShowResult(true), 500);
            }
        } else {
            setFeedback(prev => ({ ...prev, [index]: 'incorrect' }));
            setButtonsDisabled(true);
            // Отправляем результаты перед показом результата
            if (onSubmitResults) {
                onSubmitResults(userAnswers, result, randomNumbers.length);
            }
            setTimeout(() => setShowResult(true), 1000);
        }
    };

    useEffect(() => {
        if (currentIndex >= randomNumbers.length && currentIndex > 0) {
            setButtonsDisabled(true);
            setTimeout(() => {
                setShowResult(true);
            }, 500);
        }
    }, [currentIndex, randomNumbers.length]);

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
                                    strokeDashoffset={2 * Math.PI * 81 * (1 - result / shuffledNumbers.length)}
                                    strokeWidth="16"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="bg-[#F2F5F9] w-full rounded-full h-full flex items-center justify-center">
                                <div className="flex flex-col gap-[4px] items-center">
                                    <span className="font-[500] text-[16px] leading-[16px]">{result / shuffledNumbers.length > 0.75 ? t('game.high_level') : result / shuffledNumbers.length > 0.5 ? t('game.medium_level') : t('game.low_level')}</span>
                                    <div>
                                        <span className="font-[600] text-[20px] leading-[24px]">{result}/</span>
                                        <span className="font-[500] text-[18px] leading-[24px]">{shuffledNumbers.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="font-[400] text-[14px] leading-[18px] mt-8 text-center text-gray-600 px-6 max-w-sm">
                            {result/shuffledNumbers.length > 0.75 
                                ? t('game.digit_good')
                                : result/shuffledNumbers.length > 0.5 
                                ? t('game.digit_medium')
                                : t('game.digit_bad')
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
        <div className="flex flex-col items-center justify-center h-full gap-8">
            <h1 className="font-[600] text-[18px] leading-[20px] text-center px-4 mb-2">{t('test_instructions.DIGIT_SPAN')}</h1>
            <div className="w-full grid grid-cols-3 gap-x-2 gap-y-2">
                {shuffledNumbers.map((number, index) => {
                    const feedbackClass = feedback[index] === 'correct' ? 'border-[2px] border-[#8DC63F]' : feedback[index] === 'incorrect' ? 'border-[2px] border-[#D9452B]' : '';
                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswer(number, index)}
                            disabled={buttonsDisabled || !!feedback[index]}
                            className={`relative ${feedbackClass} border-0 cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 w-full h-[110px] bg-[#E5EADD] rounded-[8px] flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <span className="text-[32px] leading-[28px] text-[#1E1E1E] font-[600]">{number}</span>
                            {feedback[index] && <span className={`${(feedback[index] === 'correct') ? 'bg-[#8DC63F]' : 'bg-[#D9452B]'} absolute right-[2px] bottom-[2px] w-[32px] h-[32px] rounded-full flex items-center justify-center`}>
                                {feedback[index] === 'correct' ? (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.6668 5L7.50016 14.1667L3.3335 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 1L1 13M1 1L13 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </span>}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};
