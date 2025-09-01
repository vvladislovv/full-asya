import { useLanguage } from "@/app/hooks/useLanguage";
import Image from "next/image";
import { useEffect, useState } from "react";
interface GameComponentProps {
    initialTimer: number,
    randomImageWithFirstLetter: {image : string, firstLetter : string},
    gameEnded: boolean,
    setGameEnded: (state : boolean) => void;
}
export const VerbalGameComponent : React.FC<GameComponentProps> = ({initialTimer, setGameEnded, gameEnded, randomImageWithFirstLetter}: GameComponentProps) => {
    const { t } = useLanguage();
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
            <div className="text-[20px] font-[600] leading-[16px] text-[#1E1E1E]">{t('test_instructions.VERBAL_MEMORY')}</div>
                <div className="relative w-full md:w-1/2 bg-[#E5EADD] rounded-[8px] h-1/2 flex justify-center items-center gap-2">
                    <Image src={randomImageWithFirstLetter.image} alt={t('game.image_alt')} width="200" height="200" style={{objectFit: 'cover', width: 'auto', height: 'auto'}}/>
                </div>
            <div className="text-[20px] leading-[16px] text-[#1E1E1E] font-[500] text-center">{t('game.time_left')}: {Math.ceil(timer / 1000) - 1} {t('game.seconds')}</div>
        </div>
    )
}