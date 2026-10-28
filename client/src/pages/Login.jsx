import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';

export default function Login() {
  const { login, demoLogin, loading, error } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Where the user was trying to go before being sent to /login
  const from = location.state?.from;

  const [form, setForm] = useState({ mobile: '', password: '', role: 'farmer' });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.mobile) return 'Mobile number is required';
    if (!/^\d{10}$/.test(form.mobile) && form.role !== 'admin') return 'Enter a valid 10-digit mobile number';
    if (!form.password) return 'Password is required';
    return '';
  };

  const redirectAfterLogin = (user) => {
    if (from) { navigate(from, { replace: true }); return; }
    if (user.role === 'farmer') navigate('/farmer/dashboard');
    else if (user.role === 'buyer') navigate('/marketplace');
    else navigate('/admin');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError('');
    try {
      const user = await login(form.mobile, form.password, form.role);
      redirectAfterLogin(user);
    } catch (e) { /* handled by context */ }
  };

  const handleDemo = async (role) => {
    try {
      const user = await demoLogin(role);
      redirectAfterLogin(user);
    } catch (e) { /* ignore */ }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gray)' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 68px)', padding: '20px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>

          {/* Show banner when redirected from a protected page */}
          {from && (
            <div className="alert alert-info" style={{ marginBottom: '20px' }}>
              🔒 Please log in to access that page.
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌿</div>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t('login_title')}</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '6px' }}>
              सीधे बेचें, ज्यादा कमाएँ
            </p>
          </div>

          {/* Role selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {['farmer', 'buyer', 'admin'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setForm(p => ({ ...p, role }))}
                className={`btn btn-sm ${form.role === role ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, textTransform: 'capitalize' }}
              >
                {role === 'farmer' ? '👨‍🌾' : role === 'buyer' ? '🏭' : '⚙️'} {role}
              </button>
            ))}
          </div>

          {(error || formError) && (
            <div className="alert alert-error">{formError || error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('mobile_number')}</label>
              <input
                className="form-input"
                type={form.role === 'admin' ? 'text' : 'tel'}
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder={form.role === 'admin' ? 'admin' : '9876543210'}
                maxLength={form.role === 'admin' ? 20 : 10}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('password')}</label>
              <input
                className="form-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <div style={{ textAlign: 'right', marginTop: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--green-primary)', cursor: 'pointer', fontWeight: 500 }}>{t('forgot_password')}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? '...' : t('nav_login')}
            </button>
          </form>

          <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-light)', fontSize: '14px' }}>— {t('or')} —</div>

          {/* Demo logins */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn btn-outline btn-full" onClick={() => handleDemo('farmer')} disabled={loading} style={{ justifyContent: 'center', gap: '8px' }}>
              👨‍🌾 {t('demo_login')} — Farmer (Ramesh Patil)
            </button>
            <button className="btn btn-outline btn-full" onClick={() => handleDemo('buyer')} disabled={loading} style={{ justifyContent: 'center', gap: '8px' }}>
              🏭 {t('demo_login')} — Buyer
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
            {t('no_account')} <Link to="/register" style={{ color: 'var(--green-primary)', fontWeight: 700 }}>{t('register_here')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
