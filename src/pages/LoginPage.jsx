import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyAdmin } from '../api';
import './LoginPage.css';

export default function LoginPage() {
    const navigate = useNavigate();
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
                setError('Invalid username or password.');
            } else {
                setError('Cannot connect to server. Please ensure the backend is running.');
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
                    <h1>Admin Login</h1>
                    <p>Sonia &amp; William Wedding Dashboard</p>
                </div>

                <form className="card login-card" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            value={credentials.username}
                            onChange={e => setCredentials(c => ({ ...c, username: e.target.value }))}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            value={credentials.password}
                            onChange={e => setCredentials(c => ({ ...c, password: e.target.value }))}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="login-error fade-in">⚠️ {error}</div>
                    )}

                    <button type="submit" className="btn btn-outline login-btn" disabled={loading}>
                        {loading ? '⏳ Signing in…' : '→ Sign In'}
                    </button>

                    <p className="login-back">
                        <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>
                            ← Back to Invitation
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
