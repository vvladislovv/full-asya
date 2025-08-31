"use client";
import { startTest, submitTestResult } from "@/app/api/services/testService";
import { useLanguage } from "@/app/hooks/useLanguage";
import React, { useCallback, useEffect, useState } from "react";
import { MemoryGameProps } from "../../GameRenderer";
import { GameComponent } from "./components/GameComponent";
import { TestComponent } from "./components/TestComponent";
import { TimerComponent } from "./components/TimerComponent";
import "./waves.css";
const VisualMemoryGame: React.FC<MemoryGameProps> = ({setCurrentTestIndex, currentTestIndex, test, onNextTest, onBackToList}: MemoryGameProps) => {
    const { t } = useLanguage();
    const questionAmount = test?.configuration.questionCount;
    const timer = test?.configuration.timeLimit

    const [started, setStarted] = useState(false)
    const [ended, setEnded] = useState(false);
    const [randomImages, setRandomImages] = useState<string[]>([]);
    const [testImages, setTestImages] = useState<string[]>([]);
    const [testResultId, setTestResultId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);

    // Функция генерации новых изображений
    const generateNewImages = useCallback(() => {
        const images = ['banana.png', 'watermelon.png', 'apple.png', 'apricot.png', 'chery.webp', 'coctail.png', 'grape.png', 'grusha.png', 'injir.png', 'kiwi.png', 'lemon.png', 'mango.png', 'melon.png', 'mushroom.png', 'orange.webp', 'peach.png', 'pineapple.png', 'shark.png', 'strawberry.webp']
        const shuffled = [...images].sort(() => Math.random() - 0.5);
        const newRandomImages = shuffled.slice(0, questionAmount).map(img => `/images/${img}`);
        const newTestImages = images.map(img => `/images/${img}`);
        setRandomImages(newRandomImages);
        setTestImages(newTestImages);
    }, [questionAmount]);

    // Инициализация при первой загрузке и старт теста
    useEffect(() => {
        generateNewImages();
        
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
    }, [generateNewImages, test?.id]);

    // Функция отправки результатов
    const handleSubmitResults = useCallback(async (answers: Record<string, any>, correctAnswers: number, totalAnswers: number) => {
        if (!testResultId) {
            console.error('Test result ID not found');
            return;
        }

        const timeSpent = Math.floor((Date.now() - startTime) / 1000); // в секундах
        
        try {
            await submitTestResult({
                resultId: testResultId,
                answers: {
                    correct: correctAnswers,
                    total: totalAnswers,
                    details: answers,
                    percentage: Math.round((correctAnswers / totalAnswers) * 100)
                },
                timeSpent,
                maxScore: totalAnswers,
                emotionalState: { mood: 'neutral' },
                testType: 'VISUAL_MEMORY'
            });
            console.log('Результат теста отправлен успешно');
        } catch (error) {
            console.error('Ошибка отправки результата теста:', error);
        }
    }, [testResultId, startTime]);

    // Функция перезапуска
    const restart = () => {
        generateNewImages(); // Генерируем новые случайные картинки
        setStarted(false);
        setEnded(false);
        setStartTime(Date.now()); // Сбрасываем время начала
    }

    return (
        <div className="relative w-screen h-screen bg-white">
            <div className="absolute top-0 left-0 right-0 z-10 pt-12 pb-4 bg-white">
                <div className="text-[20px] text-center font-[600] text-[#1E1E1E]">
                    {!ended && t('game.memory_diagnostics')}
                </div>
            </div>
            <div className="pt-20 px-4 pb-4 h-full bg-white">
                {/* Таймер перед стартом */}
                {!started ? (
                    <TimerComponent started={started} setStarted={setStarted}/>
                ) : 
                !ended ?  ( // Игра
                    <GameComponent randomImages={randomImages} initialTimer={20000} gameEnded={ended} setGameEnded={setEnded}/>
                ) : (
                    <TestComponent initialTimer={timer ?? null} setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} restart={restart} allImages={testImages} randomImages={randomImages} onNextTest={onNextTest} onBackToList={onBackToList} onSubmitResults={handleSubmitResults} />
                )}
            </div>
        </div>
    )
}
export default VisualMemoryGame