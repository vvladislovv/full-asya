"use client";
import { startTest, submitTestResult } from "@/app/api/services/testService";
import { useLanguage } from "@/app/hooks/useLanguage";
import React, { useCallback, useEffect, useState } from "react";
import { MemoryGameProps } from "../../GameRenderer";
import { TimerComponent } from "../../visual-memory/game/components/TimerComponent";
import { StroopTestGameComponent } from "./components/GameComponent";
import { StoopTestResultComponent } from "./components/ResultComponent";
import "./waves.css";

const StroopTestGame: React.FC<MemoryGameProps> = ({setCurrentTestIndex, currentTestIndex, test, onNextTest, onBackToList}) => {
    const { t } = useLanguage();
    const colors = React.useMemo(() => [
        { name: t("colors.красный"), color: "#FF0000" },
        { name: t("colors.оранжевый"), color: "#FFA500" },
        { name: t("colors.желтый"), color: "#FFFF00" },
        { name: t("colors.зеленый"), color: "#008000" },
        { name: t("colors.голубой"), color: "#00BFFF" },
        { name: t("colors.синий"), color: "#0000FF" },
        { name: t("colors.фиолетовый"), color: "#800080" },
        { name: t("colors.черный"), color: "#000000" },
        { name: t("colors.белый"), color: "#FFFFFF" },
        { name: t("colors.серый"), color: "#808080" },
        { name: t("colors.коричневый"), color: "#8B4513" },
        { name: t("colors.розовый"), color: "#FFC0CB" },
    ], [t]);
    const [started, setStarted] = useState(false)
    const [ended, setEnded] = useState(false);
    const [result, setResult] = useState(0);
    const [randomColors, setRandomColors] = useState<{name: string, color: string}[]>([]);
    const [testResultId, setTestResultId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);
    
    // Инициализация цветов при первом рендере
    useEffect(() => {
        if (randomColors.length === 0) {
            console.log(shuffleColorPairs(colors))
            setRandomColors(shuffleColorPairs(colors))
        }
    }, [colors, randomColors.length]);

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
                            correct: result,
                            total: 12,
                            details: { finalScore: result }
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
    
    // Функция генерации новых изображений с именами
    const generateNewImages = React.useCallback(() => {
        // перемешиваем массив с цветами при перезагрузке
        const newColors = shuffleColorPairs(colors);
        console.log(newColors);
        setRandomColors(newColors);
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
                    {!ended && t('test_types.STROOP_TEST')}
                </div>
            </div>
            <div className="pt-20 px-4 pb-4 h-full bg-white">
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