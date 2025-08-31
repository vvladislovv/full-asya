import React, { useEffect, useState } from "react";
import styles from './CardAnimations.module.css';

interface TestComponentProps {
    allWords: string[],
    randomWords: string[]
    restart: () => void;
    setCurrentTestIndex: (index: number) => void;
    currentTestIndex: number;
}
type Answer = 'Yes' | 'No'
export const EyeTestComponent : React.FC<TestComponentProps> = ({randomWords, allWords, restart, setCurrentTestIndex, currentTestIndex}) => {
    const timer = 3000;
    const [showResult, setShowResult] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [result, setResult] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [cardAnimation, setCardAnimation] = useState('animateIn');

    const handleAnswer = React.useCallback((answer : Answer, word : string) => {
        if (isAnswered) return;
        const isInRandomList = randomWords.includes(word);
        const correct = (isInRandomList && answer === 'Yes') || (!isInRandomList && answer === 'No');
        setIsAnswered(true);
        setIsCorrect(correct);
        if (isInRandomList && answer === 'Yes') {
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
    }, [isAnswered, randomWords]);

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
        if (currentIndex >= allWords.length) {
            setShowResult(true);
            return;
        }
        if (isAnswered) return;
        
        const timeout = setTimeout(() => {
            // Если пользователь не нажал, автоматически засчитываем 'No'
            handleAnswer('No', allWords[currentIndex]);
        }, timer);
        return () => clearTimeout(timeout);
    }, [showResult, currentIndex, allWords, isAnswered, handleAnswer]);

    if (showResult) {
        return (
            <div>
                <div className="flex flex-col mt-12 h-full">
                    <div className="flex flex-col items-center">
                        <div className="text-[20px] leading-[24px] font-[600] text-[#1E1E1E] mb-8">Результат теста</div>
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
                                    strokeDashoffset={2 * Math.PI * 81 * (1 - result / randomWords.length)}
                                    strokeWidth="16"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="bg-[#F2F5F9] w-full rounded-full h-full flex items-center justify-center">
                                <div className="flex flex-col gap-[4px] items-center">
                                    <span className="font-[500] text-[16px] leading-[16px]">{result/randomWords.length > 0.75 ? 'Высокий уровень' : result/randomWords.length>0.5 ? 'Средний уровень' : 'Низкий уровень'}</span>
                                    <div>
                                        <span className="font-[600] text-[20px] leading-[24px]">{result}/</span>
                                        <span className="font-[500] text-[18px] leading-[24px]">{randomWords.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="font-[400] text-[14px] leading-[18px] mt-8 text-center text-gray-600 px-6 max-w-sm">
                            {result/randomWords.length > 0.75 
                                ? 'Отличный результат! Ваша зрительная память отлично удерживает информацию.'
                                : result/randomWords.length > 0.5 
                                ? 'Хороший результат! Есть возможности для развития зрительной памяти.'
                                : 'Результат можно улучшить. Чтение и визуализация помогут укрепить память.'
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
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="text-[20px] font-[600] text-[#1E1E1E] mb-4">
                Карточка {currentIndex + 1} из {allWords.length}
            </div>
            <div className="text-[18px] font-[500] text-[#1E1E1E] mb-8 text-center px-4">
                Было ли это слово в показанном списке?
            </div>
            
            <div
                onClick={() => !isAnswered && handleAnswer('Yes', allWords[currentIndex])}
                className={`
                    ${styles.card}
                    ${styles[cardAnimation]}
                    ${isAnswered ? (isCorrect ? styles.correct : styles.incorrect) : ''}
                    ${isAnswered ? styles.answered : ''}
                `}
            >
                {allWords[currentIndex]}
                
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
                    Автоответ &quot;Нет&quot; через {Math.ceil(timer / 1000)} секунд
                </div>
            )}
            
            {isAnswered && (
                <div className={`text-[18px] font-[600] ${isCorrect ? 'text-[#8DC63F]' : 'text-[#D9452B]'}`}>
                    {isCorrect ? 'Правильно!' : 'Неправильно!'}
                </div>
            )}
        </div>
    )
}