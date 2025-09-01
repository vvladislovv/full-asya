"use client";
import { useEffect, useState } from 'react';
import { getTests, startTest, submitTestResult } from '../api/services/testService';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../providers/useAuth';

interface TestConfig {
    type: string;
    name: string;
    testId: string;
    minScore: number;
    maxScore: number;
}

// Будем получать реальные ID тестов из API, а пока используем эти как fallback
const AUTO_TESTS: TestConfig[] = [
    { type: 'VISUAL_MEMORY', name: 'Визуальная память', testId: '', minScore: 5, maxScore: 10 },
    { type: 'VERBAL_MEMORY', name: 'Вербальная память', testId: '', minScore: 4, maxScore: 8 },
    { type: 'AUDITORY_MEMORY', name: 'Рече-слуховая память', testId: '', minScore: 3, maxScore: 6 },
    { type: 'DIGIT_SPAN', name: 'Объём цифр', testId: '', minScore: 2, maxScore: 5 },
    { type: 'VISUAL_ATTENTION', name: 'Зрительная память и внимание', testId: '', minScore: 7, maxScore: 12 },
    { type: 'STROOP_TEST', name: 'Тест Струпа', testId: '', minScore: 10, maxScore: 20 },
    { type: 'ARITHMETIC', name: 'Счётные операции', testId: '', minScore: 8, maxScore: 15 },
    { type: 'SYMBOL_MEMORY', name: 'Символьная память', testId: '', minScore: 4, maxScore: 8 }
];

interface AutoTestRunnerProps {
    onComplete: () => void;
}

const AutoTestRunner: React.FC<AutoTestRunnerProps> = ({ onComplete }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [completedTests, setCompletedTests] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTest, setCurrentTest] = useState<TestConfig | null>(null);
    const [log, setLog] = useState<string[]>([]);
    const [testsLoaded, setTestsLoaded] = useState(false);
    const [realTests, setRealTests] = useState<TestConfig[]>(AUTO_TESTS);

    // Загружаем реальные тесты из API при инициализации
    useEffect(() => {
        const loadRealTests = async () => {
            try {
                addLog('Загружаем список тестов из API...');
                const tests = await getTests();
                
                if (tests && tests.length > 0) {
                    const updatedTests = AUTO_TESTS.map(autoTest => {
                        const realTest = tests.find(t => t.type === autoTest.type);
                        return realTest ? { ...autoTest, testId: realTest.id } : null;
                    }).filter(test => test !== null) as TestConfig[];
                    
                    if (updatedTests.length > 0) {
                        setRealTests(updatedTests);
                        addLog(`✅ Загружено ${updatedTests.length} реальных тестов из API`);
                    } else {
                        addLog('⚠️ Не удалось сопоставить тесты с API');
                        setRealTests([]);
                    }
                } else {
                    addLog('⚠️ API не вернул тесты, тесты недоступны');
                    setRealTests([]);
                }
            } catch (error) {
                addLog(`❌ Ошибка загрузки тестов: ${error}`);
            } finally {
                setTestsLoaded(true);
            }
        };

        if (user) {
            loadRealTests();
        }
    }, [user]);

    const addLog = (message: string) => {
        setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
        console.log(`🤖 AutoTest: ${message}`);
    };

    const runSingleTest = async (testConfig: TestConfig): Promise<boolean> => {
        try {
            addLog(`Начинаю тест: ${testConfig.name}`);
            
            // Проверяем, что у нас есть правильный testId
            if (!testConfig.testId) {
                addLog(`❌ У теста ${testConfig.name} отсутствует testId, пропускаем`);
                return false;
            }
            
            // Начинаем тест
            const testResult = await startTest(testConfig.testId);
            addLog(`Тест начат с ID: ${testResult.id}`);
            
            // Генерируем случайные результаты
            const randomScore = Math.floor(Math.random() * (testConfig.maxScore - testConfig.minScore + 1)) + testConfig.minScore;
            const totalQuestions = testConfig.maxScore;
            const percentage = Math.round((randomScore / totalQuestions) * 100);
            
            // Имитируем время выполнения
            const timeSpent = Math.floor(Math.random() * 120) + 30; // 30-150 секунд
            
            addLog(`Генерирую результат: ${randomScore}/${totalQuestions} (${percentage}%)`);
            
            // Отправляем результат
            const submitResult = await submitTestResult({
                resultId: testResult.id,
                answers: {
                    correct: randomScore,
                    total: totalQuestions,
                    details: {
                        autoGenerated: true,
                        timestamp: new Date().toISOString()
                    }
                },
                timeSpent,
                maxScore: totalQuestions,
                emotionalState: {
                    mood: ['excellent', 'good', 'neutral'][Math.floor(Math.random() * 3)]
                }
            });
            
            addLog(`Результат отправлен: ${percentage}% за ${timeSpent}с`);
            return true;
            
        } catch (error) {
            addLog(`Ошибка в тесте ${testConfig.name}: ${error}`);
            return false;
        }
    };

    const runAllTests = async () => {
        if (!user) {
            addLog('Ошибка: пользователь не авторизован');
            return;
        }

        setIsRunning(true);
        addLog('Начинаю автоматическое прохождение всех тестов...');
        
        const completed: string[] = [];
        const testsToRun = testsLoaded && realTests.length > 0 ? realTests : [];
        
        if (testsToRun.length === 0) {
            addLog('❌ Нет доступных тестов для запуска');
            setIsRunning(false);
            return;
        }
        
        for (let i = 0; i < testsToRun.length; i++) {
            const test = testsToRun[i];
            
            // Проверяем, что у теста есть правильный testId
            if (!test.testId) {
                addLog(`⚠️ Пропускаем тест ${test.name} - отсутствует testId`);
                continue;
            }
            
            setCurrentTestIndex(i);
            setCurrentTest(test);
            setProgress(Math.round((i / testsToRun.length) * 100));
            
            const success = await runSingleTest(test);
            
            if (success) {
                completed.push(test.type);
                addLog(`✅ Тест ${test.name} завершен успешно`);
            } else {
                addLog(`❌ Тест ${test.name} провален`);
            }
            
            setCompletedTests([...completed]);
            
            // Пауза между тестами
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        setProgress(100);
        setIsRunning(false);
        addLog(`🎉 Автотестирование завершено! Пройдено ${completed.length} из ${testsToRun.length} тестов`);
        
        // Обновляем статистику
        if (typeof window !== 'undefined') {
            const event = new CustomEvent('allTestsCompleted', {
                detail: {
                    totalTests: testsToRun.length,
                    completedTests: completed.length,
                    testTypes: completed
                }
            });
            window.dispatchEvent(event);
        }
        
        // Завершаем через 3 секунды
        setTimeout(() => {
            onComplete();
        }, 3000);
    };

    if (!user) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Автотестирование</h2>
                <p className="text-red-600">Для запуска автотестов необходимо войти в систему</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-center mb-6">
                    🤖 Автоматическое тестирование {realTests.length > 0 ? `${realTests.length} тестов` : 'тестов'}
                </h1>
                
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Прогресс</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {currentTest && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-800">
                            Текущий тест: {currentTest.name}
                        </h3>
                        <p className="text-sm text-blue-600">
                            Тест {currentTestIndex + 1} из {realTests.length}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {realTests.length > 0 ? realTests.map((test, index) => (
                        <div 
                            key={test.type}
                            className={`p-3 rounded-lg border ${
                                completedTests.includes(test.type) 
                                    ? 'bg-green-50 border-green-200' 
                                    : currentTestIndex === index && isRunning
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{test.name}</span>
                                <span className="text-sm">
                                    {completedTests.includes(test.type) && '✅'}
                                    {currentTestIndex === index && isRunning && '⏳'}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {test.minScore}-{test.maxScore} баллов
                                {test.testId && <span className="ml-2 text-green-600">✓ API</span>}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                            {testsLoaded ? 'Нет доступных тестов для автотестирования' : 'Загрузка тестов...'}
                        </div>
                    )}
                </div>

                <div className="text-center mb-6">
                    <button
                        onClick={runAllTests}
                        disabled={isRunning || !testsLoaded || realTests.length === 0}
                        className={`px-8 py-3 rounded-lg font-semibold ${
                            isRunning || !testsLoaded || realTests.length === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                    >
                        {isRunning ? 'Выполняется...' : 
                         !testsLoaded ? 'Загрузка...' : 
                         realTests.length === 0 ? 'Нет доступных тестов' : 
                         `Запустить все тесты (${realTests.length})`}
                    </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <h4 className="font-semibold mb-2">Лог выполнения:</h4>
                    {log.length === 0 ? (
                        <p className="text-gray-500 text-sm">Логи появятся здесь после запуска тестов</p>
                    ) : (
                        <div className="space-y-1">
                            {log.map((entry, index) => (
                                <div key={index} className="text-xs font-mono text-gray-700">
                                    {entry}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AutoTestRunner;
