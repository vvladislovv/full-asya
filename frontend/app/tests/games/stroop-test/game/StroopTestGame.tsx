"use client";
import { useLanguage } from "@/app/hooks/useLanguage";
import React, { useState } from "react";
import { MemoryGameProps } from "../../GameRenderer";
import { TimerComponent } from "../../visual-memory/game/components/TimerComponent";
import { StroopTestGameComponent } from "./components/GameComponent";
import { StoopTestResultComponent } from "./components/ResultComponent";
import "./waves.css";

const StroopTestGame: React.FC<MemoryGameProps> = ({setCurrentTestIndex, currentTestIndex}) => {
    const { t } = useLanguage();
    const colors = React.useMemo(() => [
        { name: "красный", color: "#FF0000" },
        { name: "оранжевый", color: "#FFA500" },
        { name: "желтый", color: "#FFFF00" },
        { name: "зеленый", color: "#008000" },
        { name: "голубой", color: "#00BFFF" },
        { name: "синий", color: "#0000FF" },
        { name: "фиолетовый", color: "#800080" },
        { name: "черный", color: "#000000" },
        { name: "белый", color: "#FFFFFF" },
        { name: "серый", color: "#808080" },
        { name: "коричневый", color: "#8B4513" },
        { name: "розовый", color: "#FFC0CB" },
    ], []);
    const [started, setStarted] = useState(false)
    const [ended, setEnded] = useState(false);
    const [result, setResult] = useState(0);
    const [randomColors, setRandomColors] = useState<{name: string, color: string}[]>([]);
    // Функция генерации новых изображений с именами
    const generateNewImages = React.useCallback(() => {
        // перемешиваем массив с цветами при перезагрузке
        console.log(shuffleColorPairs(colors))
        setRandomColors(shuffleColorPairs(colors))
    }, [colors]);
    function shuffleColorPairs(colors : {name: string, color: string}[]) {
        const names = colors.map(c => c.name);
        const colorValues = colors.map(c => c.color);

        // Перемешиваем массив цветов
        const shuffledColors = [...colorValues].sort(() => Math.random() - 0.5);

        // Собираем новый массив где названия и цвет перемешаны
        return names.map((name, i) => {
            const shouldMatch = Math.random() < 0.35;
            return {
                name,
                color: shouldMatch ? colorValues[i] : shuffledColors[i],
            }
        })
    }

    // Инициализация при первой загрузке
    React.useEffect(() => {
        generateNewImages();
    }, [generateNewImages]);

    // Функция перезапуска
    const restart = () => {
        generateNewImages(); // Генерируем новые случайные картинки
        setStarted(false);
        setResult(0);
        setEnded(false);
    }

    return (
        <div className="relative w-screen h-screen bg-white">
            <div className="absolute top-0 left-0 right-0 z-10 pt-12 pb-4 bg-white">
                <div className="text-[20px] text-center font-[600] text-[#1E1E1E]">
                    {!ended && t('test_types.STROOP_TEST', 'Тест Струпа')}
                </div>
            </div>
            <div className="pt-20 px-4 pb-4 h-full bg-[#F2F5F9]">
                {/* Таймер перед стартом */}
                {!started ? (
                    <TimerComponent started={started} setStarted={setStarted}/>
                ) : 
                !ended ?  ( // Игра
                    <StroopTestGameComponent result={result} setResult={setResult} initialColors={colors} randomColors={randomColors} initialTimer={3000} setGameEnded={setEnded}/>
                ) : (
                    <StoopTestResultComponent setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} restart={restart} result={result} />
                )}
            </div>
        </div>
    )
}
export default StroopTestGame