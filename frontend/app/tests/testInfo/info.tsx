import { Test } from "@/app/dto/test";
import { useLanguage } from "@/app/hooks/useLanguage";
import Image from "next/image";
interface TestInformationProps {
    test: Test | null,
    toggleShowGame: () => void;
    toggleShowTestInfo: () => void;
}
const TestInformation : React.FC<TestInformationProps> = ({test, toggleShowGame, toggleShowTestInfo} : TestInformationProps) => {
    const { t } = useLanguage();
    return (
        <div className="relative w-screen h-screen bg-white">
            <div className="w-full bg-white pt-4 pb-6 px-6">
                <button
                    onClick={() => toggleShowTestInfo()}
                    className="cursor-pointer active:scale-[0.97] transition-all duration-300 bg-white w-[48px] h-[48px] rounded-full flex justify-center items-center border border-gray-200 shadow-sm"
                >
                    <Image 
                        src="/icons/back.svg" 
                        className="pointer-events-none" 
                        alt="Назад" 
                        width={8} 
                        height={14}
                        style={{ width: 'auto', height: 'auto' }}
                    />
                </button>
            </div>
            <div className="w-full flex justify-center px-6">
                <Image 
                    className="w-full max-w-md rounded-[16px] shadow-lg" 
                    src="/images/manager1.png" 
                    alt="Менеджер задний фон" 
                    width={375} 
                    height={266}
                    style={{ width: 'auto', height: 'auto' }}
                />
            </div>
            <div className="relative w-full px-6 pt-6 pb-6 flex flex-col gap-4 items-center">
                <h1 className="font-[600] text-[20px] leading-[16px]">{test?.name}</h1>
                <p className="font-[400] text-[14px] leading-[16px] text-center">
                    {test?.description}
                </p>
                <p className="font-[400] text-[14px] leading-[16px] text-center mb-2">{test?.instruction}</p>
                <button 
                    onClick={() => toggleShowGame()}
                    className="relative overflow-hidden text-center cursor-pointer active:scale-[0.97] hover:scale-[1.02] transition-all duration-300 bg-gradient-to-r from-[#8DC63F] to-[#7BB62D] hover:from-[#7BB62D] hover:to-[#6AA025] w-full rounded-[43px] py-[18px] shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#8DC63F]/30"
                >
                    <span className="relative text-white font-[600] text-[16px] leading-[16px] tracking-wide">
                        {t('tests.start_test')}
                    </span>
                </button>
            </div>
        </div>  
    )
}
export default TestInformation