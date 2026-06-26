// LanguageSwitcher.tsx
import { useState } from 'react';
import USFlag from 'assets/icons/us.svg';
import VNFlag from 'assets/icons/vn.svg';
import { useIntl } from 'react-intl';

const flagMap: Record<string, string> = {
  vn: VNFlag,
  us: USFlag
};

const LanguageSwitcher: React.FC = () => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', countryCode: 'VN' },
    { code: 'en', name: 'English', countryCode: 'US' }
  ];

  const currentLanguage = languages.find((lang) => lang.code === intl.locale) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    if (langCode !== intl.locale) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setIsOpen(false);
      }, 300);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          min-w-[150px] relative group flex items-center space-x-2 justify-between px-3 py-2 
          bg-gradient-to-r from-white to-gray-50 
          border border-gray-200 rounded-lg shadow-sm 
          hover:shadow-md hover:border-blue-300 
          transition-all duration-300 ease-in-out
          ${isOpen ? 'ring-2 ring-blue-400/50 shadow-lg' : ''}
          ${isAnimating ? 'animate-pulse' : ''}
        `}
      >
        <div className="flex items-center space-x-2">
          <img
            src={flagMap[currentLanguage.countryCode.toLowerCase()]}
            alt={currentLanguage.name}
            style={{
              width: '25px',
              height: '20px',
              borderRadius: '0.25rem',
              objectFit: 'cover'
            }}
            title={currentLanguage.name}
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
            {currentLanguage.name}
          </span>
        </div>

        <svg
          className={`w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 overflow-hidden">
            {languages.map((language, index) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  relative w-full px-3 py-3 text-left flex items-center space-x-3
                  transition-all duration-200 ease-in-out
                  ${intl.locale === language.code ? 'text-blue-700' : 'text-gray-700 hover:text-blue-600'}
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === languages.length - 1 ? 'rounded-b-lg' : ''}
                `}
              >
                {intl.locale === language.code && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                )}

                <img
                  src={flagMap[language.countryCode.toLowerCase()]}
                  alt={language.name}
                  style={{
                    width: '25px',
                    height: '20px',
                    borderRadius: '0.25rem',
                    objectFit: 'cover',
                    marginLeft: '0.5rem'
                  }}
                  title={language.name}
                />

                <span className="font-medium flex-1">{language.name}</span>

                {intl.locale === language.code && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
