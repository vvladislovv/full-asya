"use client";
import React, { useEffect, useState } from "react";
import { MemoryGameProps } from "../../GameRenderer";
import { TimerComponent } from "../../visual-memory/game/components/TimerComponent";
import { DigitsGameComponent } from "./components/GameComponent";
import { DigitsTestComponent } from "./components/TestComponent";
import "./waves.css";

// Функция для генерации псевдослучайных чисел с seed
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const DigitsVolumeGame: React.FC<MemoryGameProps> = ({currentTestIndex, setCurrentTestIndex}: MemoryGameProps) => {
    // Набор чисел для игры. Можно добавлять или изменять.
    const [randomNumbers, setRandomNumbers] = useState<number[]>([]);

    const [started, setStarted] = useState(false);
    const [ended, setEnded] = useState(false);

    // Функция для генерации нового числа для запоминания
    const generateRandomNumbers = () => {
        const timestamp = Date.now();
        const newNumbers = Array.from({length: 12}, (_, index) => {
            const seed = timestamp + index + currentTestIndex;
            return Math.floor(seededRandom(seed) * 10) + 1;
        });
        setRandomNumbers(newNumbers);
    };

    // Инициализация и обновление при смене уровня
    useEffect(() => {
        generateRandomNumbers();
    }, [currentTestIndex]);

    // Функция перезапуска
    const restart = () => {
        generateRandomNumbers();
        setStarted(false);
        setEnded(false);
    }

    return (
        <div className="relative w-screen h-screen bg-white">
            <div className="absolute top-0 left-0 right-0 z-10 pt-12 pb-4 bg-white">
                <div className="text-[20px] text-center font-[600] text-[#1E1E1E]">
                    {!ended && "Объем цифр"}
                </div>
            </div>
            <div className="pt-20 px-4 pb-4 h-full bg-[#F2F5F9]">
                {!started ? (
                    <TimerComponent started={started} setStarted={setStarted}/>
                ) : 
                !ended ?  (
                    <DigitsGameComponent randomNumbers={randomNumbers} setGameEnded={setEnded}/>
                ) : (
                    <DigitsTestComponent randomNumbers={randomNumbers} restart={restart} setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} />
                )}
            </div>
        </div>
    )
}

export default DigitsVolumeGame;
