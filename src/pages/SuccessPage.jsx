import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SuccessPage.css';

export default function SuccessPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
        <div className="success-wrapper">
            <div className="success-card card fade-in-up">
                <div className="success-icon">💕</div>
                <h1>{t('thank_you')}</h1>
                <div className="divider"><span className="diamond">◆</span></div>
                <p className="success-message">
                    {t('success_message')}
                </p>
                <p className="success-sub">
                    <em>{t('success_sub')} <a 
                        href="https://www.google.com/maps/search/?api=1&query=Le+Belvedere+40+des+sentier+Wakefield+QC+J0X+3G0" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="address-link"
                    >
                        {t('venue_address')}
                    </a></em>
                </p>
                <div className="success-actions">
                    <button className="btn btn-outline" onClick={() => navigate('/')}>
                        ← {t('back_to_invitation')}
                    </button>
                </div>
            </div>
        </div>
    );
}
