import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('rw') ? 'en' : 'rw';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="language-switcher">
            <button onClick={toggleLanguage} className="lang-btn fade-in" title="Switch Language">
                {i18n.language.startsWith('rw') ? '🇬🇧 EN' : '🇷🇼 RW'}
            </button>
        </div>
    );
}
