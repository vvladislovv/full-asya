import { useLanguage } from "@/app/hooks/useLanguage";
import { useCallback, useEffect, useState } from "react";

interface TestComponentProps {
    randomImageWithFirstLetter: {image: string, firstLetter: string}
    restart: () => void;
    setCurrentTestIndex: (index : number) => void;
    currentTestIndex: number;
    onNextTest?: () => void;
    onBackToList?: () => void;
    onSubmitResults?: (answers: Record<string, any>, correctAnswers: number, totalAnswers: number) => void;
}
export const VerbalTestComponent : React.FC<TestComponentProps> = ({randomImageWithFirstLetter, restart, setCurrentTestIndex, currentTestIndex, onNextTest, onBackToList, onSubmitResults}) => {
    const { t } = useLanguage();
    const timer = 3000;
    const [showResult, setShowResult] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [result, setResult] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [fourLetters, setFourLetters] = useState<string[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
    
    // Генерируем 4 случайные буквы, включая правильную
    const generateFourLetters = useCallback(() => {
        const correctLetter = randomImageWithFirstLetter.firstLetter;
        const allPossibleLetters = ['а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'э', 'ю', 'я'];
        const otherLetters = allPossibleLetters.filter(letter => letter !== correctLetter);
        
        // Перемешиваем и берём 3 случайные
        const shuffledOthers = [...otherLetters].sort(() => Math.random() - 0.5).slice(0, 3);
        
        // Добавляем правильную букву и перемешиваем все 4
        const fourRandomLetters = [correctLetter, ...shuffledOthers].sort(() => Math.random() - 0.5);
        setFourLetters(fourRandomLetters);
    }, [randomImageWithFirstLetter.firstLetter]);

    // Генерируем буквы при загрузке компонента
    useEffect(() => {
        generateFourLetters();
    }, [generateFourLetters]);
    
    const handleAnswer = useCallback((answer: string) => {
        if (isAnswered) return;
        
        const correct = answer === randomImageWithFirstLetter.firstLetter;
        
        setIsAnswered(true);
        setSelectedAnswer(answer);
        
        // Сохраняем ответ пользователя
        setUserAnswers(prev => ({
            ...prev,
            [`question_${currentIndex}`]: {
                correctAnswer: randomImageWithFirstLetter.firstLetter,
                userAnswer: answer,
                isCorrect: correct
            }
        }));
        
        // Увеличиваем результат только если выбрана правильная буква
        if (correct) {
            setResult((prev) => prev + 1);
        }
        
        // Показываем результат на 1.5 секунды, затем переходим к следующей карточке
        setTimeout(() => {
            setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
                setIsAnswered(false);
                setSelectedAnswer('');
                generateFourLetters(); // Генерируем новые буквы
            }, 300);
        }, 1500);
    }, [generateFourLetters, isAnswered, randomImageWithFirstLetter.firstLetter])

    const handleRestart = () => {
        setShowResult(false);
        setCurrentIndex(0);
        setResult(0);
        setIsAnswered(false);
        setSelectedAnswer('');

        restart();
    };
    useEffect(() => {
        if (showResult) return;
        if (currentIndex >= 1) { // Только один раунд теста
            // Отправляем результаты перед показом результата
            if (onSubmitResults) {
                onSubmitResults(userAnswers, result, 1);
            }
            setShowResult(true);
            return;
        }
        if (isAnswered) return;
        
        const timeout = setTimeout(() => {
            // Если пользователь не нажал, автоматически засчитываем неправильный ответ
            // Выбираем случайную неправильную букву для отображения
            const wrongAnswer = fourLetters.find(letter => letter !== randomImageWithFirstLetter.firstLetter) || fourLetters[0];
            handleAnswer(wrongAnswer);
        }, timer);
        return () => clearTimeout(timeout);
    }, [showResult, currentIndex, isAnswered, fourLetters, handleAnswer, randomImageWithFirstLetter]);

    if (showResult) {
        return (
            <div>
                <div className="flex flex-col mt-12 h-full">
                    <div className="flex flex-col items-center">
                        <div className="text-[20px] leading-[24px] font-[600] text-[#1E1E1E] mb-8">{t('game.test_result')}</div>
                        <div className="relative bg-[#E0E4E9] w-[178px] h-[178px] rounded-full p-4">
                            <svg className="absolute top-0 left-0 z-20" xmlns="http://www.w3.org/2000/svg" version="1.1" width="178" height="178">
                                <defs>
                                    <linearGradient id="GradientColor" x1="24%" y1="0%" x2="72%" y2="100%">
                                        <stop offset="24.07%" stopColor="#D9452B" />
                                        <stop offset="72.35%" stopColor="#FDB933" />
                                    </linearGradient>
                                </defs>
                                <circle 
                                    cx="89"
                                    cy="89" 
                                    r="81"
                                    fill="none" 
                                    stroke="url(#GradientColor)"
                                    strokeDasharray={2 * Math.PI * 81}
                                    strokeDashoffset={2 * Math.PI * 81 * (1 - result / 1)}
                                    strokeWidth="16"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="bg-[#F2F5F9] w-full rounded-full h-full flex items-center justify-center">
                                <div className="flex flex-col gap-[4px] items-center">
                                    <span className="font-[500] text-[16px] leading-[16px]">{result > 0 ? t('game.correct') : t('game.incorrect')}</span>
                                    <div>
                                        <span className="font-[600] text-[20px] leading-[24px]">{result}/</span>
                                        <span className="font-[500] text-[18px] leading-[24px]">1</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="font-[400] text-[14px] leading-[18px] mt-8 text-center text-gray-600 px-6 max-w-sm">
                            {result > 0 
                                ? t('game.verbal_memory_good')
                                : t('game.verbal_memory_bad')
                            }
                        </p>
                    </div>
                </div>
                <div className="w-full absolute left-0 bottom-0 p-4 flex flex-col gap-2">
                    {onBackToList && (
                        <button onClick={onBackToList} className="cursor-pointer py-[18px] border border-gray-300 rounded-[43px] flex justify-center transition-all duration-300 active:scale-[0.97] bg-gray-50">
                            <span className="text-[16px] font-[500] text-gray-600">{t('game.back_to_list')}</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-32 items-center pt-16 h-full">
            <div className="text-[18px] leading-[20px] font-[600] text-[#1E1E1E] mb-4 text-center px-4">
                {t('game.find_first_letter')}
            </div>
            {/* Кнопки с буквами */}
            <div className="w-full flex gap-1 mb-6">
                {fourLetters.map((letter, index) => {
                    const isCorrectAnswer = letter === randomImageWithFirstLetter.firstLetter;
                    const isSelectedButton = letter === selectedAnswer;
                    
                    return (
                        <button
                            key={index}
                            onClick={() => !isAnswered && handleAnswer(letter)}
                            disabled={isAnswered}
                            className={`
                                relative flex-1 p-10 rounded-lg border-2 text-[28px] font-[600] transition-all duration-300
                                ${!isAnswered ? 'border-[#E5EADD] bg-[#E5EADD] text-[#1E1E1E] hover:border-[#8DC63F] hover:bg-[#8DC63F] hover:text-white active:scale-95 cursor-pointer' : ''}
                                ${isAnswered && isCorrectAnswer ? 'border-[#8DC63F] bg-[#E5EADD] text-[#1E1E1E]' : ''}
                                ${isAnswered && !isCorrectAnswer && isSelectedButton ? 'border-[#D9452B] bg-[#E5EADD] text-[#1E1E1E]' : ''}
                                ${isAnswered && !isCorrectAnswer && !isSelectedButton ? 'border-[#E5EADD] bg-[#E5EADD] text-[#666]' : ''}
                                ${isAnswered ? 'cursor-default' : ''}
                            `}
                        >
                            {letter.toUpperCase()}
                            {/* Иконка результата в правом нижнем углу */}
                            {isAnswered && (isCorrectAnswer || isSelectedButton) && (
                                <div className={`
                                    absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[14px] font-bold
                                    ${isCorrectAnswer ? 'bg-[#8DC63F]' : 'bg-[#D9452B]'}
                                `}>
                                    {isCorrectAnswer ? '✓' : '✕'}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    )
}