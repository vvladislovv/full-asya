"use client";
import { startTest, submitTestResult } from "@/app/api/services/testService";
import { useLanguage } from "@/app/hooks/useLanguage";
import React, { useCallback, useEffect, useState } from "react";
import { MemoryGameProps } from "../../GameRenderer";
import { TimerComponent } from "../../visual-memory/game/components/TimerComponent";
import { SpeechGameComponent } from "./components/GameComponent";
import { SpeechTestComponent } from "./components/TestComponent";
import "./waves.css";
const SpeechMemoryGame: React.FC<MemoryGameProps> = ({setCurrentTestIndex, currentTestIndex, test, onNextTest, onBackToList} : MemoryGameProps) => {
    const { t } = useLanguage();

    const [started, setStarted] = useState(false)
    const [ended, setEnded] = useState(false);
    const [randomImageWithName, setRandomImageWithName] = useState<{image: string, name: string} | null>(null);
    const [randomImagesWithName, setRandomImagesWithName] = useState<{image: string, name: string}[]>([]);
    const [testResultId, setTestResultId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);
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
    const handleSubmitResults = useCallback(async (answers: Record<string, any>, correctAnswers: number, totalAnswers: number) => {
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
    }, [testResultId, startTime]);

    // Функция генерации новых изображений с именами
    const generateNewImages = React.useCallback(() => {
        const imagesWithName = [
            { image: 'banana.png', name: 'Banana' },
            { image: 'watermelon.png', name: 'Watermelon' },
            { image: 'apple.png', name: 'Apple' },
            { image: 'apricot.png', name: 'Apricot' },
            { image: 'chery.webp', name: 'Cherry' },
            { image: 'coctail.png', name: 'Cocktail' },
            { image: 'grape.png', name: 'Grape' },
            { image: 'grusha.png', name: 'Pear' },
            { image: 'injir.png', name: 'Fig' },
            { image: 'kiwi.png', name: 'Kiwi' },
            { image: 'lemon.png', name: 'Lemon' },
            { image: 'mango.png', name: 'Mango' },
            { image: 'melon.png', name: 'Melon' },
            { image: 'mushroom.png', name: 'Mushroom' },
            { image: 'orange.webp', name: 'Orange' },
            { image: 'peach.png', name: 'Peach' },
            { image: 'pineapple.png', name: 'Pineapple' },
            { image: 'shark.png', name: 'Shark' },
            { image: 'strawberry.webp', name: 'Strawberry' }
        ];
        const shuffled = [...imagesWithName].sort(() => Math.random() - 0.5);
        const newRandomImage = shuffled[0]; // Берём только первый элемент
        setRandomImageWithName({
            image: `/images/${newRandomImage.image}`,
            name: newRandomImage.name
        });
        setRandomImagesWithName(
            shuffled.map((item) => ({
                image: `/images/${item.image}`,
                name: item.name
            }))
        );
    }, []);

    // Инициализация при первой загрузке
    React.useEffect(() => {
        generateNewImages();
    }, [generateNewImages]);

    // Функция перезапуска
    const restart = () => {
        generateNewImages(); // Генерируем новые случайные картинки
        setStarted(false);
        setEnded(false);
    }

    return (
        <div className="relative w-screen h-screen bg-white">
            <div className="absolute top-0 left-0 right-0 z-10 pt-12 pb-4 bg-white">
                <div className="text-[20px] text-center font-[600] text-[#1E1E1E]">
                    {!ended && t('test_types.AUDITORY_MEMORY')}
                </div>
            </div>
            <div className="pt-20 px-4 pb-4 h-full bg-white">
                {/* Таймер перед стартом */}
                {!started ? (
                    <TimerComponent started={started} setStarted={setStarted}/>
                ) : 
                !ended ?  ( // Игра
                    randomImageWithName && <SpeechGameComponent randomImageWithName={randomImageWithName} initialTimer={4000} gameEnded={ended} setGameEnded={setEnded}/>
                ) : (
                    randomImageWithName && <SpeechTestComponent setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} restart={restart} randomImageWithName={randomImageWithName} allImagesWithName={randomImagesWithName} onNextTest={onNextTest} onBackToList={onBackToList} onSubmitResults={handleSubmitResults}/>
                )}
            </div>
        </div>
    )
}
export default SpeechMemoryGame