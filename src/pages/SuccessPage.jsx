import { useNavigate } from 'react-router-dom';
import './SuccessPage.css';

export default function SuccessPage() {
    const navigate = useNavigate();
    return (
        <div className="success-wrapper">
            <div className="success-card card fade-in-up">
                <div className="success-icon">💕</div>
                <h1>Thank You!</h1>
                <div className="divider"><span className="diamond">◆</span></div>
                <p className="success-message">
                    Thank you for confirming your attendance 💕<br />
                    We can't wait to celebrate this special day with you.
                </p>
                <p className="success-sub">
                    <em>Sonia &amp; William will see you in Kigali, Rwanda</em>
                </p>
                <div className="success-actions">
                    <button className="btn btn-outline" onClick={() => navigate('/')}>
                        ← Back to Invitation
                    </button>
                </div>
            </div>
        </div>
    );
}
