import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { submitRsvp } from '../api';
import './RSVPForm.css';

const MAIN_COURSES = [
    { id: 'chicken_supreme', emoji: '🍗', nameKey: 'chicken_supreme', descKey: 'chicken_supreme_desc_hardcoded' },
    { id: 'short_rib', emoji: '🥩', nameKey: 'short_rib', descKey: 'short_rib_desc_hardcoded' },
    { id: 'vegetarian', emoji: '🥗', nameKey: 'vegetarian', descKey: 'vegetarian_desc' },
    { id: 'vegan', emoji: '🥣', nameKey: 'vegan', descKey: 'vegan_desc' },
];



export default function RSVPForm() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const [phone, setPhone] = useState('');
    const [members, setMembers] = useState([{ name: '', attending: null, mainCourse: null }]);
    const [side, setSide] = useState(null); // 'william' or 'sonia'
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');



    const updateMember = (index, field, value) => {
        setMembers(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const toggleFood = (memberIndex, foodId) => {
        const member = members[memberIndex];
        const newFoods = member.foods.includes(foodId)
            ? member.foods.filter(x => x !== foodId)
            : [...member.foods, foodId];
        updateMember(memberIndex, 'foods', newFoods);
    };

    const addMember = () => {
        setMembers(prev => [...prev, { name: '', attending: null, mainCourse: null }]);
    };

    const removeMember = (index) => {
        if (members.length <= 1) return;
        if (window.confirm(t('confirm_remove'))) {
            setMembers(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!side) return setError(t('error_side'));
        if (!phone.trim()) return setError(t('error_phone'));

        for (let i = 0; i < members.length; i++) {
            if (!members[i].name.trim()) return setError(`${t('error_member_name')} (${t('member')} #${i + 1})`);
            if (members[i].attending === null) return setError(`${t('error_attendance')} (${members[i].name})`);
            if (members[i].attending && !members[i].mainCourse) {
                return setError(`${t('error_main_course')} (${members[i].name || `${t('member')} #${i + 1}`})`);
            }
        }

        setLoading(true);
        try {
            await submitRsvp({
                phone: phone.trim(),
                side,
                guests: members.map(m => ({
                    name: m.name.trim(),
                    attending: m.attending === true,
                    // foods array: mainCourse only if attending, empty otherwise
                    foods: m.attending && m.mainCourse ? [m.mainCourse] : [],
                    phone: phone.trim()
                }))
            });
            navigate('/success');
        } catch (err) {
            const msg = err.response?.data?.error || t('error_generic');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rsvp-wrapper">
            <div className="rsvp-container">
                <div className="rsvp-header fade-in-up">
                    <p className="rsvp-pre">Sonia &amp; William's Wedding</p>
                    <h1>{t('rsvp_title')}</h1>
                    <p className="rsvp-subtitle">{t('rsvp_subtitle')}</p>
                    <div className="divider"><span className="diamond">◆</span></div>
                </div>

                <form className="card rsvp-card fade-in-up" onSubmit={handleSubmit}>
                    {!side ? (
                        /* ── Step 1: Side Selection ── */
                        <div className="side-selection-step fade-in">
                            <h2 className="step-title">{t('whose_guest')}</h2>
                            <div className="side-options large">
                                <div 
                                    className="side-card"
                                    onClick={() => setSide('willy')}
                                >
                                    <div className="side-card-inner">
                                        <span className="side-emoji">🤵</span>
                                        <span className="side-label">{t('willy_side')}</span>
                                    </div>
                                </div>
                                <div 
                                    className="side-card"
                                    onClick={() => setSide('sonia')}
                                >
                                    <div className="side-card-inner">
                                        <span className="side-emoji">👰</span>
                                        <span className="side-label">{t('sonia_side')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── Step 2: The Rest of the Form ── */
                        <div className="form-content fade-in">
                            <div className="selected-side-header">
                                <span className="selected-side-tag">
                                    {side === 'willy' ? `🤵 ${t('willy_side')}` : `👰 ${t('sonia_side')}`}
                                </span>
                                <button 
                                    type="button" 
                                    className="change-side-btn"
                                    onClick={() => setSide(null)}
                                >
                                    ✕ {t('change')}
                                </button>
                            </div>
                            
                            <div className="divider-soft" style={{ margin: '16px 0 24px 0' }}></div>



                    {/* Primary Phone */}
                    <div className="form-group">
                        <label htmlFor="phone">{t('primary_contact')}</label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder={t('phone_placeholder')}
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="divider-soft"></div>

                    {/* Members List */}
                    <div className="form-group">
                        <label>{t('who_is_attending')}</label>
                        <div className="members-list">
                            {members.map((member, idx) => (
                                <div key={idx} className="member-card fade-in">
                                    <div className="member-card-header">
                                        <h3>{t('member')} #{idx + 1}</h3>
                                        {members.length > 1 && (
                                            <button
                                                type="button"
                                                className="remove-member-btn"
                                                onClick={() => removeMember(idx)}
                                            >
                                                ✕ {t('remove')}
                                            </button>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            placeholder={t('name_placeholder')}
                                            value={member.name}
                                            onChange={e => updateMember(idx, 'name', e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <div className="attendance-options">
                                            <button
                                                type="button"
                                                className={`attendance-btn ${member.attending === true ? 'active-yes' : ''}`}
                                                onClick={() => updateMember(idx, 'attending', true)}
                                            >
                                                {t('will_attend')}
                                            </button>
                                            <button
                                                type="button"
                                                className={`attendance-btn ${member.attending === false ? 'active-no' : ''}`}
                                                onClick={() => {
                                                    updateMember(idx, 'attending', false);
                                                    updateMember(idx, 'foods', []);
                                                }}
                                            >
                                                {t('will_not_attend')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Main Course — only shown if attending */}
                                    {member.attending === true && (
                                        <div className="form-group fade-in">
                                            {/* Menu overview: always-included items */}
                                            <div className="menu-included">
                                                <div className="menu-included-item">
                                                    <span className="menu-course-label">🥣 {t('soup')}</span>
                                                    <span className="menu-included-badge">{t('included_for_all')}</span>
                                                </div>
                                                <p className="menu-item-name">Thai Coconut Soup</p>
                                            </div>

                                            {/* Main Course radio selection */}
                                            <label className="main-course-label">
                                                🍽️ {t('main_course_select')}
                                                <span className="main-course-required">*</span>
                                            </label>
                                            <div className="main-course-grid">
                                                {MAIN_COURSES.map(course => (
                                                    <label
                                                        key={course.id}
                                                        className={`main-course-card ${member.mainCourse === course.id ? 'selected' : ''}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`mainCourse-${idx}`}
                                                            value={course.id}
                                                            checked={member.mainCourse === course.id}
                                                            onChange={() => updateMember(idx, 'mainCourse', course.id)}
                                                            className="hidden-radio"
                                                        />
                                                        <div className="main-course-radio-dot" />
                                                        <div className="main-course-content">
                                                            <span className="main-course-emoji">{course.emoji}</span>
                                                            <div>
                                                                <p className="main-course-name">{t(course.nameKey)}</p>
                                                                <p className="main-course-desc">{t(course.descKey)}</p>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>

                                            {/* Dessert: always included */}
                                            <div className="menu-included" style={{ marginTop: '8px' }}>
                                                <div className="menu-included-item">
                                                    <span className="menu-course-label">🍮 {t('dessert')}</span>
                                                    <span className="menu-included-badge">{t('included_for_all')}</span>
                                                </div>
                                                <p className="menu-item-name">Apple Tarte Tatin — vanilla infused, topped with a dulce whipped ganache quenelle</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button type="button" className="add-member-btn" onClick={addMember}>
                            ➕ {t('add_member')}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rsvp-error fade-in">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-highlight pulse-animation rsvp-submit"
                        disabled={loading}
                    >
                        {loading ? `⏳ ${t('submitting')}` : `💌 ${t('submit_rsvp')}`}
                    </button>

                    <p className="rsvp-back">
                        <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>
                            ← {t('back_to_invitation')}
                        </a>
                    </p>
                </div>
            )}
            </form>
            </div>
        </div>
    );
}
