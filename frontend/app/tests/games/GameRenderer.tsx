import { Test } from "@/app/dto/test";
import Image from "next/image";
import { CountOperationsGame } from "./count-operations/game/CountOperationsGame";
import DigitsVolumeGame from "./digits-volume/game/DigitsVolumeGame";
import EyeMemoryGame from "./eye-memory/game/EyeMemoryGame";
import SpeechMemoryGame from "./speech-hearing/game/SpeechHearingGame";
import StroopTestGame from "./stroop-test/game/StroopTestGame";
import SymbolMemoryGame from "./symbol-memory/game/SymbolMemoryGame";
import VerbalMemoryGame from "./verbal-memory/game/VerbalMemoryGame";
import VisualMemoryGame from "./visual-memory/game/VisualMemoryGame";

export interface MemoryGameProps {
    setCurrentTestIndex: (index: number) => void;
    currentTestIndex: number;
    test?: Test | null;
    onNextTest?: () => void;
    onBackToList?: () => void;
};
export type GameTypeEnum = "VISUAL_MEMORY" | "VERBAL_MEMORY" | "AUDITORY_MEMORY" | "DIGIT_SPAN" | "VISUAL_ATTENTION" | "STROOP_TEST" | "ARITHMETIC" | "SYMBOL_MEMORY";
interface GameRendererProps {
    type: GameTypeEnum;
    toggleShowGame: () => void;
    setCurrentTestIndex: (index : number) => void;
    currentTestIndex: number;
    test?: Test | null;
    onNextTest?: () => void;
    onBackToList?: () => void;
}
export const GameRenderer : React.FC<GameRendererProps> = ({type, test, toggleShowGame, setCurrentTestIndex, currentTestIndex, onNextTest, onBackToList} : GameRendererProps) => {
    function renderGame() {
        switch (type) {
            case "VISUAL_MEMORY":
                return <VisualMemoryGame test={test} setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} onNextTest={onNextTest} onBackToList={onBackToList}/>
            case "VERBAL_MEMORY":
                return <VerbalMemoryGame test={test} setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} onNextTest={onNextTest} onBackToList={onBackToList}/>
            case "AUDITORY_MEMORY":
                return <SpeechMemoryGame setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} onNextTest={onNextTest} onBackToList={onBackToList}/>
            case "DIGIT_SPAN":
                return <DigitsVolumeGame test={test} setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} onNextTest={onNextTest} onBackToList={onBackToList}/>
            case "VISUAL_ATTENTION":
                return <EyeMemoryGame setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} onNextTest={onNextTest} onBackToList={onBackToList}/>
            case "STROOP_TEST":
                return <StroopTestGame setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} onNextTest={onNextTest} onBackToList={onBackToList}/>
            case "ARITHMETIC":
                return <CountOperationsGame setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} onNextTest={onNextTest} onBackToList={onBackToList}/>
            case "SYMBOL_MEMORY":
                return <SymbolMemoryGame test={test} setCurrentTestIndex={setCurrentTestIndex} currentTestIndex={currentTestIndex} onNextTest={onNextTest} onBackToList={onBackToList}/>
            default:
                return null;
        }
    }
    return (
        <div className="w-screen h-screen relative">
            <button 
                onClick={() => toggleShowGame()}
                className="fixed top-4 left-4 hover:cursor-pointer active:scale-[0.95] transition-all duration-300 w-[48px] h-[48px] rounded-full bg-[white] flex justify-center items-center"
                style={{zIndex: 1}}
            >
                <Image src="/icons/back.svg"  alt="Назад" width={10} height={14} style={{ width: 'auto', height: 'auto' }} />
            </button>
            {renderGame()}
        </div>
    )
}