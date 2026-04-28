import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './InvitationPage.css';

const WEDDING_DATE = new Date('2026-07-26T13:00:00');

function Countdown() {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const calc = () => {
            const diff = WEDDING_DATE - new Date();
            if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            setTimeLeft({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            });
        };
        calc();
        const timer = setInterval(calc, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="countdown">
            {[[t('days'), timeLeft.days], [t('hours'), timeLeft.hours], [t('mins'), timeLeft.minutes], [t('secs'), timeLeft.seconds]].map(([label, val]) => (
                <div className="countdown-unit" key={label}>
                    <span className="countdown-value">{String(val ?? 0).padStart(2, '0')}</span>
                    <span className="countdown-label">{label}</span>
                </div>
            ))}
        </div>
    );
}

export default function InvitationPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="invitation-wrapper">
            {/* Hero */}
            <section className="hero-section">
                <div className="hero-content fade-in-up">
                    <p className="bible-verse">
                        &ldquo;{t('bible_verse')}&rdquo;
                        <br />
                        <span className="verse-ref">{t('verse_ref')}</span>
                    </p>
                    <p className="hero-pre">{t('families_of')}</p>
                    <p className="family-names">UWIMANA Dieudonne &amp; NZABANDORA Malachie</p>
                    <p className="hero-pre">{t('invite_text')}</p>

                    <h1 className="hero-names">
                        <span>Sonia Uwimana</span>
                        <span className="hero-ampersand">&amp;</span>
                        <span>William Rukundo</span>
                    </h1>

                    <div className="divider"><span className="diamond">◆</span></div>
                    <p className="hero-date">{t('wedding_date')}</p>
                    <p className="hero-location">
                        {t('location_at')}<br />
                        40 des sentier, Wakefield, QC, J0X 3G0
                    </p>
                </div>
            </section>

            {/* Schedule Section */}
            <section className="schedule-section fade-in-up">
                <div className="container">
                    <h2 className="section-title">{t('order_events')}</h2>
                    <div className="schedule-grid">
                        <div className="schedule-item">
                            <span className="time">1:00 PM</span>
                            <span className="event">{t('event_intro')}</span>
                        </div>
                        <div className="schedule-item">
                            <span className="time">5:00 PM</span>
                            <span className="event">{t('event_wedding')}</span>
                        </div>
                        <div className="schedule-item">
                            <span className="time">6:00 PM</span>
                            <span className="event">{t('event_reception')}</span>
                        </div>
                    </div>
                </div>
            </section>

            
            {/* Countdown */}
            <section className="countdown-section">
                <div className="container">
                    <h2 className="section-title">{t('countdown_title')}</h2>
                    <Countdown />
                </div>
            </section>


            {/* RSVP CTA */}
            <section className="rsvp-cta-section">
                <div className="container">
                    <div className="rsvp-cta-card card">
                        <h2>{t('rsvp_cta_title')}</h2>
                        <p>{t('rsvp_cta_text')}</p>
                        <button className="btn btn-highlight pulse-animation" onClick={() => navigate('/rsvp')}>
                            💌 {t('confirm_attendance')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Couple info / Contacts */}
            <section className="couple-section">
                <div className="container">
                    <h2 className="section-title">{t('contacts')}</h2>
                    <div className="couple-grid">
                        <div className="couple-card fade-in-up">
                            <div className="couple-icon">👰</div>
                            <h3>Sonia</h3>
                            <div className="phone-list">
                                <a href="tel:+18733760044" className="couple-phone">📞 +1 (873) 376-0044</a>
                                <a href="tel:+14386866478" className="couple-phone">📞 +1 (438) 686-6478</a>
                                <a href="tel:+18195764250" className="couple-phone">📞 +1 (819) 576-4250</a>
                            </div>
                        </div>

                        <div className="couple-hearts">
                            <span>💍</span>
                        </div>

                        <div className="couple-card fade-in-up">
                            <div className="couple-icon">🤵</div>
                            <h3>William</h3>
                            <div className="phone-list">
                                <a href="tel:+14382266238" className="couple-phone">📞 +1 (438) 226-6238</a>
                                <a href="tel:+250788587452" className="couple-phone">📞 +250 788 587 452</a>
                                <a href="tel:+250788805318" className="couple-phone">📞 +250 788 805 318</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Footer */}
            <footer className="invitation-footer">
                <p>{t('with_love')}</p>
                <button className="admin-link" onClick={() => navigate('/admin/login')}>{t('admin')}</button>
            </footer>
        </div>
    );
}
