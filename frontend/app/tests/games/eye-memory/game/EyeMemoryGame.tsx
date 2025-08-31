"use client";
import React, { useState } from "react";
import { MemoryGameProps } from "../../GameRenderer";
import { TimerComponent } from "../../visual-memory/game/components/TimerComponent";
import { EyeGameComponent } from "./components/GameComponent";
import { EyeTestComponent } from "./components/TestComponent";
import "./waves.css";
const EyeMemoryGame: React.FC<MemoryGameProps> = ({setCurrentTestIndex, currentTestIndex}) => {
    const [started, setStarted] = useState(false)
    const [ended, setEnded] = useState(false);
    const [randomWords, setRandomWords] = useState<string[]>([]);
    const [testWords, setTestWords] = useState<string[]>([]);

    // Функция генерации новых слов
    const generateNewWords = React.useCallback(() => {
        const words = ['банан', 'арбуз', 'яблоко', 'абрикос', 'вишня', 'коктейль', 'виноград', 'груша', 'инжир', 'киви', 'лимон', 'манго', 'дыня', 'гриб', 'апельсин', 'персик', 'ананас', 'акула', 'клубника', 'ягода'];
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
                    {!ended && "Диагностика памяти"}
                </div>
            </div>
            <div className="pt-20 px-4 pb-4 h-full bg-[#F2F5F9]">
                {/* Таймер перед стартом */}
                {!started ? (
                    <TimerComponent started={started} setStarted={setStarted}/>
                ) : 
                !ended ?  ( // Игра
                    <EyeGameComponent randomWords={randomWords} initialTimer={20000} gameEnded={ended} setGameEnded={setEnded}/>
                ) : (
                    <EyeTestComponent setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} restart={restart} allWords={testWords} randomWords={randomWords} />
                )}
            </div>
        </div>
    )
}
export default EyeMemoryGame