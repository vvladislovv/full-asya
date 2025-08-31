"use client";
import React, { useEffect, useState } from "react";
import { MemoryGameProps } from "../../GameRenderer";
import { TimerComponent } from "../../visual-memory/game/components/TimerComponent";
import { CountOperationsGameComponent } from "./components/GameComponent";
import { CountOperationsResultComponent } from "./components/ResultComponent";
import "./waves.css";

export type Operation = {
    operation: string,
    firstNumber: number,
    secondNumber: number,
}

const operations = ["*", "/", "+", "-"];

// Функция для генерации псевдослучайных чисел с seed
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export const CountOperationsGame: React.FC<MemoryGameProps> = ({setCurrentTestIndex, currentTestIndex, onNextTest, onBackToList}: MemoryGameProps) => {
    // Результат
    const [result, setResult] = useState(0);
    // Набор чисел для игры. Можно добавлять или изменять.
    const [randomCountOperations, setRandomCountOperations] = useState<Operation[]>([]);

    const [started, setStarted] = useState(false);
    const [ended, setEnded] = useState(false);

    // Функция для генерации нового числа для запоминания
    const generateRandomCountOperations = () => {
        const timestamp = Date.now();
        const newOperations = Array.from({length: 12}, (_, index) => {
            const seed = timestamp + index + currentTestIndex;
            return {
                operation: operations[Math.floor(seededRandom(seed) * 4)],
                firstNumber: Math.floor(seededRandom(seed + 1) * 10) + 1,
                secondNumber: Math.floor(seededRandom(seed + 2) * 10) + 1
            };
        });
        setRandomCountOperations(newOperations);
    };

    // Инициализация и обновление при смене уровня
    useEffect(() => {
        generateRandomCountOperations();
    }, [currentTestIndex]);

    // Функция перезапуска
    const restart = () => {
        generateRandomCountOperations();
        setStarted(false);
        setEnded(false);
    }

    return (
        <div className="relative w-screen h-screen bg-white">
            <div className="absolute top-0 left-0 right-0 z-10 pt-12 pb-4 bg-white">
                <div className="text-[20px] text-center font-[600] text-[#1E1E1E]">
                    {!ended && "Счётные операции"}
                </div>
            </div>
            <div className="pt-20 px-4 pb-4 h-full bg-[#F2F5F9]">
                {!started ? (
                    <TimerComponent started={started} setStarted={setStarted}/>
                ) : 
                !ended ?  (
                    <CountOperationsGameComponent result={result} setResult={setResult} randomCountOperations={randomCountOperations} setGameEnded={setEnded}/>
                ) : (
                    <CountOperationsResultComponent setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} result={result} restart={restart} onNextTest={onNextTest} onBackToList={onBackToList} />
                )}
            </div>
        </div>
    )
}

