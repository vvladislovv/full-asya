"use client";
import { useLanguage } from '@/app/hooks/useLanguage';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { language, setLanguage, isLoading } = useLanguage();

  const languages = {
    ru: { name: 'RU', flag: '🇷🇺' },
    en: { name: 'EN', flag: '🇺🇸' }
  };

  const handleLanguageChange = (newLanguage: 'ru' | 'en') => {
    if (newLanguage === language || isLoading) return;
    setLanguage(newLanguage);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Object.entries(languages).map(([code, lang]) => (
        <button
          key={code}
          onClick={() => handleLanguageChange(code as 'ru' | 'en')}
          disabled={isLoading}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
            ${language === code 
              ? 'bg-[#8DC63F] text-white' 
              : 'bg-white/70 text-gray-700 hover:bg-white/90'
            }
          `}
        >
          <span>{lang.flag}</span>
          <span>{lang.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;