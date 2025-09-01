"use client";
import { startTest, submitTestResult } from "@/app/api/services/testService";
import { useLanguage } from "@/app/hooks/useLanguage";
import React, { useCallback, useEffect, useState } from "react";
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

export const CountOperationsGame: React.FC<MemoryGameProps> = ({setCurrentTestIndex, currentTestIndex, test, onNextTest, onBackToList}: MemoryGameProps) => {
    const { t } = useLanguage();
    // Результат
    const [result, setResult] = useState(0);
    // Набор чисел для игры. Можно добавлять или изменять.
    const [randomCountOperations, setRandomCountOperations] = useState<Operation[]>([]);

    const [started, setStarted] = useState(false);
    const [ended, setEnded] = useState(false);
    const [testResultId, setTestResultId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);

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

    // Инициализация теста
    useEffect(() => {
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
    }, [test?.id]);

    // Функция отправки результатов
    const handleSubmitResults = useCallback(async () => {
        if (!testResultId) {
            console.error('Test result ID not found - test may not be initialized properly');
            // Попробуем инициализировать тест снова
            if (test?.id) {
                try {
                    const result = await startTest(test.id);
                    setTestResultId(result.id);
                    setStartTime(Date.now());
                    // Попробуем отправить результаты с новым ID
                    const timeSpent = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
                    await submitTestResult({
                        resultId: result.id,
                        answers: {
                            correct: score,
                            total: 12,
                            details: { finalScore: score }
                        },
                        timeSpent,
                        maxScore: 12
                    });
                    console.log('Результат теста отправлен успешно после переинициализации');
                    return;
                } catch (error) {
                    console.error('Ошибка переинициализации теста:', error);
                }
            }
            return;
        }

        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        
        try {
            await submitTestResult({
                resultId: testResultId,
                answers: {
                    correct: result,
                    total: 12,
                    details: { finalScore: result }
                },
                timeSpent,
                maxScore: 12
            });
            console.log('Результат теста отправлен успешно');
        } catch (error) {
            console.error('Ошибка отправки результата теста:', error);
        }
    }, [testResultId, startTime, result, test?.id]);

    // Отправляем результаты когда тест завершен
    useEffect(() => {
        if (ended && testResultId) {
            handleSubmitResults();
        }
    }, [ended, testResultId, handleSubmitResults]);

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
                    {!ended && t('test_types.ARITHMETIC')}
                </div>
            </div>
            <div className="pt-20 px-4 pb-4 h-full bg-white">
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

