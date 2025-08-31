import { useLanguage } from "@/app/hooks/useLanguage";
import { useEffect, useState } from "react";
interface TimerComponentsProps {
    started: boolean,
    setStarted: (state : boolean) => void;
}
export const TimerComponent : React.FC<TimerComponentsProps> = ({started, setStarted}) => {
    const { t } = useLanguage();
    const [timer, setTimer] = useState(4000) // в мс + 1 секунда что бы 0 тоже показывалось
    useEffect(() => {
        if (!started && timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => Math.max(prev - 20, 0))
            }, 20)
            return () => clearInterval(interval)
        } else if (timer <= 0) {
            setStarted(true)
        }
    }, [timer, started, setStarted])
    return (
        <div className="flex items-center justify-center h-full w-full">
            {(() => {
                // Анимация прогресс-дуги SVG
                const radius = 56;
                const circumference = 2 * Math.PI * radius;
                return (
                    <div className="relative w-[128px] h-[128px] flex justify-center items-center">
                        {/* Волны (только снаружи серого круга) */}
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className="absolute top-0 left-0 w-full h-full rounded-full wave z-0"
                                style={{
                                    background: "#8DC63F2E",
                                    animation: `wave 2s ${i * 0.5}s infinite`
                                }}
                            />
                        ))}
                        {/* Серый фон прогресс-бара (защищен от волн) */}
                        <div className="absolute top-0 left-0 w-full h-full p-4 bg-[#E0E4E9] rounded-full z-5"></div>
                        {/* SVG прогресс-бар */}
                        <svg className="absolute top-0 left-0 z-10" xmlns="http://www.w3.org/2000/svg" version="1.1" width="128" height="128">
                            <defs>
                                <linearGradient id="GradientColor" x1="24%" y1="0%" x2="72%" y2="100%">
                                    <stop offset="24.07%" stopColor="#BEED7C" />
                                    <stop offset="72.35%" stopColor="#8DC63F" />
                                </linearGradient>
                            </defs>
                            <circle 
                                cx="64" 
                                cy="64" 
                                r={radius}
                                fill="none" 
                                stroke="url(#GradientColor)"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference * (1 - timer/4000)}
                                strokeWidth="16"
                                strokeLinecap="round"
                                style={{transition: 'stroke-dashoffset 0.02s linear'}}
                            />
                        </svg>
                        {/* Таймер */}
                        <div className="w-full h-full flex justify-center items-center rounded-full z-15 p-4">
                            <div className="w-full h-full flex justify-center items-center rounded-full bg-[#F2F5F9]">
                                <div className="text-[32px] font-[600] text-[#1E1E1E]">
                                    {Math.ceil(timer/1000)-1}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
    </div>
    )
}