"use client";
import { startTest, submitTestResult } from "@/app/api/services/testService"
import { useLanguage } from "@/app/hooks/useLanguage"
import React, { useCallback, useEffect, useState } from "react"
import { MemoryGameProps } from "../../GameRenderer"
import { TimerComponent } from "../../visual-memory/game/components/TimerComponent"
import { EyeGameComponent } from "./components/GameComponent"
import { EyeTestComponent } from "./components/TestComponent"
import "./waves.css"
const EyeMemoryGame: React.FC<MemoryGameProps> = ({setCurrentTestIndex, currentTestIndex, test, onNextTest, onBackToList}) => {
    const { t } = useLanguage();
    const [started, setStarted] = useState(false)
    const [ended, setEnded] = useState(false);
    const [randomWords, setRandomWords] = useState<string[]>([]);
    const [testWords, setTestWords] = useState<string[]>([]);
    const [testResultId, setTestResultId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);

    // Инициализация теста
    useEffect(() => {
        const initializeTest = async () => {
            if (test?.id) {
                try {
                    const result = await startTest(test.id) as { id: string };
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
    const handleSubmitResults = useCallback(async (answers: Record<string, any>, correctAnswers: number, totalAnswers: number) => {
        if (!testResultId) {
            console.error('Test result ID not found - test may not be initialized properly');
            // Попробуем инициализировать тест снова
            if (test?.id) {
                try {
                    const result = await startTest(test.id) as { id: string };
                    setTestResultId(result.id);
                    setStartTime(Date.now());
                    // Попробуем отправить результаты с новым ID
                    const timeSpent = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
                    await submitTestResult({
                        resultId: result.id,
                        answers: {
                            correct: correctAnswers,
                            total: totalAnswers,
                            details: answers
                        },
                        timeSpent,
                        maxScore: totalAnswers
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
    }, [testResultId, startTime, test?.id]);

    // Функция генерации новых слов
    const generateNewWords = React.useCallback(() => {
        const words = ['banana', 'watermelon', 'apple', 'apricot', 'cherry', 'cocktail', 'grape', 'pear', 'fig', 'kiwi', 'lemon', 'mango', 'melon', 'mushroom', 'orange', 'peach', 'pineapple', 'shark', 'strawberry', 'berry'];
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        const newRandomWords = shuffled.slice(0, 6);
        const newTestWords = [...words];
        setRandomWords(newRandomWords);
        setTestWords(newTestWords);
    }, []);

    // Инициализация при первой загрузке
    React.useEffect(() => {
        generateNewWords();
    }, [generateNewWords]);

    // Функция перезапуска
    const restart = () => {
        generateNewWords(); // Генерируем новые случайные слова
        setStarted(false);
        setEnded(false);
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
                    <EyeGameComponent randomWords={randomWords} initialTimer={20000} gameEnded={ended} setGameEnded={setEnded}/>
                ) : (
                    <EyeTestComponent setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} restart={restart} allWords={testWords} randomWords={randomWords} onNextTest={onNextTest} onBackToList={onBackToList} onSubmitResults={handleSubmitResults} />
                )}
            </div>
        </div>
    )
}
export default EyeMemoryGame