import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllGuests, acceptGuest, deleteGuest } from '../api';
import { useTranslation } from 'react-i18next';
import './AdminDashboard.css';

const FOOD_ICONS = {
    chicken_supreme: '🍗',
    duck_confit:     '🍗', // fallback
    short_rib:       '🥩',
    vegetarian:      '🥗',
    vegan:           '🥣',
    // legacy fallbacks for old data
    rice: '🍚', chicken: '🍗', beef: '🥩', fish: '🐟', vegetables: '🥗', fruits: '🍉',
};

const FOOD_LABELS = {
    chicken_supreme: 'Chicken Supreme',
    duck_confit:     'Chicken Supreme', // fallback
    short_rib:       'Short Rib',
    vegetarian:      'Vegetarian Ravioli',
    vegan:           'Vegan Poke Bowl',
};

const TYPE_META = {
    individual: { emoji: '👤', label: 'Individual' },
    couple:     { emoji: '💑', label: 'Couple' },
    family:     { emoji: '👨‍👩‍👧‍👦', label: 'Family' },
};

/** Infer type from group size for old records that have no rsvpType */
function inferType(groupMembers) {
    const stored = groupMembers[0]?.rsvpType;
    if (stored && TYPE_META[stored]) return stored;
    if (groupMembers.length === 1) return 'individual';
    if (groupMembers.length === 2) return 'couple';
    return 'family';
}

export default function AdminDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const username = sessionStorage.getItem('adminUser');
    const password = sessionStorage.getItem('adminPass');

    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterFood, setFilterFood] = useState('all');   // all | chicken_supreme | short_rib
    const [filterSide, setFilterSide] = useState('all');   // all | willy | sonia
    const [actionLoad, setActionLoad] = useState(null);

    useEffect(() => {
        if (!username || !password) navigate('/admin/login');
    }, []);

    const fetchGuests = useCallback(async () => {
        try {
            setError('');
            const res = await getAllGuests(username, password);
            let parsedData = res.data;
            if (typeof parsedData === 'string') {
                try { parsedData = JSON.parse(parsedData); } catch (e) { }
            }
            let finalGuests = [];
            if (Array.isArray(parsedData)) finalGuests = parsedData;
            else if (parsedData?.guests && Array.isArray(parsedData.guests)) finalGuests = parsedData.guests;
            else if (parsedData?.data && Array.isArray(parsedData.data)) finalGuests = parsedData.data;
            setGuests(finalGuests);
        } catch (err) {
            if (err.response?.status === 401) {
                sessionStorage.clear();
                navigate('/admin/login');
            } else {
                setError(err.message || t('conn_error'));
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
        } catch (err) { setError(err.message || t('error_generic')); }
        finally { setActionLoad(null); }
    };

    const handleDelete = async (guest) => {
        const confirmMsg = `Remove "${guest.name || 'Unknown Guest'}" permanently? This cannot be undone.`;
        if (window.confirm(confirmMsg)) {
            setActionLoad(guest.id + '-delete');
            setError('');  // clear old errors
            try {
                const res = await deleteGuest(guest.id, username, password);
                // GAS always returns HTTP 200; check body for errors
                const body = res?.data;
                if (body?.error) {
                    throw new Error('GAS error: ' + body.error);
                }
                // Success — remove from local state
                setGuests(prev => prev.filter(g => g.id !== guest.id));
            } catch (err) {
                // Log full error to console for debugging
                console.error('[Remove Guest] full error:', err);
                const msg = err?.response?.data?.error || err?.message || 'Unknown error from server.';
                setError(`❌ Remove failed (ID ${guest.id}): ${msg}`);
            } finally {
                setActionLoad(null);
            }
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/admin/login');
    };

    const validGuests = Array.isArray(guests) ? guests : [];

    const filtered = validGuests.filter(g => {
        const q = search.toLowerCase();
        const matchSearch = !q || g.name?.toLowerCase().includes(q) || g.phone?.includes(q);
        const matchStatus = filterStatus === 'all' || g.status === filterStatus;
        const matchFood  = filterFood === 'all' || (g.foods && g.foods.includes(filterFood));
        const matchSide  = filterSide === 'all' || g.side === filterSide;
        return matchSearch && matchStatus && matchFood && matchSide;
    });

    // All-time totals (not affected by filters) for the stat cards
    const attendingGuests = validGuests.filter(g => g.attending);
    const stats = {
        total:      validGuests.length,
        attending:  attendingGuests.length,
        accepted:   validGuests.filter(g => g.status === 'ACCEPTED').length,
        pending:    validGuests.filter(g => g.status === 'PENDING').length,
        chickenSupreme: attendingGuests.filter(g => g.foods?.includes('chicken_supreme') || g.foods?.includes('duck_confit')).length,
        shortRib:   attendingGuests.filter(g => g.foods?.includes('short_rib')).length,
        vegetarian: attendingGuests.filter(g => g.foods?.includes('vegetarian')).length,
        vegan:      attendingGuests.filter(g => g.foods?.includes('vegan')).length,
        willy:      validGuests.filter(g => g.side === 'willy').length,
        sonia:      validGuests.filter(g => g.side === 'sonia').length,
    };

    /** Group by timestamp; each group is one RSVP submission */
    const groupGuests = () => {
        const groups = {};
        filtered.forEach(g => {
            const time = new Date(g.timestamp).getTime();
            if (!groups[time]) groups[time] = [];
            groups[time].push(g);
        });

        let entries = Object.entries(groups).sort((a, b) => b[0] - a[0]);

        // Apply type filter after grouping
        if (filterType !== 'all') {
            entries = entries.filter(([, members]) => inferType(members) === filterType);
        }

        return entries;
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

                {/* ── Menu Breakdown ── */}
                <div className="menu-stats-row fade-in-up">
                    <span className="menu-stats-title">🍽️ Main Course Orders</span>
                    <div className="menu-stat-cards">
                        <div className="menu-stat-card">
                            <span className="menu-stat-emoji">🍗</span>
                            <div>
                                <span className="menu-stat-count">{stats.chickenSupreme}</span>
                                <span className="menu-stat-name">Chicken Supreme</span>
                            </div>
                        </div>
                        <div className="menu-stat-divider" />
                        <div className="menu-stat-card">
                            <span className="menu-stat-emoji">🥩</span>
                            <div>
                                <span className="menu-stat-count">{stats.shortRib}</span>
                                <span className="menu-stat-name">Short Rib</span>
                            </div>
                        </div>
                        <div className="menu-stat-card">
                            <span className="menu-stat-emoji">🥗</span>
                            <div>
                                <span className="menu-stat-count">{stats.vegetarian}</span>
                                <span className="menu-stat-name">Vegetarian</span>
                            </div>
                        </div>
                        <div className="menu-stat-divider" />
                        <div className="menu-stat-card">
                            <span className="menu-stat-emoji">🥣</span>
                            <div>
                                <span className="menu-stat-count">{stats.vegan}</span>
                                <span className="menu-stat-name">Vegan</span>
                            </div>
                        </div>
                        <div className="menu-stat-divider" />
                        <div className="menu-stat-card menu-stat-total">
                            <span className="menu-stat-emoji">👥</span>
                            <div>
                                <span className="menu-stat-count">{stats.chickenSupreme + stats.shortRib + stats.vegetarian + stats.vegan}</span>
                                <span className="menu-stat-name">Total Orders</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Side Breakdown ── */}
                <div className="menu-stats-row fade-in-up" style={{ borderLeftColor: 'var(--green)' }}>
                    <span className="menu-stats-title">👥 Guests by Side</span>
                    <div className="menu-stat-cards">
                        <div className="menu-stat-card">
                            <span className="menu-stat-emoji">🤵</span>
                            <div>
                                <span className="menu-stat-count">{stats.willy}</span>
                                <span className="menu-stat-name">Willy's Guests</span>
                            </div>
                        </div>
                        <div className="menu-stat-divider" />
                        <div className="menu-stat-card">
                            <span className="menu-stat-emoji">👰</span>
                            <div>
                                <span className="menu-stat-count">{stats.sonia}</span>
                                <span className="menu-stat-name">Sonia's Guests</span>
                            </div>
                        </div>
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
                    {/* <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
                        <option value="all">All Types</option>
                        <option value="individual">👤 Individual</option>
                        <option value="couple">💑 Couple</option>
                        <option value="family">👨‍👩‍👧‍👦 Family</option>
                    </select> */}
                    <select value={filterFood} onChange={e => setFilterFood(e.target.value)} className="filter-select">
                        <option value="all">All Main Courses</option>
                        <option value="chicken_supreme">🍗 Chicken Supreme ({stats.chickenSupreme})</option>
                        <option value="short_rib">🥩 Short Rib ({stats.shortRib})</option>
                        <option value="vegetarian">🥗 Vegetarian ({stats.vegetarian})</option>
                        <option value="vegan">🥣 Vegan ({stats.vegan})</option>
                    </select>
                    <select value={filterSide} onChange={e => setFilterSide(e.target.value)} className="filter-select">
                        <option value="all">All Sides</option>
                        <option value="willy">🤵 Willy ({stats.willy})</option>
                        <option value="sonia">👰 Sonia ({stats.sonia})</option>
                    </select>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
                        <option value="all">All Statuses</option>
                        <option value="PENDING">⏳ Pending</option>
                        <option value="ACCEPTED">✅ Accepted</option>
                        {/* <option value="REJECTED">❌ Rejected</option> */}
                    </select>
                    <button className="btn btn-outline btn-sm" onClick={fetchGuests}>
                        ↻ Refresh
                    </button>
                </div>

                {error && <div className="admin-error fade-in">⚠️ {error}</div>}

                {/* Table */}
                {loading ? (
                    <div className="admin-loading">
                        <div className="spinner"></div>
                        <span>Loading Guest List...</span>
                    </div>
                ) : groupGuests().length === 0 ? (
                    <div className="admin-empty card">
                        <p>No guests found matching your filters.</p>
                    </div>
                ) : (
                    <div className="groups-container fade-in-up">
                        {groupGuests().map(([timestamp, groupMembers]) => {
                            const type = inferType(groupMembers);
                            const typeMeta = TYPE_META[type] || TYPE_META.individual;
                            const attendingCount = groupMembers.filter(g => g.attending).length;

                            return (
                                <div key={timestamp} className="guest-group-card card">
                                    {/* ── Group Header ── */}
                                    <div className="group-header">
                                        <div className="group-header-left">
                                            <span className={`group-type-badge badge-type-${type}`}>
                                                {typeMeta.emoji} {typeMeta.label}
                                            </span>
                                            <span className={`group-side-badge badge-side-${groupMembers[0]?.side}`}>
                                                {groupMembers[0]?.side === 'willy' ? '🤵 Willy' : 
                                                 groupMembers[0]?.side === 'sonia' ? '👰 Sonia' : '❓ Unknown'}
                                            </span>
                                            <span className="group-time">
                                                📅 {new Date(parseInt(timestamp)).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="group-header-right">
                                            <span className="group-member-count">
                                                👥 {groupMembers.length} {groupMembers.length > 1 ? 'Members' : 'Member'}
                                            </span>
                                            <span className="group-attending-count">
                                                ✅ {attendingCount} Attending
                                            </span>
                                        </div>
                                    </div>

                                    {/* ── Member Summary Pills (for couple/family) ── */}
                                    {groupMembers.length > 1 && (
                                        <div className="member-summary-row">
                                            {groupMembers.map((g, i) => (
                                                <div key={g.id} className="member-pill">
                                                    <span className="member-pill-num">#{i + 1}</span>
                                                    <span className="member-pill-name">
                                                        {g.name || 'Unknown'}
                                                    </span>
                                                    <span className={`member-pill-att ${g.attending ? 'att-pill-yes' : 'att-pill-no'}`}>
                                                        {g.attending ? '✅' : '❌'}
                                                    </span>
                                                    {g.foods && g.foods.length > 0 && (
                                                        <span className="member-pill-foods" title={g.foods.map(f => FOOD_LABELS[f] || f).join(', ')}>
                                                            {g.foods.map(f => FOOD_ICONS[f.toLowerCase()] || '🍽️').join('')}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ── Detailed Table ── */}
                                    <div className="table-wrapper">
                                        <table className="guests-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Phone</th>
                                                    <th>Food Choice</th>
                                                    <th>Status</th>
                                                    <th className="text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupMembers.map((guest, idx) => (
                                                    <tr key={guest.id} className="guest-row">
                                                        <td className="td-num">{idx + 1}</td>
                                                        <td className="td-name">
                                                            {guest.name
                                                                ? guest.name
                                                                : <span className="unknown-guest">Unknown Guest</span>}
                                                        </td>
                                                        <td className="td-phone">{guest.phone || '—'}</td>
                                                        <td className="td-foods">
                                                            {guest.foods && guest.foods.length > 0 ? (
                                                                <div className="food-tags">
                                                                    {guest.foods.map(f => (
                                                                        <span key={f} className="food-tag">
                                                                            {FOOD_ICONS[f.toLowerCase()] || '🍽️'}{' '}
                                                                            {FOOD_LABELS[f.toLowerCase()] || f}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : <span className="no-food">—</span>}
                                                        </td>
                                                        <td>
                                                            <span className={`badge badge-${guest.status.toLowerCase()}`}>
                                                                {guest.status}
                                                            </span>
                                                        </td>
                                                        <td className="td-actions">
                                                            {guest.status !== 'ACCEPTED' && (
                                                                <button
                                                                    className="btn btn-outline-green btn-xs"
                                                                    onClick={() => handleAccept(guest.id)}
                                                                    disabled={actionLoad === guest.id + '-accept'}
                                                                >
                                                                    {actionLoad === guest.id + '-accept' ? '…' : '✓ Accept'}
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-outline-red btn-xs"
                                                                onClick={() => handleDelete(guest)}
                                                                disabled={actionLoad === guest.id + '-delete'}
                                                            >
                                                                {actionLoad === guest.id + '-delete' ? '…' : '✗ Remove'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
