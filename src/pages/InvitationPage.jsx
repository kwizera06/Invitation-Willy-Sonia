import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InvitationPage.css';

const WEDDING_DATE = new Date('2026-07-26T13:00:00');

function Countdown() {
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
            {[['Days', timeLeft.days], ['Hours', timeLeft.hours], ['Mins', timeLeft.minutes], ['Secs', timeLeft.seconds]].map(([label, val]) => (
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

    return (
        <div className="invitation-wrapper">
            {/* Hero */}
            <section className="hero-section">
                <div className="hero-content fade-in-up">
                    <p className="bible-verse">
                        &ldquo;Therefore what God has joined together, let no one separate.&rdquo;
                        <br />
                        <span className="verse-ref">Mark 10:9</span>
                    </p>
                    <p className="hero-pre">The families of</p>
                    <p className="family-names">UWIMANA Dieudonne &amp; NZABANDORA Malachie</p>
                    <p className="hero-pre">are pleased to invite you to the wedding of their children</p>

                    <h1 className="hero-names">
                        <span>Sonia Uwimana</span>
                        <span className="hero-ampersand">&amp;</span>
                        <span>William Rukundo</span>
                    </h1>

                    <div className="divider"><span className="diamond">◆</span></div>
                    <p className="hero-date">ON JULY 26TH, 2026</p>
                    <p className="hero-location">
                        At Le Belvedere<br />
                        40 des sentier, Wakefield, QC, J0X 3G0
                    </p>
                </div>
            </section>

            {/* Schedule Section */}
            <section className="schedule-section fade-in-up">
                <div className="container">
                    <h2 className="section-title">✨ Order of Events ✨</h2>
                    <div className="schedule-grid">
                        <div className="schedule-item">
                            <span className="time">1:00 PM</span>
                            <span className="event">🌿 Introduction and Dowry</span>
                        </div>
                        <div className="schedule-item">
                            <span className="time">5:00 PM</span>
                            <span className="event">⛪ Religious Wedding Ceremony</span>
                        </div>
                        <div className="schedule-item">
                            <span className="time">6:00 PM</span>
                            <span className="event">🥂 Reception</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Couple info / Contacts */}
            <section className="couple-section">
                <div className="container">
                    <h2 className="section-title">🌸 Contacts 🌸</h2>
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
                                <a href="tel:+16134104707" className="couple-phone">📞 +1 (613) 410-4707</a>
                                <a href="tel:+250788587452" className="couple-phone">📞 +250 788 587 452</a>
                                <a href="tel:+250788805318" className="couple-phone">📞 +250 788 805 318</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Countdown */}
            <section className="countdown-section">
                <div className="container">
                    <h2 className="section-title">⏳ Counting Down to Our Special Day ⏳</h2>
                    <Countdown />
                </div>
            </section>


            {/* RSVP CTA */}
            <section className="rsvp-cta-section">
                <div className="container">
                    <div className="rsvp-cta-card card">
                        <h2>Will You Join Us?</h2>
                        <p>Please let us know if you'll be attending so we can make proper arrangements for your comfort.</p>
                        <button className="btn btn-highlight pulse-animation" onClick={() => navigate('/rsvp')}>
                            💌 Confirm Attendance
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="invitation-footer">
                <p>With Love · Sonia &amp; William · 2026</p>
                <button className="admin-link" onClick={() => navigate('/admin/login')}>Admin</button>
            </footer>
        </div>
    );
}

