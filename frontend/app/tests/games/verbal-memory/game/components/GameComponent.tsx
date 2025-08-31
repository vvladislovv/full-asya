import Image from "next/image";
import { useEffect, useState } from "react";
interface GameComponentProps {
    initialTimer: number,
    randomImageWithFirstLetter: {image : string, firstLetter : string},
    gameEnded: boolean,
    setGameEnded: (state : boolean) => void;
}
export const VerbalGameComponent : React.FC<GameComponentProps> = ({initialTimer, setGameEnded, gameEnded, randomImageWithFirstLetter}: GameComponentProps) => {
    const [timer, setTimer] = useState(initialTimer);
    
    useEffect(() => {
        if (!gameEnded && timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => Math.max(prev-20, 0))
            }, 20)
            return () => clearInterval(interval)
        } else if (timer <= 0) {
            setGameEnded(true);
        }
    }, [timer, gameEnded, setGameEnded])
    
    return (
        <div className="flex flex-col items-center gap-6 justify-center h-full px-4">
            <div className="text-[20px] font-[600] leading-[16px] text-[#1E1E1E]">Запомните картинки и их первые буквы</div>
                <div className="relative w-full md:w-1/2 bg-[#E5EADD] rounded-[8px] h-1/2 flex justify-center items-center gap-2">
                    <Image src={randomImageWithFirstLetter.image} alt="Картинка" width="200" height="200" style={{objectFit: 'cover', width: 'auto', height: 'auto'}}/>
                </div>
            <div className="text-[20px] leading-[16px] text-[#1E1E1E] font-[500] text-center">Осталось: {Math.ceil(timer / 1000) - 1} секунд</div>
        </div>
    )
}