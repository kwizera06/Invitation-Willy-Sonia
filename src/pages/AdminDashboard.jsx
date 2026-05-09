import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllGuests, acceptGuest, deleteGuest, generateInviteCodes, getInviteLinks } from '../api';
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
    chicken_supreme: 'CHICKEN SUPREME',
    duck_confit:     'CHICKEN SUPREME',
    short_rib:       'SLOW ROASTED SHORT RIB',
    vegetarian:      'VEGETARIAN RAVIOLI',
    vegan:           'VEGAN POKE BOWL',
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
    const [inviteLinks, setInviteLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [genLoading, setGenLoading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterFood, setFilterFood] = useState('all');   // all | chicken_supreme | short_rib
    const [filterSide, setFilterSide] = useState('all');   // all | willy | sonia
    const [actionLoad, setActionLoad] = useState(null);

    const [selectedGroup, setSelectedGroup] = useState(null);

    useEffect(() => {
        if (!username || !password) navigate('/admin/login');
    }, []);

    const fetchInviteLinks = useCallback(async () => {
        try {
            const res = await getInviteLinks(username, password);
            setInviteLinks(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch links:', err);
        }
    }, [username, password]);

    const handleGenerateLinks = async () => {
        if (!window.confirm('Generate a new single-use invitation link?')) return;
        setGenLoading(true);
        try {
            await generateInviteCodes(username, password, 1);
            await fetchInviteLinks();
            alert('Successfully generated a new link!');
        } catch (err) {
            setError('Failed to generate code: ' + err.message);
        } finally {
            setGenLoading(false);
        }
    };

    const copyToClipboard = async (code) => {
        const url = `${window.location.origin}/?code=${code}`;
        try {
            await navigator.clipboard.writeText(url);
            alert('Selection copied! A new fresh link is being prepared for the next guest.');
            
            // Quietly generate a new link for the next usage
            setGenLoading(true);
            await generateInviteCodes(username, password, 1);
            await fetchInviteLinks();
        } catch (err) {
            console.error('Copy/Gen failed:', err);
        } finally {
            setGenLoading(false);
        }
    };

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

    useEffect(() => { 
        fetchGuests(); 
        fetchInviteLinks();
    }, [fetchGuests, fetchInviteLinks]);

    const handleAccept = async (id) => {
        setActionLoad(id + '-accept');
        try {
            await acceptGuest(id, username, password);
            setGuests(prev => prev.map(g => g.id === id ? { ...g, status: 'ACCEPTED' } : g));
            // Update selectedGroup if modal is open
            if (selectedGroup) {
                setSelectedGroup(prev => ({
                    ...prev,
                    members: prev.members.map(m => m.id === id ? { ...m, status: 'ACCEPTED' } : m)
                }));
            }
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
                const body = res?.data;
                if (body?.error) throw new Error('GAS error: ' + body.error);
                
                setGuests(prev => prev.filter(g => g.id !== guest.id));
                // Close modal if deleted or update
                if (selectedGroup) {
                    const remaining = selectedGroup.members.filter(m => m.id !== guest.id);
                    if (remaining.length === 0) setSelectedGroup(null);
                    else setSelectedGroup({ ...selectedGroup, members: remaining });
                }
            } catch (err) {
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

    const groupGuests = () => {
        const groups = {};
        filtered.forEach(g => {
            const time = new Date(g.timestamp).getTime();
            if (!groups[time]) groups[time] = [];
            groups[time].push(g);
        });
        let entries = Object.entries(groups).sort((a, b) => b[0] - a[0]);
        if (filterType !== 'all') {
            entries = entries.filter(([, members]) => inferType(members) === filterType);
        }
        return entries;
    };

    return (
        <div className="admin-wrapper">
            {/* Header stays same */}
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
                {/* ── Refined Quick Invite Section ── */}
                <section className="invite-links-section fade-in-up" style={{ marginTop: 0, paddingTop: 10, borderTop: 'none', marginBottom: 40 }}>
                    <div className="invite-links-header" style={{ marginBottom: '15px' }}>
                        <h2>Quick Invite Link</h2>
                    </div>

                    {inviteLinks.length === 0 ? (
                        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                            <p className="admin-empty">No invite links generated yet.</p>
                            <button className="btn btn-highlight btn-sm" onClick={handleGenerateLinks} disabled={genLoading}>
                                {genLoading ? '…' : '➕ Generate Link'}
                            </button>
                        </div>
                    ) : (
                        [inviteLinks[inviteLinks.length - 1]].map((link) => (
                            <div key={link.code} className={`invite-link-card status-${link.status.toLowerCase()}`} style={{ maxWidth: '100%', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                    <div>
                                        <div className="invite-card-top" style={{ marginBottom: '8px' }}>
                                            <span className="invite-code-pill" style={{ fontSize: '1rem' }}>{link.code}</span>
                                            <span className="invite-status-badge">{link.status}</span>
                                        </div>
                                        <div className="invite-url-box" style={{ fontSize: '0.85rem', padding: '8px 12px', background: 'rgba(255,255,255,0.05)' }}>
                                            {window.location.origin}/?code={link.code}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            className="btn btn-highlight btn-sm"
                                            onClick={() => copyToClipboard(link.code)}
                                            disabled={link.status === 'USED'}
                                        >
                                            {link.status === 'USED' ? 'Used' : '📋 Copy Link'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </section>

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

                {/* ── Enhanced Filters Bar ── */}
                <div className="filters-bar card fade-in-up" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <input
                            className="search-input"
                            style={{ flex: 1, minWidth: '250px' }}
                            type="text"
                            placeholder="🔍 Search name or phone…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select" style={{ minWidth: '150px' }}>
                            <option value="all">All Statuses</option>
                            <option value="PENDING">⏳ Pending</option>
                            <option value="ACCEPTED">✅ Accepted</option>
                        </select>
                        <button className="btn btn-outline btn-sm" onClick={fetchGuests}>
                            ↻ Refresh
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                        {/* Side Filters */}
                        <div className="filter-group">
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>SIDE:</span>
                            <div className="filter-chips">
                                <div className={`chip ${filterSide === 'all' ? 'active' : ''}`} onClick={() => setFilterSide('all')}>All</div>
                                <div className={`chip ${filterSide === 'willy' ? 'active' : ''}`} onClick={() => setFilterSide('willy')}>🤵 William</div>
                                <div className={`chip ${filterSide === 'sonia' ? 'active' : ''}`} onClick={() => setFilterSide('sonia')}>👰 Sonia</div>
                            </div>
                        </div>

                        {/* Food Filters */}
                        <div className="filter-group">
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>FOOD CHOICE:</span>
                            <div className="filter-chips">
                                <div className={`chip ${filterFood === 'all' ? 'active' : ''}`} onClick={() => setFilterFood('all')}>All</div>
                                <div className={`chip ${filterFood === 'chicken_supreme' ? 'active' : ''}`} onClick={() => setFilterFood('chicken_supreme')}>🍗 Chicken</div>
                                <div className={`chip ${filterFood === 'short_rib' ? 'active' : ''}`} onClick={() => setFilterFood('short_rib')}>🥩 Short Rib</div>
                                <div className={`chip ${filterFood === 'vegetarian' ? 'active' : ''}`} onClick={() => setFilterFood('vegetarian')}>🥗 Veggie</div>
                                <div className={`chip ${filterFood === 'vegan' ? 'active' : ''}`} onClick={() => setFilterFood('vegan')}>🥣 Vegan</div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && <div className="admin-error fade-in">⚠️ {error}</div>}

                {/* ── Simplified List View ── */}
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
                            const attendingCount = groupMembers.filter(g => g.attending).length;
                            const isAccepted = groupMembers.every(g => g.status === 'ACCEPTED');

                            return (
                                <div key={timestamp} className="guest-group-card card" style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>
                                                {groupMembers.map(m => m.name).join(', ')}
                                            </h3>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {groupMembers.length} guest{groupMembers.length > 1 ? 's' : ''} — {attendingCount} attending
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span className={`badge badge-${isAccepted ? 'accepted' : 'pending'}`}>
                                                {isAccepted ? 'ACCEPTED' : 'PENDING'}
                                            </span>
                                            <button 
                                                className="btn btn-outline btn-sm"
                                                onClick={() => setSelectedGroup({ timestamp, members: groupMembers })}
                                            >
                                                🔍 Display Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Details Modal ── */}
                {selectedGroup && (
                    <div className="modal-overlay" onClick={() => setSelectedGroup(null)}>
                        <div className="modal-content fade-in-up" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Guest Information</h2>
                                <button className="modal-close" onClick={() => setSelectedGroup(null)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="group-meta-info">
                                    <p><span>📅 Registration:</span> {new Date(parseInt(selectedGroup.timestamp)).toLocaleString()}</p>
                                    <p><span>📞 Primary Phone:</span> {selectedGroup.members[0]?.phone || '—'}</p>
                                    <p><span>👥 Relation:</span> {selectedGroup.members[0]?.side === 'willy' ? "Willy's Side" : "Sonia's Side"}</p>
                                </div>
                                
                                <div className="modal-members-list">
                                    {selectedGroup.members.map((guest, idx) => (
                                        <div key={guest.id} className="modal-member-card">
                                            <div className="modal-member-header">
                                                <h4>#{idx + 1} {guest.name}</h4>
                                                <span className={`badge badge-${guest.status.toLowerCase()}`}>{guest.status}</span>
                                            </div>
                                            <div className="modal-member-details">
                                                <p><span>Attending:</span> {guest.attending ? '✅ Yes' : '❌ No'}</p>
                                                {guest.attending && (
                                                    <p><span>Food Choice:</span> {guest.foods?.map(f => FOOD_LABELS[f.toLowerCase()] || f).join(', ') || '—'}</p>
                                                )}
                                            </div>
                                            <div className="td-actions" style={{ marginTop: '12px' }}>
                                                {guest.status !== 'ACCEPTED' && (
                                                    <button
                                                        className="btn btn-outline-green btn-xs"
                                                        onClick={() => handleAccept(guest.id)}
                                                        disabled={actionLoad === guest.id + '-accept'}
                                                    >
                                                        {actionLoad === guest.id + '-accept' ? '…' : '✓ Accept Guest'}
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-outline-red btn-xs"
                                                    onClick={() => handleDelete(guest)}
                                                    disabled={actionLoad === guest.id + '-delete'}
                                                >
                                                    {actionLoad === guest.id + '-delete' ? '…' : '✗ Remove'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
