import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';

const CROPS         = ['Onion', 'Wheat', 'Tomato', 'Soybean', 'Cotton', 'Maize', 'Potato', 'Sugarcane', 'Other'];
const STATES        = ['Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Punjab', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Andhra Pradesh'];
const DISTRICTS_MH  = ['Ahmednagar', 'Nashik', 'Pune', 'Nagpur', 'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur', 'Latur', 'Satara', 'Sangli'];
const BUSINESS_TYPES = ['Processor', 'Exporter', 'Retailer', 'Trader', 'Wholesaler', 'Restaurant Chain', 'Other'];

export default function Register() {
  const { register, loading, error } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole]           = useState('farmer');
  const [formError, setFormError] = useState('');

  const [farmerForm, setFarmerForm] = useState({
    name: '', mobile: '', email: '', password: '', confirmPassword: '',
    village: '', district: '', state: 'Maharashtra',
    preferredLanguage: 'hi', mainCrop: 'Onion', landHolding: '',
  });

  const [buyerForm, setBuyerForm] = useState({
    name: '', companyName: '', mobile: '', email: '',
    businessType: '', location: '', district: '', state: 'Maharashtra',
  });

  const handleFarmerChange = (e) => setFarmerForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleBuyerChange  = (e) => setBuyerForm(p  => ({ ...p, [e.target.name]: e.target.value }));

  const validateFarmer = () => {
    if (!farmerForm.name.trim())                     return 'Name is required';
    if (!/^\d{10}$/.test(farmerForm.mobile))         return 'Enter a valid 10-digit mobile number';
    if (farmerForm.password.length < 6)              return 'Password must be at least 6 characters';
    if (farmerForm.password !== farmerForm.confirmPassword) return 'Passwords do not match';
    if (farmerForm.email && !/\S+@\S+\.\S+/.test(farmerForm.email)) return 'Enter a valid email address';
    return '';
  };

  const validateBuyer = () => {
    if (!buyerForm.name.trim())             return 'Name is required';
    if (!/^\d{10}$/.test(buyerForm.mobile)) return 'Enter a valid 10-digit mobile number';
    if (buyerForm.email && !/\S+@\S+\.\S+/.test(buyerForm.email)) return 'Enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const err = role === 'farmer' ? validateFarmer() : validateBuyer();
    if (err) { setFormError(err); return; }
    try {
      if (role === 'farmer') {
        const { confirmPassword, ...data } = farmerForm;
        await register(data, 'farmer');
        // If email provided → go to OTP verification, else straight to dashboard
        if (farmerForm.email) {
          navigate('/verify-email', {
            state: { email: farmerForm.email, name: farmerForm.name, redirect: '/farmer/dashboard' }
          });
        } else {
          navigate('/farmer/dashboard');
        }
      } else {
        await register(buyerForm, 'buyer');
        if (buyerForm.email) {
          navigate('/verify-email', {
            state: { email: buyerForm.email, name: buyerForm.name, redirect: '/marketplace' }
          });
        } else {
          navigate('/marketplace');
        }
      }
    } catch (e) { /* AuthContext sets error */ }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gray)' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 68px)', padding: '20px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '40px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🌿</div>
            <h1 style={{ fontSize: '22px', fontWeight: 800 }}>
              {role === 'farmer' ? t('register_farmer') : t('register_buyer')}
            </h1>
          </div>

          {/* Role toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--bg-gray)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
            <button type="button" onClick={() => setRole('farmer')}
              className={`btn btn-sm ${role === 'farmer' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, border: 'none' }}>
              👨‍🌾 {t('register_farmer')}
            </button>
            <button type="button" onClick={() => setRole('buyer')}
              className={`btn btn-sm ${role === 'buyer' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, border: 'none' }}>
              🏭 {t('register_buyer')}
            </button>
          </div>

          {(formError || error) && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>{formError || error}</div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ── FARMER FORM ── */}
            {role === 'farmer' && (
              <>
                {/* Name + Mobile */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('name')} *</label>
                    <input className="form-input" name="name" value={farmerForm.name}
                      onChange={handleFarmerChange} placeholder="Ramesh Patil" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('mobile_number')} *</label>
                    <input className="form-input" name="mobile" type="tel" value={farmerForm.mobile}
                      onChange={handleFarmerChange} placeholder="9876543210" maxLength={10} required />
                  </div>
                </div>

                {/* Email — optional, used for notifications */}
                <div className="form-group">
                  <label className="form-label">
                    Email Address
                    <span style={{ marginLeft: '6px', fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '1px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      📧 Enables email alerts
                    </span>
                  </label>
                  <input className="form-input" name="email" type="email" value={farmerForm.email}
                    onChange={handleFarmerChange} placeholder="ramesh@example.com (optional)" />
                  <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                    Get buyer requests, order updates & price alerts by email.
                  </div>
                </div>

                {/* Password */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('password')} *</label>
                    <input className="form-input" name="password" type="password" value={farmerForm.password}
                      onChange={handleFarmerChange} placeholder="Min 6 chars" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <input className="form-input" name="confirmPassword" type="password" value={farmerForm.confirmPassword}
                      onChange={handleFarmerChange} placeholder="••••••" required />
                  </div>
                </div>

                {/* Village + District */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('village')}</label>
                    <input className="form-input" name="village" value={farmerForm.village}
                      onChange={handleFarmerChange} placeholder="Kopargaon" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('district')}</label>
                    <select className="form-select" name="district" value={farmerForm.district} onChange={handleFarmerChange}>
                      <option value="">Select District</option>
                      {DISTRICTS_MH.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* State + Main Crop */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('state')}</label>
                    <select className="form-select" name="state" value={farmerForm.state} onChange={handleFarmerChange}>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('main_crop')}</label>
                    <select className="form-select" name="mainCrop" value={farmerForm.mainCrop} onChange={handleFarmerChange}>
                      {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Language preference */}
                <div className="form-group">
                  <label className="form-label">{t('preferred_language')}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['en', 'hi'].map(lang => (
                      <button key={lang} type="button"
                        className={`btn btn-sm ${farmerForm.preferredLanguage === lang ? 'btn-primary' : 'btn-outline'}`}
                        style={{ flex: 1 }}
                        onClick={() => setFarmerForm(p => ({ ...p, preferredLanguage: lang }))}>
                        {lang === 'en' ? '🇬🇧 English' : '🇮🇳 हिंदी'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── BUYER FORM ── */}
            {role === 'buyer' && (
              <>
                {/* Name + Company */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('name')} *</label>
                    <input className="form-input" name="name" value={buyerForm.name}
                      onChange={handleBuyerChange} placeholder="Anil Mehta" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('company_name')}</label>
                    <input className="form-input" name="companyName" value={buyerForm.companyName}
                      onChange={handleBuyerChange} placeholder="ABC Foods Pvt. Ltd." />
                  </div>
                </div>

                {/* Mobile + Email */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('mobile_number')} *</label>
                    <input className="form-input" name="mobile" type="tel" value={buyerForm.mobile}
                      onChange={handleBuyerChange} placeholder="9871234560" maxLength={10} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Email
                      <span style={{ marginLeft: '6px', fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '1px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        📧 Welcome email
                      </span>
                    </label>
                    <input className="form-input" name="email" type="email" value={buyerForm.email}
                      onChange={handleBuyerChange} placeholder="anil@abcfoods.in" />
                  </div>
                </div>

                {/* Business type + District */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('business_type')}</label>
                    <select className="form-select" name="businessType" value={buyerForm.businessType} onChange={handleBuyerChange}>
                      <option value="">Select Type</option>
                      {BUSINESS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('district')}</label>
                    <select className="form-select" name="district" value={buyerForm.district} onChange={handleBuyerChange}>
                      <option value="">Select District</option>
                      {DISTRICTS_MH.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '8px' }} disabled={loading}>
              {loading ? t('loading') : (role === 'farmer' ? t('register_farmer') : t('register_buyer'))}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
            {t('already_have_account')}{' '}
            <Link to="/login" style={{ color: 'var(--green-primary)', fontWeight: 700 }}>
              {t('nav_login')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
