import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const current = (i18n.language || 'en').split('-')[0];
        if (current === 'en') {
            i18n.changeLanguage('fr');
        } else if (current === 'fr') {
            i18n.changeLanguage('rw');
        } else {
            i18n.changeLanguage('en');
        }
    };

    const getLangLabel = () => {
        const current = (i18n.language || 'en').split('-')[0];
        if (current === 'rw') return '🇷🇼 RW';
        if (current === 'fr') return '🇫🇷 FR';
        return '🇬🇧 EN';
    };

    return (
        <div className="language-switcher">
            <button onClick={toggleLanguage} className="lang-btn fade-in" title="Switch Language">
                {getLangLabel()}
            </button>
        </div>
    );
}
