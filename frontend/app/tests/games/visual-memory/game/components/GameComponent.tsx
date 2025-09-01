import { useLanguage } from "@/app/hooks/useLanguage";
import Image from "next/image";
import { useEffect, useState } from "react";
interface GameComponentProps {
    initialTimer: number,
    randomImages: string[],
    gameEnded: boolean,
    setGameEnded: (state : boolean) => void;
}
export const GameComponent : React.FC<GameComponentProps> = ({initialTimer, setGameEnded, gameEnded, randomImages}: GameComponentProps) => {
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
            <div className="text-[20px] font-[600] leading-[16px] text-[#1E1E1E]">{t('game.remember_images')}</div>
            <div className="w-full grid grid-cols-3 gap-x-2 gap-y-2">
                {randomImages.map((image, index) => (
                    <div key={index} className="relative bg-[#E5EADD] rounded-[8px] h-[110px] flex justify-center items-center">
                        <Image 
                            src={image} 
                            alt={t('game.image_alt')} 
                            width="86" 
                            height="86"
                            style={{ width: 'auto', height: 'auto' }}
                            onError={(e) => {
                                console.error('Image failed to load:', image);
                                e.currentTarget.src = '/images/apple.png'; // fallback image
                            }}
                            priority
                        />
                    </div>
                ))}
            </div>
            <div className="text-[20px] leading-[16px] text-[#1E1E1E] font-[500] text-center">{t('game.time_left')}: {Math.ceil(timer / 1000) - 1} {t('game.seconds')}</div>
        </div>
    )
}