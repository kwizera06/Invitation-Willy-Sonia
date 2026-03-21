import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitRsvp } from '../api';
import './RSVPForm.css';

const FOODS = [
    { id: 'rice', label: 'Rice', emoji: '🍚' },
    { id: 'chicken', label: 'Chicken', emoji: '🍗' },
    { id: 'beef', label: 'Beef', emoji: '🥩' },
    { id: 'fish', label: 'Fish', emoji: '🐟' },
    { id: 'vegetables', label: 'Vegetables', emoji: '🥗' },
    { id: 'fruits', label: 'Fruits', emoji: '🍉' },
];

export default function RSVPForm() {
    const navigate = useNavigate();
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

        if (!form.name.trim()) return setError('Please enter your full name.');
        if (!form.phone.trim()) return setError('Please enter your phone number.');
        if (form.attending === null) return setError('Please select your attendance status.');

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
            const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
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
                    <h1>RSVP Confirmation</h1>
                    <p className="rsvp-subtitle">Please fill in your details below</p>
                    <div className="divider"><span className="diamond">◆</span></div>
                </div>

                <form className="card rsvp-card fade-in-up" onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="e.g. Sonia Rukundo"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="e.g. +1 (438) 308-8742"
                            value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        />
                    </div>

                    {/* Attendance */}
                    <div className="form-group">
                        <label>Attendance *</label>
                        <div className="attendance-options">
                            <button
                                type="button"
                                className={`attendance-btn ${form.attending === true ? 'active-yes' : ''}`}
                                onClick={() => setForm(f => ({ ...f, attending: true }))}
                            >
                                ✅ Will Attend
                            </button>
                            <button
                                type="button"
                                className={`attendance-btn ${form.attending === false ? 'active-no' : ''}`}
                                onClick={() => setForm(f => ({ ...f, attending: false, foods: [] }))}
                            >
                                ❌ Will Not Attend
                            </button>
                        </div>
                    </div>

                    {/* Food Selection — only when attending */}
                    {form.attending === true && (
                        <div className="form-group fade-in">
                            <label>Food Preferences (select all that apply)</label>
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
                                        <span className="food-label-text">{food.label}</span>
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
                        {loading ? '⏳ Submitting…' : '💌 Submit RSVP'}
                    </button>

                    <p className="rsvp-back">
                        <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>
                            ← Back to Invitation
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
