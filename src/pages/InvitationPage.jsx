import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InvitationPage.css';

const WEDDING_DATE = new Date('2026-07-26T14:00:00');

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
                    <p className="hero-pre">You are cordially invited to</p>
                    <h1 className="hero-names">
                        <span>Sonia</span>
                        <span className="hero-ampersand">&amp;</span>
                        <span>William</span>
                    </h1>
                    <p className="hero-surname">Uwimana · Rukundo</p>
                    <div className="divider"><span className="diamond">◆</span></div>
                    <p className="hero-date">July 26, 2026</p>
                    <p className="hero-location">📍 Kigali, Rwanda</p>
                </div>
            </section>

            {/* Invitation message */}
            <section className="message-section">
                <div className="container">
                    <blockquote className="invitation-quote fade-in-up">
                        <p>
                            &ldquo;Together with their families,<br />
                            <strong>  Sonia Uwimana &amp; William Rukundo</strong><br />
                            joyfully invite you to celebrate their wedding.<br />
                            Your presence will make our day truly special.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </section>

            {/* Couple info */}
            <section className="couple-section">
                <div className="container">
                    <div className="couple-grid">

                        <div className="couple-card fade-in-up">
                            <div className="couple-icon">👰</div>
                            <h3>Sonia Uwimana</h3>
                            <p className="couple-role">Bride</p>
                            <a href="tel:+14383088742" className="couple-phone">📞 +1 (438) 308-8742</a>
                        </div>
                        <div className="couple-hearts">
                            <span>💍</span>
                        </div>
                        <div className="couple-card fade-in-up">
                            <div className="couple-icon">🤵</div>
                            <h3>William Rukundo</h3>
                            <p className="couple-role">Groom</p>
                            <a href="tel:+14382266238" className="couple-phone">📞 +1 (438) 226-6238</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Countdown */}
            <section className="countdown-section">
                <div className="container">
                    <h2 className="section-title">Counting Down to Our Special Day</h2>
                    <Countdown />
                </div>
            </section>

            {/* RSVP CTA */}
            <section className="rsvp-cta-section">
                <div className="container">
                    <div className="rsvp-cta-card card">
                        <h2>Will You Join Us?</h2>
                        <p>Please let us know if you'll be attending so we can make proper arrangements for your comfort.</p>
                        <button className="btn btn-outline" onClick={() => navigate('/rsvp')}>
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
