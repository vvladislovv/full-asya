"use client";
import { startTest, submitTestResult } from "@/app/api/services/testService";
import React, { useCallback, useEffect, useState } from "react";
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

const DigitsVolumeGame: React.FC<MemoryGameProps> = ({currentTestIndex, setCurrentTestIndex, test, onNextTest, onBackToList}: MemoryGameProps) => {
    // Набор чисел для игры. Можно добавлять или изменять.
    const [randomNumbers, setRandomNumbers] = useState<number[]>([]);
    const [testResultId, setTestResultId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);

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
        
        // Начинаем тест при загрузке компонента
        const initializeTest = async () => {
            if (test?.id) {
                try {
                    const result = await startTest(test.id);
                    setTestResultId(result.id);
                    setStartTime(Date.now());
                } catch (error) {
                    console.error('Ошибка начала теста:', error);
                }
            }
        };
        
        initializeTest();
    }, [currentTestIndex, test?.id]);

    // Функция отправки результатов
    const handleSubmitResults = useCallback(async (answers: Record<string, any>, correctAnswers: number, totalAnswers: number) => {
        if (!testResultId) {
            console.error('Test result ID not found');
            return;
        }

        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        
        try {
            await submitTestResult({
                resultId: testResultId,
                answers: {
                    correct: correctAnswers,
                    total: totalAnswers,
                    details: answers
                },
                timeSpent,
                maxScore: totalAnswers
            });
            console.log('Результат теста отправлен успешно');
        } catch (error) {
            console.error('Ошибка отправки результата теста:', error);
        }
    }, [testResultId, startTime]);

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
            <div className="pt-20 px-4 pb-4 h-full bg-white">
                {!started ? (
                    <TimerComponent started={started} setStarted={setStarted}/>
                ) : 
                !ended ?  (
                    <DigitsGameComponent randomNumbers={randomNumbers} setGameEnded={setEnded}/>
                ) : (
                    <DigitsTestComponent randomNumbers={randomNumbers} restart={restart} setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} onNextTest={onNextTest} onBackToList={onBackToList} onSubmitResults={handleSubmitResults} />
                )}
            </div>
        </div>
    )
}

export default DigitsVolumeGame;
