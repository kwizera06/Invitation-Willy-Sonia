import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllGuests, acceptGuest, rejectGuest } from '../api';
import './AdminDashboard.css';

const FOOD_ICONS = {
    rice: '🍚', chicken: '🍗', beef: '🥩',
    fish: '🐟', vegetables: '🥗', fruits: '🍉',
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const username = sessionStorage.getItem('adminUser');
    const password = sessionStorage.getItem('adminPass');

    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterAtt, setFilterAtt] = useState('all');  // all | yes | no
    const [filterStatus, setFilterStatus] = useState('all');  // all | PENDING | ACCEPTED | REJECTED
    const [actionLoad, setActionLoad] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!username || !password) navigate('/admin/login');
    }, []);

    const fetchGuests = useCallback(async () => {
        try {
            setError('');
            const res = await getAllGuests(username, password);
            setGuests(res.data);
        } catch (err) {
            if (err.response?.status === 401) {
                sessionStorage.clear();
                navigate('/admin/login');
            } else {
                setError('Failed to load guest list.');
            }
        } finally {
            setLoading(false);
        }
    }, [username, password]);

    useEffect(() => { fetchGuests(); }, [fetchGuests]);

    const handleAccept = async (id) => {
        setActionLoad(id + '-accept');
        try {
            await acceptGuest(id, username, password);
            setGuests(prev => prev.map(g => g.id === id ? { ...g, status: 'ACCEPTED' } : g));
        } catch { setError('Action failed.'); }
        finally { setActionLoad(null); }
    };

    const handleReject = async (id) => {
        setActionLoad(id + '-reject');
        try {
            await rejectGuest(id, username, password);
            setGuests(prev => prev.map(g => g.id === id ? { ...g, status: 'REJECTED' } : g));
        } catch { setError('Action failed.'); }
        finally { setActionLoad(null); }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/admin/login');
    };

    // Filter + search
    const filtered = guests.filter(g => {
        const q = search.toLowerCase();
        const matchSearch = !q || g.name.toLowerCase().includes(q) || g.phone.includes(q);
        const matchAtt = filterAtt === 'all'
            || (filterAtt === 'yes' && g.attending)
            || (filterAtt === 'no' && !g.attending);
        const matchStatus = filterStatus === 'all' || g.status === filterStatus;
        return matchSearch && matchAtt && matchStatus;
    });

    const stats = {
        total: guests.length,
        attending: guests.filter(g => g.attending).length,
        accepted: guests.filter(g => g.status === 'ACCEPTED').length,
        pending: guests.filter(g => g.status === 'PENDING').length,
    };

    return (
        <div className="admin-wrapper">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-header-inner container">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p className="admin-subhead">Sonia &amp; William — Guest Management</p>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                        ↩ Logout
                    </button>
                </div>
            </header>

            <main className="container admin-main">
                {/* Stats */}
                <div className="stats-grid fade-in-up">
                    <div className="stat-card">
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-label">Total RSVPs</span>
                    </div>
                    <div className="stat-card stat-green">
                        <span className="stat-number">{stats.attending}</span>
                        <span className="stat-label">Attending</span>
                    </div>
                    <div className="stat-card stat-accepted">
                        <span className="stat-number">{stats.accepted}</span>
                        <span className="stat-label">Accepted</span>
                    </div>
                    <div className="stat-card stat-pending">
                        <span className="stat-number">{stats.pending}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar card fade-in-up">
                    <input
                        className="search-input"
                        type="text"
                        placeholder="🔍 Search by name or phone…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        value={filterAtt}
                        onChange={e => setFilterAtt(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Attendance</option>
                        <option value="yes">✅ Attending</option>
                        <option value="no">❌ Not Attending</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Statuses</option>
                        <option value="PENDING">⏳ Pending</option>
                        <option value="ACCEPTED">✅ Accepted</option>
                        <option value="REJECTED">❌ Rejected</option>
                    </select>
                    <button className="btn btn-outline btn-sm" onClick={fetchGuests}>
                        ↻ Refresh
                    </button>
                </div>

                {error && <div className="admin-error fade-in">⚠️ {error}</div>}

                {/* Table */}
                {loading ? (
                    <div className="admin-loading">
                        <span className="loading-spinner">⌛</span> Loading guests…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="admin-empty card">
                        <p>No guests found matching your filters.</p>
                    </div>
                ) : (
                    <div className="table-wrapper card fade-in-up">
                        <table className="guests-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Attendance</th>
                                    <th>Food Choices</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((guest, idx) => (
                                    <tr key={guest.id} className="guest-row">
                                        <td className="td-num">{idx + 1}</td>
                                        <td className="td-name">{guest.name}</td>
                                        <td className="td-phone">{guest.phone}</td>
                                        <td className="td-att">
                                            {guest.attending
                                                ? <span className="att-yes">✅ Yes</span>
                                                : <span className="att-no">❌ No</span>
                                            }
                                        </td>
                                        <td className="td-foods">
                                            {guest.foods && guest.foods.length > 0
                                                ? (
                                                    <div className="food-tags">
                                                        {guest.foods.map(f => (
                                                            <span key={f} className="food-tag">
                                                                {FOOD_ICONS[f.toLowerCase()] || '🍽️'} {f}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )
                                                : <span className="no-food">—</span>
                                            }
                                        </td>
                                        <td>
                                            <span className={`badge badge-${guest.status.toLowerCase()}`}>
                                                {guest.status}
                                            </span>
                                        </td>
                                        <td className="td-actions">
                                            {guest.status !== 'ACCEPTED' && (
                                                <button
                                                    className="btn btn-outline-green btn-sm"
                                                    onClick={() => handleAccept(guest.id)}
                                                    disabled={actionLoad === guest.id + '-accept'}
                                                >
                                                    {actionLoad === guest.id + '-accept' ? '…' : '✓ Accept'}
                                                </button>
                                            )}
                                            {guest.status !== 'REJECTED' && (
                                                <button
                                                    className="btn btn-outline-red btn-sm"
                                                    onClick={() => handleReject(guest.id)}
                                                    disabled={actionLoad === guest.id + '-reject'}
                                                >
                                                    {actionLoad === guest.id + '-reject' ? '…' : '✗ Reject'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="table-count">Showing {filtered.length} of {guests.length} guests</p>
                    </div>
                )}
            </main>
        </div>
    );
}
