import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { submitRsvp } from '../api';
import './RSVPForm.css';

const FOODS = [
    { id: 'rice', labelKey: 'rice', emoji: '🍚' },
    { id: 'chicken', labelKey: 'chicken', emoji: '🍗' },
    { id: 'beef', labelKey: 'beef', emoji: '🥩' },
    { id: 'fish', labelKey: 'fish', emoji: '🐟' },
    { id: 'vegetables', labelKey: 'vegetables', emoji: '🥗' },
    { id: 'fruits', labelKey: 'fruits', emoji: '🍉' },
];

export default function RSVPForm() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [form, setForm] = useState({
        name: '',
        phone: '',
        attending: null,
        foods: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleFood = (id) => {
        setForm(f => ({
            ...f,
            foods: f.foods.includes(id) ? f.foods.filter(x => x !== id) : [...f.foods, id],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name.trim()) return setError(t('error_name'));
        if (!form.phone.trim()) return setError(t('error_phone'));
        if (form.attending === null) return setError(t('error_attendance'));

        setLoading(true);
        try {
            await submitRsvp({
                name: form.name.trim(),
                phone: form.phone.trim(),
                attending: form.attending,
                foods: form.attending ? form.foods : [],
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
                    {/* Name */}
                    <div className="form-group">
                        <label htmlFor="name">{t('full_name')}</label>
                        <input
                            id="name"
                            type="text"
                            placeholder={t('name_placeholder')}
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label htmlFor="phone">{t('phone_number')}</label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder={t('phone_placeholder')}
                            value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        />
                    </div>

                    {/* Attendance */}
                    <div className="form-group">
                        <label>{t('attendance')}</label>
                        <div className="attendance-options">
                            <button
                                type="button"
                                className={`attendance-btn ${form.attending === true ? 'active-yes' : ''}`}
                                onClick={() => setForm(f => ({ ...f, attending: true }))}
                            >
                                {t('will_attend')}
                            </button>
                            <button
                                type="button"
                                className={`attendance-btn ${form.attending === false ? 'active-no' : ''}`}
                                onClick={() => setForm(f => ({ ...f, attending: false, foods: [] }))}
                            >
                                {t('will_not_attend')}
                            </button>
                        </div>
                    </div>

                    {/* Food Selection — only when attending */}
                    {form.attending === true && (
                        <div className="form-group fade-in">
                            <label>{t('food_preferences')}</label>
                            <div className="food-grid">
                                {FOODS.map(food => (
                                    <label key={food.id} className={`food-checkbox-card ${form.foods.includes(food.id) ? 'selected' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={form.foods.includes(food.id)}
                                            onChange={() => toggleFood(food.id)}
                                            className="hidden-checkbox"
                                        />
                                        <div className="checkbox-custom"></div>
                                        <span className="food-emoji">{food.emoji}</span>
                                        <span className="food-label-text">{t(food.labelKey)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

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
                </form>
            </div>
        </div>
    );
}
