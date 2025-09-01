import { useLanguage } from "@/app/hooks/useLanguage";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from './Equalizer.module.css';
interface GameComponentProps {
    initialTimer: number,
    randomImageWithName: {image : string, name : string},
    gameEnded: boolean,
    setGameEnded: (state : boolean) => void;
}
export const SpeechGameComponent : React.FC<GameComponentProps> = ({initialTimer, setGameEnded, gameEnded, randomImageWithName}: GameComponentProps) => {
    const { t } = useLanguage();
    const [timer, setTimer] = useState(initialTimer);
    const [voiced, setVoiced] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const BAR_COUNT = 64;

    function handleOnRecord(word : string) {
        if (window.speechSynthesis.speaking) {
            return;
        }
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.onstart = () => {
            setIsSpeaking(true);
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            setVoiced(true); // Отмечаем, что озвучка завершена
        };
        utterance.onerror = () => {
            setIsSpeaking(false); // Также останавливаем анимацию при ошибке
        };
        window.speechSynthesis.speak(utterance);
    }
    useEffect(() => {
        if (voiced) return;
        handleOnRecord(randomImageWithName.name);
    }, [voiced, randomImageWithName.name])
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
        <div className="flex flex-col items-center gap-6 justify-center h-full w-full px-4">
            <div 
                className="relative w-[80px] h-[80px] rounded-full p-2"
                style={{background: 'linear-gradient(222.88deg, #BEED7C 24.07%, #8DC63F 72.35%)'}}
            >
                <div className="w-full h-full bg-[#F2F5F9] rounded-full flex justify-center items-center overflow-hidden">
                    <Image src="/icons/music.svg" alt={t('game.music')} width="32" height="32" style={{ width: 'auto', height: 'auto' }} />
                </div>
            </div>

            {/* Контейнер для эквалайзера/точек */}
            <div className="w-full h-[50px] px-4">
                {isSpeaking ? (
                    <div className={styles.equalizer}>
                        {Array.from({ length: BAR_COUNT }).map((_, i) => (
                            <div
                                key={i}
                                className={styles.bar}
                                style={{ animationDelay: `${Math.random() * 0.8}s` }}
                            ></div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.dotsContainer}>
                        {Array.from({ length: BAR_COUNT }).map((_, i) => (
                            <div key={i} className={styles.dot}></div>
                        ))}
                    </div>
                )}
            </div>

            <div className="text-[20px] leading-[16px] text-[#1E1E1E] font-[500] text-center">{t('game.time_left')}: {Math.ceil(timer / 1000) - 1} {t('game.seconds')}</div>
        </div>
    )
}