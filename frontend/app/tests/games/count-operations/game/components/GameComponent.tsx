"use client";
import { useLanguage } from "@/app/hooks/useLanguage";
import React, { useEffect, useState } from "react";
import type { Operation } from "../CountOperationsGame";
import styles from './CardAnimations.module.css';
interface GameComponentProps {
    result: number,
    setResult: (num : number) => void;
    randomCountOperations: Operation[];
    setGameEnded: (state: boolean) => void;
}

export const CountOperationsGameComponent: React.FC<GameComponentProps> = ({ randomCountOperations, setResult, result, setGameEnded }) => {
    const { t } = useLanguage();
    const initialTimer = 7000
    const [timer, setTimer] = useState(initialTimer); // 7 секунды на ответ
    const [currentCountOperationIndex, setCurrentCountOperationIndex] = useState(0);
    const [cardAnimation, setCardAnimation] = useState('animateIn');
    
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [answer, setAnswer] = useState("")

    function Evaluate(countOperation: Operation) {
        const firstNumber = countOperation.firstNumber
        const secondNumber = countOperation.secondNumber
        switch (countOperation.operation) {
            case "+":
                return firstNumber + secondNumber
            case "-":
                return firstNumber - secondNumber
            case "*":
                return firstNumber * secondNumber
            case "/":
                return firstNumber / secondNumber
            default:
                return 0
        }
    }
    const handleAnswer = React.useCallback((answer : string) => {
        if (isAnswered) return

        const answerToNumber = Number(answer);
        const correctAnswer = Evaluate(randomCountOperations[currentCountOperationIndex]);

        setIsAnswered(true);
        const correct = answerToNumber == correctAnswer;
        setIsCorrect(correct);

        // Если правильно увеличиваем результат в родительском компоненте
        if (correct) {
            setResult(prev => prev + 1);
        }
        
        // Показываем на 1.5 секунды результаты и србасываем через 0.3 секунды (синхронизация с анимацией cardAnimatino duration 300)
        setTimeout(() => {
            setCardAnimation('animateOut')
            setTimeout(() => {
                setIsAnswered(false);
                setIsCorrect(false);
                setCardAnimation('animateIn');
                setAnswer("");
                setCurrentCountOperationIndex(prev => prev + 1);
            }, 300)
        }, 1500)
    }, [isAnswered, randomCountOperations, currentCountOperationIndex, setResult]);

    useEffect(() => {
        if (isAnswered) return;
        setTimer(initialTimer);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 20) {
                    if (!isAnswered) handleAnswer(answer);
                    clearInterval(interval);
                    return 0;
                }
                return prev - 20;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [isAnswered, initialTimer, answer, handleAnswer]);
    
    useEffect(() => {
        if (currentCountOperationIndex >= randomCountOperations.length - 1) {
            setGameEnded(true);
        }
    }, [currentCountOperationIndex, randomCountOperations.length, setGameEnded])
    return (
        <div className="flex flex-col items-center gap-6 justify-center h-full px-4">
            <div className="text-[20px] font-[600] leading-[24px] text-[#1E1E1E] text-center">{t('test_instructions.ARITHMETIC')}</div>
            <h1>{result}</h1>
            <div
                onClick={() => handleAnswer(answer)}
                className={`${styles[cardAnimation]} cursor-pointer active:scale-[0.97] transition-transform duration-300 relative w-[400px] bg-[#E5EADD] rounded-[12px] h-[120px] flex justify-center items-center
                ${isAnswered && 'border-2'} ${isCorrect ? 'border-[#8DC63F]' : 'border-[#D9452B]'}`}
            >
                {currentCountOperationIndex < randomCountOperations.length-1 && (
                    <div className="w-full flex flex-row items-center justify-center gap-2 text-[24px] font-bold tracking-widest text-[#1E1E1E]">
                        <div>{randomCountOperations[currentCountOperationIndex].firstNumber} {randomCountOperations[currentCountOperationIndex].operation} {randomCountOperations[currentCountOperationIndex].secondNumber} = </div>
                        <input 
                            value={answer}
                            type="number"
                            onChange={(e) => setAnswer(e.target.value)} 
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white text-center rounded-[12px] h-[48px] w-[72px] outline-0 p-2"
                        />
                        <div className={`flex justify-center items-center w-[26px] h-[26px] absolute bottom-2 right-2 rounded-full ${!isAnswered && 'hidden'} ${isCorrect ? 'bg-[#8DC63F]' : 'bg-[#D9452B]'}`}> 
                            {isCorrect ? 
                                // галочка
                                <svg width="13" height="10" viewBox="0 0 13 10" fill="green" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.60059 4.99987L4.90062 8.2999L11.5007 1.69983" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                :
                                // крестик
                                <svg width="26" height="26" viewBox="0 0 26 26" fill="red" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  d="M13 0C20.1799 0 26 5.8201 26 13C26 20.1799 20.1799 26 13 26C5.8201 26 0 20.1799 0 13C0 5.8201 5.8201 0 13 0ZM15.8691 8.8881L13.013 11.739L10.1595 8.8881C10.0111 8.73891 9.81445 8.64753 9.60476 8.63037C9.39507 8.61322 9.18613 8.67141 9.0155 8.7945L8.9063 8.8881C8.82376 8.97024 8.75826 9.06788 8.71356 9.17542C8.66887 9.28295 8.64586 9.39825 8.64586 9.5147C8.64586 9.63115 8.66887 9.74645 8.71356 9.85398C8.75826 9.96152 8.82376 10.0592 8.9063 10.1413L11.7598 12.9922L8.9063 15.8431C8.73994 16.0093 8.64642 16.2347 8.64629 16.4699C8.64623 16.5863 8.66911 16.7016 8.71361 16.8092C8.75811 16.9168 8.82336 17.0146 8.90565 17.0969C8.98794 17.1793 9.08564 17.2447 9.19319 17.2893C9.30073 17.3339 9.41601 17.3569 9.53244 17.357C9.76758 17.3571 9.99314 17.2638 10.1595 17.0976L13.013 14.2441L15.8691 17.0976C16.1811 17.4096 16.666 17.4395 17.0131 17.1899L17.1223 17.0963C17.2048 17.0142 17.2703 16.9165 17.315 16.809C17.3597 16.7015 17.3827 16.5861 17.3827 16.4697C17.3827 16.3532 17.3597 16.2379 17.315 16.1304C17.2703 16.0229 17.2048 15.9252 17.1223 15.8431L14.2675 12.9922L17.121 10.1413C17.2749 9.97288 17.358 9.75159 17.353 9.52347C17.3479 9.29535 17.2551 9.07797 17.0938 8.91654C16.9326 8.75511 16.7153 8.66207 16.4872 8.65677C16.2591 8.65147 16.0377 8.73433 15.8691 8.8881Z" />
                                </svg>
                            }
                        </div>
                    </div>
                )}
            </div>
            <div className="text-[20px] leading-[16px] text-[#1E1E1E] font-[500] text-center">
                {t('game.time_left')}: {Math.ceil(timer / 1000)} {t('game.seconds')}
            </div>
        </div>
    );
};