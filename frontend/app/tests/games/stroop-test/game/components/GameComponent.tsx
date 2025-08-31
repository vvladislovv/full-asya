import { useLanguage } from "@/app/hooks/useLanguage";
import React, { useEffect, useState } from "react";
import style from './CardAnimations.module.css';
interface StroopTestGameComponentProps {
    result: number;
    setResult: (value: number) => void;
    randomColors: {name: string, color: string}[];
    initialColors: {name: string, color: string}[];
    initialTimer: number;
    setGameEnded: (state : boolean) => void; 
}
export const StroopTestGameComponent: React.FC<StroopTestGameComponentProps> = ({ result, setResult, initialColors, randomColors, initialTimer, setGameEnded }) => {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timer, setTimer] = useState(initialTimer);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isAnswered, setIsAnswered] = useState(false);
    const [cardAnimation, setCardAnimation] = useState('animateIn');
    const handleAnswer = React.useCallback((answer: boolean) => {
        if (isAnswered) return;
        const randomColorPair = randomColors[currentIndex];
        const isPairMatch = initialColors.some(
            c => c.name === randomColorPair.name && c.color === randomColorPair.color
        );
        const correct = (answer && isPairMatch) || (!answer && !isPairMatch);
        setIsAnswered(true);
        setIsCorrect(correct);
        if (correct) {
            setResult(result + 1);
        }
        setTimeout(() => {
            setCardAnimation('animateOut');
            setTimeout(() => {
                setIsAnswered(false);
                setIsCorrect(false);
                setCardAnimation('animateIn');
                setCurrentIndex(currentIndex+1);
            }, 300)
        }, 1500);
    }, [isAnswered, currentIndex, initialColors, randomColors, result, setResult]);

    useEffect(() => {
        if (currentIndex >= randomColors.length - 1) {
            setGameEnded(true);
        }
    }, [currentIndex, randomColors.length, setGameEnded]);
    useEffect(() => {
        if (isAnswered) return;
        setTimer(initialTimer);
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 20) {
                    clearInterval(interval);
                    if (!isAnswered) handleAnswer(false);
                    return 0;
                }
                return prev - 20;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [isAnswered, initialTimer, handleAnswer]);
    return (
        <div className="flex flex-col items-center gap-8 justify-center h-full px-4">
            <div className="text-[18px] text-center font-[600] leading-[16px] text-[#1E1E1E]">
                {t('game.stroop_instruction', 'Нажмите на экран, когда название цвета совпадает с цветом его букв')}
            </div>
            <div className="w-full">
                {currentIndex < randomColors.length-1 && <div 
                    onClick={() => handleAnswer(true)} 
                    className={`${style[cardAnimation]} cursor-pointer relative active:scale-[0.97] transition-transform duration-300 bg-[#E5EADD] rounded-[8px] h-[300px] flex justify-center items-center
                    ${isAnswered && 'border-2'} ${isCorrect && isAnswered ? 'border-[#8DC63F]' : 'border-[#D9452B]'}`}
                >
                    <span style={{ color: randomColors[currentIndex].color }} className={`text-[18px] font-[600]`}>
                        {randomColors[currentIndex].name}
                    </span>
                    <div className={`flex justify-center items-center w-[26px] h-[26px] absolute bottom-2 right-2 rounded-full ${!isAnswered && 'hidden'} ${isCorrect ? 'bg-[#8DC63F]' : 'bg-[#D9452B]'}`}> 
                        {isCorrect ? 
                            // галочка
                            <svg width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.60059 4.99987L4.90062 8.2999L11.5007 1.69983" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            :
                            // крестик
                            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 0C20.1799 0 26 5.8201 26 13C26 20.1799 20.1799 26 13 26C5.8201 26 0 20.1799 0 13C0 5.8201 5.8201 0 13 0ZM15.8691 8.8881L13.013 11.739L10.1595 8.8881C10.0111 8.73891 9.81445 8.64753 9.60476 8.63037C9.39507 8.61322 9.18613 8.67141 9.0155 8.7945L8.9063 8.8881C8.82376 8.97024 8.75826 9.06788 8.71356 9.17542C8.66887 9.28295 8.64586 9.39825 8.64586 9.5147C8.64586 9.63115 8.66887 9.74645 8.71356 9.85398C8.75826 9.96152 8.82376 10.0592 8.9063 10.1413L11.7598 12.9922L8.9063 15.8431C8.73994 16.0093 8.64642 16.2347 8.64629 16.4699C8.64623 16.5863 8.66911 16.7016 8.71361 16.8092C8.75811 16.9168 8.82336 17.0146 8.90565 17.0969C8.98794 17.1793 9.08564 17.2447 9.19319 17.2893C9.30073 17.3339 9.41601 17.3569 9.53244 17.357C9.76758 17.3571 9.99314 17.2638 10.1595 17.0976L13.013 14.2441L15.8691 17.0976C16.1811 17.4096 16.666 17.4395 17.0131 17.1899L17.1223 17.0963C17.2048 17.0142 17.2703 16.9165 17.315 16.809C17.3597 16.7015 17.3827 16.5861 17.3827 16.4697C17.3827 16.3532 17.3597 16.2379 17.315 16.1304C17.2703 16.0229 17.2048 15.9252 17.1223 15.8431L14.2675 12.9922L17.121 10.1413C17.2749 9.97288 17.358 9.75159 17.353 9.52347C17.3479 9.29535 17.2551 9.07797 17.0938 8.91654C16.9326 8.75511 16.7153 8.66207 16.4872 8.65677C16.2591 8.65147 16.0377 8.73433 15.8691 8.8881Z" fill="white" />
                            </svg>
                        }
                    </div>
                </div>}
            </div>
            <div className="text-[20px] leading-[16px] text-[#1E1E1E] font-[500] text-center">
                {t('game.time_left')}: {Math.ceil(timer / 1000)} {t('game.seconds')}
            </div>
        </div>
    )
}