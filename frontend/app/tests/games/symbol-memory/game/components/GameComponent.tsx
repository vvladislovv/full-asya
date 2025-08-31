import { useEffect, useState } from "react";
import type { Symbol } from "../SymbolMemoryGame";
interface GameComponentProps {
    initialTimer: number,
    randomSymbols: Symbol[],
    gameEnded: boolean,
    setGameEnded: (state : boolean) => void;
}
export const SymbolMemoryGameComponent : React.FC<GameComponentProps> = ({initialTimer, setGameEnded, gameEnded, randomSymbols}: GameComponentProps) => {
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
            <div className="text-[20px] font-[600] leading-[16px] text-[#1E1E1E]">Запомните символы</div>
            <div className="w-full grid grid-cols-3 gap-x-2 gap-y-2">
                {randomSymbols.map((symbol, index) => (
                    <div key={index} className="relative bg-[#E5EADD] rounded-[8px] h-[110px] flex justify-center items-center">
                        {symbol.symbol}
                    </div>
                ))}
            </div>
            <div className="text-[20px] leading-[16px] text-[#1E1E1E] font-[500] text-center">Осталось: {Math.ceil(timer / 1000) - 1} секунд</div>
        </div>
    )
}