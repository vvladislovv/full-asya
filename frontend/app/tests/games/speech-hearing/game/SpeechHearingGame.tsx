"use client";
import React, { useState } from "react";
import { MemoryGameProps } from "../../GameRenderer";
import { TimerComponent } from "../../visual-memory/game/components/TimerComponent";
import { SpeechGameComponent } from "./components/GameComponent";
import { SpeechTestComponent } from "./components/TestComponent";
import "./waves.css";
const SpeechMemoryGame: React.FC<MemoryGameProps> = ({setCurrentTestIndex, currentTestIndex} : MemoryGameProps) => {

    const [started, setStarted] = useState(false)
    const [ended, setEnded] = useState(false);
    const [randomImageWithName, setRandomImageWithName] = useState<{image: string, name: string} | null>(null);
    const [randomImagesWithName, setRandomImagesWithName] = useState<{image: string, name: string}[]>([]);
    // Функция генерации новых изображений с именами
    const generateNewImages = React.useCallback(() => {
        const imagesWithName = [
            { image: 'banana.png', name: 'Банан' },
            { image: 'watermelon.png', name: 'Арбуз' },
            { image: 'apple.png', name: 'Яблоко' },
            { image: 'apricot.png', name: 'Абрикос' },
            { image: 'chery.webp', name: 'Вишня' },
            { image: 'coctail.png', name: 'Коктейль' },
            { image: 'grape.png', name: 'Виноград' },
            { image: 'grusha.png', name: 'Груша' },
            { image: 'injir.png', name: 'Инжир' },
            { image: 'kiwi.png', name: 'Киви' },
            { image: 'lemon.png', name: 'Лемон' },
            { image: 'mango.png', name: 'Манго' },
            { image: 'melon.png', name: 'Дыня' },
            { image: 'mushroom.png', name: 'Гриб' },
            { image: 'orange.webp', name: 'Апельсин' },
            { image: 'peach.png', name: 'Персик' },
            { image: 'pineapple.png', name: 'Ананас' },
            { image: 'shark.png', name: 'Акула' },
            { image: 'strawberry.webp', name: 'Клубника' }
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
                    {!ended && "Рече-слуховая память"}
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
                    randomImageWithName && <SpeechTestComponent setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} restart={restart} randomImageWithName={randomImageWithName} allImagesWithName={randomImagesWithName}/>
                )}
            </div>
        </div>
    )
}
export default SpeechMemoryGame