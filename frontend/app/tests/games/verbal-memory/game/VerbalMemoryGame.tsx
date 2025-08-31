"use client";
import { startTest, submitTestResult } from "@/app/api/services/testService";
import React, { useCallback, useState } from "react";
import { MemoryGameProps } from "../../GameRenderer";
import { TimerComponent } from "../../visual-memory/game/components/TimerComponent";
import { VerbalGameComponent } from "./components/GameComponent";
import { VerbalTestComponent } from "./components/TestComponent";
import "./waves.css";
const VerbalMemoryGame: React.FC<MemoryGameProps> = ({setCurrentTestIndex, currentTestIndex, onNextTest, onBackToList, test} : MemoryGameProps) => {

    const [started, setStarted] = useState(false)
    const [ended, setEnded] = useState(false);
    const [randomImageWithFirstLetter, setRandomImageWithFirstLetter] = useState<{image: string, firstLetter: string} | null>(null);
    const [testResultId, setTestResultId] = useState<string>('');
    const [startTime, setStartTime] = useState<number>(0);

    // Функция генерации новых изображений с первыми буквами
    const generateNewImages = useCallback(() => {
        const imagesWithFirstLetter = [
            { image: 'banana.png', firstLetter: 'б' },
            { image: 'watermelon.png', firstLetter: 'а' },
            { image: 'apple.png', firstLetter: 'я' },
            { image: 'apricot.png', firstLetter: 'а' },
            { image: 'chery.webp', firstLetter: 'в' },
            { image: 'coctail.png', firstLetter: 'к' },
            { image: 'grape.png', firstLetter: 'в' },
            { image: 'grusha.png', firstLetter: 'г' },
            { image: 'injir.png', firstLetter: 'и' },
            { image: 'kiwi.png', firstLetter: 'к' },
            { image: 'lemon.png', firstLetter: 'л' },
            { image: 'mango.png', firstLetter: 'м' },
            { image: 'melon.png', firstLetter: 'д' },
            { image: 'mushroom.png', firstLetter: 'г' },
            { image: 'orange.webp', firstLetter: 'а' },
            { image: 'peach.png', firstLetter: 'п' },
            { image: 'pineapple.png', firstLetter: 'а' },
            { image: 'shark.png', firstLetter: 'а' },
            { image: 'strawberry.webp', firstLetter: 'к' }
        ];
        const shuffled = [...imagesWithFirstLetter].sort(() => Math.random() - 0.5);
        const newRandomImage = shuffled[0]; // Берём только первый элемент
        setRandomImageWithFirstLetter({
            image: `/images/${newRandomImage.image}`,
            firstLetter: newRandomImage.firstLetter
        })
    }, []);

    // Инициализация теста
    React.useEffect(() => {
        if (test && started && !testResultId) {
            startTest(test.id).then((result: any) => {
                setTestResultId(result.id);
                setStartTime(Date.now());
            }).catch((error) => {
                console.error('Ошибка начала теста:', error);
            });
        }
    }, [test, started, testResultId]);

    // Инициализация при первой загрузке
    React.useEffect(() => {
        generateNewImages();
    }, [generateNewImages]);

    // Функция для отправки результатов
    const handleSubmitResults = useCallback(async (answers: Record<string, any>, correctAnswers: number, totalAnswers: number) => {
        if (!testResultId) return;
        
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
        } catch (error) {
            console.error('Ошибка отправки результатов:', error);
        }
    }, [testResultId, startTime]);

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
                    {!ended && "Вербальная память"}
                </div>
            </div>
            <div className="pt-20 px-4 pb-4 h-full bg-[#F2F5F9]">
                {/* Таймер перед стартом */}
                {!started ? (
                    <TimerComponent started={started} setStarted={setStarted}/>
                ) : 
                !ended ?  ( // Игра
                    randomImageWithFirstLetter && <VerbalGameComponent randomImageWithFirstLetter={randomImageWithFirstLetter} initialTimer={4000} gameEnded={ended} setGameEnded={setEnded}/>
                ) : (
                    randomImageWithFirstLetter && <VerbalTestComponent setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} restart={restart} randomImageWithFirstLetter={randomImageWithFirstLetter} onNextTest={onNextTest} onBackToList={onBackToList} onSubmitResults={handleSubmitResults} />
                )}
            </div>
        </div>
    )
}
export default VerbalMemoryGame