"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTests } from "../api/services/testService";
import { Test } from "../dto/test";
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../providers/useAuth";
import ErrorScreen from "../ui/errorScreen";
import Spinner from "../ui/spinner";
import { GameRenderer, GameTypeEnum } from "./games/GameRenderer";
import TestInformation from "./testInfo/info";



const Tests: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    
    // Функция создания fallback тестов с переводами
    const createFallbackTests = (): Test[] => [
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            type: "VISUAL_MEMORY",
            name: t("test_types.VISUAL_MEMORY", "Визуальная память"),
            description: t("test_descriptions.VISUAL_MEMORY", "Тест для оценки способности запоминать и воспроизводить визуальную информацию"),
            instruction: t("test_instructions.VISUAL_MEMORY", "Вам будут показаны изображения. Запомните их и выберите правильные ответы."),
            difficulty: "medium",
            configuration: {
                questionCount: 10,
                timeLimit: 300,
                scoringMethod: "accuracy"
            },
            isActive: true,
            orderIndex: 1
        },
        {
            id: "550e8400-e29b-41d4-a716-446655440001",
            type: "VERBAL_MEMORY",
            name: t("test_types.VERBAL_MEMORY", "Вербальная память"),
            description: t("test_descriptions.VERBAL_MEMORY", "Тест для оценки способности запоминать и воспроизводить словесную информацию"),
            instruction: t("test_instructions.VERBAL_MEMORY", "Вам будет представлен список слов. Запомните их и воспроизведите."),
            difficulty: "easy",
            configuration: {
                questionCount: 8,
                timeLimit: 240,
                scoringMethod: "recall"
            },
            isActive: true,
            orderIndex: 2
        },
        {
            id: "550e8400-e29b-41d4-a716-446655440002",
            type: "AUDITORY_MEMORY",
            name: t("test_types.AUDITORY_MEMORY", "Рече-слуховая память"),
            description: t("test_descriptions.AUDITORY_MEMORY", "Тест для оценки способности запоминать и воспроизводить слуховую информацию"),
            instruction: t("test_instructions.AUDITORY_MEMORY", "Вам будут озвучены последовательности цифр и слов. Повторите их."),
            difficulty: "medium",
            configuration: {
                questionCount: 6,
                timeLimit: 180,
                scoringMethod: "sequence"
            },
            isActive: true,
            orderIndex: 3
        },
        {
            id: "550e8400-e29b-41d4-a716-446655440003",
            type: "DIGIT_SPAN",
            name: t("test_types.DIGIT_SPAN", "Объём цифр"),
            description: t("test_descriptions.DIGIT_SPAN", "Тест для оценки объема кратковременной памяти для цифровой информации"),
            instruction: t("test_instructions.DIGIT_SPAN", "Вам будут показаны последовательности цифр. Повторите их в правильном порядке."),
            difficulty: "hard",
            configuration: {
                questionCount: 5,
                timeLimit: 150,
                scoringMethod: "adaptive"
            },
            isActive: true,
            orderIndex: 4
        },
        {
            id: "550e8400-e29b-41d4-a716-446655440004",
            type: "VISUAL_ATTENTION",
            name: t("test_types.VISUAL_ATTENTION", "Зрительная память и внимание"),
            description: t("test_descriptions.VISUAL_ATTENTION", "Тест для оценки способности концентрировать внимание на зрительных стимулах"),
            instruction: t("test_instructions.VISUAL_ATTENTION", "Найдите и отметьте целевые объекты среди отвлекающих элементов."),
            difficulty: "medium",
            configuration: {
                questionCount: 12,
                timeLimit: 360,
                scoringMethod: "speed_accuracy"
            },
            isActive: true,
            orderIndex: 5
        },
        {
            id: "550e8400-e29b-41d4-a716-446655440005",
            type: "STROOP_TEST",
            name: t("test_types.STROOP_TEST", "Тест Струпа"),
            description: t("test_descriptions.STROOP_TEST", "Тест для оценки способности к когнитивному контролю и торможению автоматических реакций"),
            instruction: t("test_instructions.STROOP_TEST", "Назовите цвет текста, а не то, что написано."),
            difficulty: "hard",
            configuration: {
                questionCount: 20,
                timeLimit: 120,
                scoringMethod: "interference"
            },
            isActive: true,
            orderIndex: 6
        },
        {
            id: "550e8400-e29b-41d4-a716-446655440006",
            type: "ARITHMETIC",
            name: t("test_types.ARITHMETIC", "Счётные операции"),
            description: t("test_descriptions.ARITHMETIC", "Тест для оценки способности к математическим вычислениям в уме"),
            instruction: t("test_instructions.ARITHMETIC", "Решите математические задачи в уме."),
            difficulty: "medium",
            configuration: {
                questionCount: 15,
                timeLimit: 300,
                scoringMethod: "accuracy_speed"
            },
            isActive: true,
            orderIndex: 7
        },
        {
            id: "550e8400-e29b-41d4-a716-446655440007",
            type: "SYMBOL_MEMORY",
            name: t("test_types.SYMBOL_MEMORY", "Символьная память"),
            description: t("test_descriptions.SYMBOL_MEMORY", "Тест для оценки способности запоминать соответствия между символами и значениями"),
            instruction: t("test_instructions.SYMBOL_MEMORY", "Запомните соответствие символов и цифр, затем преобразуйте символы в цифры."),
            difficulty: "hard",
            configuration: {
                questionCount: 8,
                timeLimit: 240,
                scoringMethod: "coding"
            },
            isActive: true,
            orderIndex: 8
        }
    ];
    
    // состояния, необходимые для первоначальной загрузки тестов с бэка
    const [tests, setTests] = useState<Test[]>([]);
    const [currentTest, setCurrentTest] = useState<Test | null>(null);
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // состояния для навигации по тестам
    const [showTestInfo, setShowTestInfo] = useState(false);
    const [showGame, setShowGame] = useState(false);
    
    const toggleShowGame = () => {
        setShowGame(!showGame);
    };

    // загрузка тестов при монтировании компонента
    useEffect(() => {
        if (authLoading) return; // Ждем завершения авторизации
        
        getTests()
            .then((res: Test[]) => {
                const arr = Array.isArray(res) ? res : Object.values(res);
                if (arr && arr.length > 0) {
                    // console.log("✅ Получены тесты с API:", arr.length);
                    setTests(arr as Test[]);
                } else {
                    // console.log("⚠️ API вернул пустой массив, используем fallback тесты");
                    setTests(createFallbackTests());
                }
            })
            .catch((error) => {
                // console.log("❌ API недоступен, используем fallback тесты:", error);
                setTests(createFallbackTests());
            })
            .finally(() => setLoading(false));
    }, [authLoading, t]); // Добавлена зависимость от переводов

    // Отвечает за навигацию по тестам
    useEffect(() => {
        if (currentTest) {
            setShowTestInfo(true);
        }
    }, [currentTest]);

    // Обработка перехода к следующему тесту
    const handleNextTest = () => {
        const nextIndex = currentTestIndex + 1;
        if (nextIndex < tests.length) {
            setCurrentTestIndex(nextIndex);
            setCurrentTest(tests[nextIndex]);
        } else {
            // Если это последний тест, возвращаемся к списку
            setShowTestInfo(false);
            setShowGame(false);
            setCurrentTest(null);
            setCurrentTestIndex(0);
        }
    };

    // Обработка возврата к списку тестов
    const handleBackToList = () => {
        setShowTestInfo(false);
        setShowGame(false);
        setCurrentTest(null);
        setCurrentTestIndex(0);
    };

    // Показываем загрузку авторизации
    if (authLoading) {
        return (
            <div className="w-screen h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Spinner />
                    <p className="mt-4 text-gray-800">Авторизация...</p>
                </div>
            </div>
        );
    }

    if (error && tests.length === 0) {
        return <ErrorScreen message={error} />;
    }

    if (showTestInfo) {
        if (showGame) {
            return (
                <GameRenderer
                    test={currentTest}
                    currentTestIndex={currentTestIndex}
                    setCurrentTestIndex={setCurrentTestIndex}
                    toggleShowGame={toggleShowGame}
                    type={currentTest?.type as GameTypeEnum}
                    onNextTest={handleNextTest}
                    onBackToList={handleBackToList}
                />
            );
        }
        return (
            <TestInformation
                toggleShowGame={toggleShowGame}
                toggleShowTestInfo={handleBackToList}
                test={currentTest}
            />
        );
    }

    return (
        <div
            className="w-screen h-screen bg-white flex flex-col"
            style={{ fontFamily: "SF Pro Text, Arial, sans-serif" }}
            suppressHydrationWarning
        >
            <div className="w-full bg-white pt-4 pb-4 px-4">
                <div className="relative flex flex-row items-center">
                    <Link
                        href="/"
                        className="active:scale-[0.97] transition-all duration-300 bg-white w-[48px] h-[48px] rounded-full flex justify-center items-center border border-gray-200 shadow-sm"
                    >
                        <Image
                            src="/icons/back.svg"
                            alt="Назад"
                            width={8}
                            height={14}
                            style={{ width: "auto", height: "auto" }}
                        />
                    </Link>
                    <div className="pointer-events-none absolute right-0 left-0 font-[600] text-[20px] leading-[16px] text-center">
                        {t('tests.title')}
                    </div>
                </div>
            </div>
            
            <div className="flex-1 bg-white px-4 pb-6 flex flex-col gap-5">

            {!loading ? (
                <div className="flex flex-col gap-3 flex-1">
                    <div className="text-center mb-2">
                        <p className="text-sm text-gray-800">
                            {user ? `${t('home.greeting')}, ${user.firstName || user.username || t('common.user', 'Пользователь')}!` : t('common.loading')}
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                            Найдено тестов: {tests.length}
                        </p>
                    </div>
                    
                    {tests.map((test, index) => (
                        <button
                            onClick={() => {
                                setCurrentTestIndex(index);
                                setCurrentTest(tests[index]);
                            }}
                            key={test.type}
                            className="flex items-center cursor-pointer w-full active:scale-[0.99] transition-all duration-300 bg-white rounded-[12px] shadow-lg p-3 mb-3"
                        >
                            <div className="w-full flex flex-row justify-between items-center pointer-events-none">
                                <div className="flex flex-col items-start gap-1">
                                    <div className="font-[600] text-[15px] leading-[16px] text-[#1E1E1E]">
                                        {test.name}
                                    </div>
                                    <div className="font-[400] text-[12px] leading-[14px] text-[#666] opacity-70">
                                        {test.description}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-[500] ${
                                            test.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                            test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {t(`tests.difficulty.${test.difficulty}`)}
                                        </span>
                                        <span className="text-[10px] text-[#666] opacity-70">
                                            {test.configuration?.timeLimit ? `${Math.floor(test.configuration.timeLimit / 60)} мин` : '5 мин'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-[#8DC63F] rounded-full w-[32px] h-[32px] flex justify-center items-center">
                                    <Image
                                        src="/icons/next.svg"
                                        alt="Вперед"
                                        width={6}
                                        height={10}
                                        style={{ width: "auto", height: "auto" }}
                                    />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Spinner />
                        <p className="mt-4 text-gray-800">{t('common.loading')}...</p>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default Tests;