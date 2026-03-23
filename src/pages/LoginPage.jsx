import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { verifyAdmin } from '../api';
import './LoginPage.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Verify credentials by calling the authenticated endpoint
            await verifyAdmin(credentials.username, credentials.password);
            // Store in sessionStorage for this session
            sessionStorage.setItem('adminUser', credentials.username);
            sessionStorage.setItem('adminPass', credentials.password);
            navigate('/admin');
        } catch (err) {
            if (err.response?.status === 401) {
                setError(t('invalid_login'));
            } else {
                setError(t('conn_error'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container fade-in-up">
                <div className="login-header">
                    <div className="login-icon">🔐</div>
                    <h1>{t('admin_login')}</h1>
                    <p>{t('admin_dashboard_title')}</p>
                </div>

                <form className="card login-card" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">{t('username')}</label>
                        <input
                            id="username"
                            type="text"
                            placeholder={t('user_placeholder')}
                            value={credentials.username}
                            onChange={e => setCredentials(c => ({ ...c, username: e.target.value }))}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">{t('password')}</label>
                        <input
                            id="password"
                            type="password"
                            placeholder={t('pass_placeholder')}
                            value={credentials.password}
                            onChange={e => setCredentials(c => ({ ...c, password: e.target.value }))}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="login-error fade-in">⚠️ {error}</div>
                    )}

                    <button type="submit" className="btn btn-outline login-btn" disabled={loading}>
                        {loading ? `⏳ ${t('submitting')}` : `→ ${t('sign_in')}`}
                    </button>

                    <p className="login-back">
                        <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>
                            ← {t('back_to_invitation')}
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
