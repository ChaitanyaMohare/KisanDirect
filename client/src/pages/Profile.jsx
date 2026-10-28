import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CROPS = ['Onion', 'Wheat', 'Tomato', 'Soybean', 'Cotton', 'Maize', 'Potato', 'Sugarcane'];
const DISTRICTS = ['Ahmednagar', 'Nashik', 'Pune', 'Nagpur', 'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur', 'Latur'];

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', village: user?.village || '', district: user?.district || '', mainCrop: user?.mainCrop || 'Onion', landHolding: user?.landHolding || '' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const verifications = [
    { key: 'mobile_verified', done: user?.mobileVerified },
    { key: 'farmer_verified', done: user?.farmerVerified },
    { key: 'location_verified', done: user?.locationVerified },
  ];

  return (
    <DashboardLayout title={t('profile_title')}>
      <div className="page-header">
        <h1 className="page-title">👤 {t('profile_title')}</h1>
      </div>

      {saved && <div className="alert alert-success" style={{ marginBottom: '16px' }}>✓ {t('save_changes')} — Profile updated</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        {/* Main profile card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#fff', fontWeight: 800 }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '22px' }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>{user?.village}, {user?.district}, {user?.state}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-green">👨‍🌾 Farmer</span>
                {user?.mainCrop && <span className="badge badge-orange">🌾 {user.mainCrop}</span>}
                <span className="demo-badge">DEMO</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              {editing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSave}>{t('save_changes')}</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>{t('cancel')}</button>
                </div>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>✏️ {t('edit_profile')}</button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="grid-2">
              {[
                { label: t('name'), key: 'name', type: 'text' },
                { label: t('village'), key: 'village', type: 'text' },
                { label: t('land_holding'), key: 'landHolding', type: 'text', placeholder: '5 acres' },
              ].map(field => (
                <div key={field.key} className="form-group">
                  <label className="form-label">{field.label}</label>
                  <input className="form-input" type={field.type} placeholder={field.placeholder} value={form[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">{t('district')}</label>
                <select className="form-select" value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))}>
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('main_crop')}</label>
                <select className="form-select" value={form.mainCrop} onChange={e => setForm(p => ({ ...p, mainCrop: e.target.value }))}>
                  {CROPS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { icon: '📱', label: t('mobile_number'), value: user?.mobile },
                { icon: '🌾', label: t('main_crop'), value: user?.mainCrop },
                { icon: '🏘️', label: t('village'), value: user?.village || '—' },
                { icon: '📍', label: t('district'), value: user?.district },
                { icon: '🗺️', label: t('state'), value: user?.state },
                { icon: '🌱', label: 'Land Holding', value: user?.landHolding || '—' },
                { icon: '🗓️', label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
                { icon: '🌐', label: t('preferred_language'), value: user?.preferredLanguage === 'hi' ? 'हिंदी' : 'English' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '12px', background: 'var(--bg-gray)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '2px' }}>{item.icon} {item.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.value || '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>🛡️ Verification Status</h3>
            <div className="verification-list">
              {verifications.map(v => (
                <div key={v.key} className={`verify-item ${v.done ? 'verified' : 'pending'}`}>
                  <span style={{ fontSize: '18px' }}>{v.done ? '✅' : '⭕'}</span>
                  <span>{t(v.key)}</span>
                  {!v.done && <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#fff3e0', color: '#e65100', padding: '2px 8px', borderRadius: '20px' }}>Pending</span>}
                </div>
              ))}
            </div>
            {!user?.farmerVerified && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#fff3e0', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: '#e65100' }}>
                💡 Complete verification to build buyer trust and get more orders.
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 800, marginBottom: '12px' }}>📊 Quick Stats</h3>
            {[
              { icon: '🌾', label: t('active_listings'), value: user?.activeListings || 0 },
              { icon: '💰', label: t('total_earnings'), value: `₹${(user?.totalEarnings || 0).toLocaleString('en-IN')}` },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: '14px' }}>{s.icon} {s.label}</span>
                <span style={{ fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: 'var(--green-light)', border: 'none' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--green-dark)' }}>🔒 Account Security</h4>
            <p style={{ fontSize: '13px', color: 'var(--green-dark)', lineHeight: 1.6 }}>
              Keep your mobile number updated. Never share your password with anyone.
            </p>
            <button className="btn btn-outline btn-sm" style={{ marginTop: '10px', borderColor: 'var(--green-primary)', color: 'var(--green-primary)' }}>
              🔑 Change Password
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
