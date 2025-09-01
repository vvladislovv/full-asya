"use client";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useEffect, useState } from "react";
import styles from './CardAnimations.module.css';
interface GameComponentProps {
    randomNumbers: number[];
    setGameEnded: (state: boolean) => void;
}

export const DigitsGameComponent: React.FC<GameComponentProps> = ({ randomNumbers, setGameEnded }) => {
    const { t } = useLanguage();
    const [timer, setTimer] = useState(3000); // 3 секунды на запоминание
    const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
    const [cardAnimation, setCardAnimation] = useState('animateIn');

    useEffect(() => {
        if (currentNumberIndex >= randomNumbers.length) {
            setGameEnded(true);
            return;
        }
        setTimer(3000);
        setCardAnimation('animateIn');
    }, [currentNumberIndex, randomNumbers.length, setGameEnded]);

    useEffect(() => {
        if (currentNumberIndex >= randomNumbers.length) return;
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 20) {
                    setCardAnimation('animateOut');
                    clearInterval(interval);
                    return 0;
                }
                return prev - 20;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [currentNumberIndex, randomNumbers.length]);

    useEffect(() => {
        if (cardAnimation === 'animateOut') {
            const timeout = setTimeout(() => {
                setCurrentNumberIndex((prev) => prev + 1);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [cardAnimation]);

    return (
        <div className="flex flex-col items-center gap-6 justify-center h-full px-4">
            <div className="text-[20px] font-[600] leading-[24px] text-[#1E1E1E] text-center">Запомните число</div>
            <div className={`${styles.card} ${styles[cardAnimation]} relative w-full bg-[#E5EADD] rounded-[8px] h-1/2 flex justify-center items-center`}>
                {currentNumberIndex < randomNumbers.length && (
                    <span className="text-[48px] font-bold tracking-widest text-[#1E1E1E]">
                        {randomNumbers[currentNumberIndex]}
                    </span>
                )}
            </div>
            <div className="text-[20px] leading-[16px] text-[#1E1E1E] font-[500] text-center">
                {t('game.time_left')}: {Math.ceil(timer / 1000)} {t('game.seconds')}
            </div>
        </div>
    );
};