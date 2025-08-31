"use client";
import { startTest, submitTestResult } from "@/app/api/services/testService"
import { useLanguage } from "@/app/hooks/useLanguage"
import React, { useCallback, useState } from "react"
import { MemoryGameProps } from "../../GameRenderer"
import { TimerComponent } from "../../visual-memory/game/components/TimerComponent"
import { SymbolMemoryGameComponent } from "./components/GameComponent"
import { SymbolMemoryTestComponent } from "./components/TestComponent"
import "./waves.css"
export type Symbol = {
    name: string,
    symbol: string
}
const SymbolMemoryGame: React.FC<MemoryGameProps> = ({currentTestIndex, setCurrentTestIndex, onNextTest, onBackToList, test}) => {
    const { t } = useLanguage();
    const [testResultId, setTestResultId] = useState<string>('');
    const [startTime, setStartTime] = useState<number>(0);
    const [testError, setTestError] = useState<string>('');
    const symbols : Symbol[] = React.useMemo(() => [
        { name: "star", symbol: "★" },
        { name: "heart", symbol: "❤" },
        { name: "circle", symbol: "●" },
        { name: "triangle", symbol: "▲" },
        { name: "square", symbol: "■" },
        { name: "diamond", symbol: "◆" },
        { name: "arrow up", symbol: "↑" },
        { name: "arrow down", symbol: "↓" },
        { name: "arrow left", symbol: "←" },
        { name: "arrow right", symbol: "→" },
        { name: "check", symbol: "✔" },
        { name: "cross", symbol: "✖" },
    ], [])
    const [started, setStarted] = useState(false)
    const [ended, setEnded] = useState(false);
    const [randomSymbols, setRandomSymbols] = useState<Symbol[]>([]);
    // Функция генерации новых изображений с именами
    const generateNewSymbols = React.useCallback(() => {
        setRandomSymbols(shuffleSymbols(symbols))
    }, [symbols]);
    function shuffleSymbols(newSymbols : Symbol[]) : Symbol[] {
        const shuffled = [...newSymbols].sort(() => Math.random() - 0.5);
        const newRandomSymbols = shuffled.slice(0, 3);
        
        return newRandomSymbols;
    }

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
        generateNewSymbols();
    }, [generateNewSymbols]);

    // Функция для отправки результатов
    const handleSubmitResults = useCallback(async (answers: Record<string, any>, correctAnswers: number, totalAnswers: number) => {
        if (!testResultId) {
            console.error('Нет testResultId для отправки результатов');
            return;
        }
        
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const percentage = Math.round((correctAnswers / totalAnswers) * 100);
        
        console.log('📊 Отправляем результаты теста:', {
            resultId: testResultId,
            correct: correctAnswers,
            total: totalAnswers,
            percentage,
            timeSpent
        });
        
        try {
            const submitResult = await submitTestResult({
                resultId: testResultId,
                answers: {
                    correct: correctAnswers,
                    total: totalAnswers,
                    details: answers,
                    percentage: percentage
                },
                timeSpent,
                maxScore: totalAnswers,
                testType: 'SYMBOL_MEMORY'
            });
            
            console.log('✅ Результат теста успешно отправлен:', submitResult);
            setTestError('');
            
            // Обновляем статистику пользователя
            if (typeof window !== 'undefined') {
                const event = new CustomEvent('testCompleted', {
                    detail: {
                        testType: 'SYMBOL_MEMORY',
                        score: correctAnswers,
                        maxScore: totalAnswers,
                        percentage: percentage,
                        timeSpent: timeSpent
                    }
                });
                window.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error('❌ Ошибка отправки результатов:', error);
            setTestError('Результат сохранен локально, но не отправлен на сервер');
            
            // Даже при ошибке сохраняем локально
            if (typeof window !== 'undefined') {
                const event = new CustomEvent('testCompleted', {
                    detail: {
                        testType: 'SYMBOL_MEMORY',
                        score: correctAnswers,
                        maxScore: totalAnswers,
                        percentage: percentage,
                        timeSpent: timeSpent
                    }
                });
                window.dispatchEvent(event);
            }
        }
    }, [testResultId, startTime]);

    // Функция перезапуска
    const restart = () => {
        generateNewSymbols(); // Генерируем новые случайные картинки
        setStarted(false);
        setEnded(false);
    }

    return (
        <div className="relative w-screen h-screen bg-white">
            <div className="absolute top-0 left-0 right-0 z-10 pt-12 pb-4 bg-white">
                <div className="text-[20px] text-center font-[600] text-[#1E1E1E]">
                    {!ended && t('test_types.SYMBOL_MEMORY', 'Символьная память')}
                </div>
            </div>
            
            {/* Показываем ошибку если есть */}
            {testError && (
                <div className="absolute top-20 left-4 right-4 z-20 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded text-sm">
                    {testError}
                </div>
            )}
            
            <div className="pt-20 px-4 pb-4 h-full bg-white">
                {/* Таймер перед стартом */}
                {!started ? (
                    <TimerComponent started={started} setStarted={setStarted}/>
                ) : 
                !ended ?  ( // Игра
                    <SymbolMemoryGameComponent randomSymbols={randomSymbols} initialTimer={3000} gameEnded={ended} setGameEnded={setEnded}/>
                ) : (
                    <SymbolMemoryTestComponent setCurrentTestIndex={setCurrentTestIndex} restart={restart} allSymbols={symbols} randomSymbols={randomSymbols} onNextTest={onNextTest} onBackToList={onBackToList} onSubmitResults={handleSubmitResults}/>
                )}
            </div>
        </div>
    )
}
export default SymbolMemoryGame