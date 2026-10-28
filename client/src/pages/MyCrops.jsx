import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getFarmerCrops, updateCrop } from '../services/api';

const CROP_ICONS = { Onion: '🧅', Wheat: '🌾', Tomato: '🍅', Soybean: '🫘', Cotton: '🌿', Maize: '🌽', Potato: '🥔', Sugarcane: '🎋' };
const STATUS_BADGE = { Active: 'badge-green', Paused: 'badge-orange', Sold: 'badge-blue', Expired: 'badge-red' };

export default function MyCrops() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFarmerCrops(user.id);
        setCrops(res.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user.id]);

  const handleToggleStatus = async (crop) => {
    const newStatus = crop.status === 'Active' ? 'Paused' : 'Active';
    try {
      await updateCrop(crop.id, { status: newStatus });
      setCrops(prev => prev.map(c => c.id === crop.id ? { ...c, status: newStatus } : c));
      setSuccessMsg(`Listing ${newStatus === 'Active' ? 'activated' : 'paused'} successfully`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) { console.error(e); }
  };

  const filtered = statusFilter === 'All' ? crops : crops.filter(c => c.status === statusFilter);

  return (
    <DashboardLayout title={t('my_crops_title')}>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="page-title">🧅 {t('my_crops_title')}</h1>
            <p className="page-subtitle">{crops.length} total listings</p>
          </div>
          <Link to="/farmer/sell">
            <button className="btn btn-primary">🌾 {t('add_listing')}</button>
          </Link>
        </div>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '16px' }}>✓ {successMsg}</div>}

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['All', 'Active', 'Paused', 'Sold', 'Expired'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}>
            {s === 'All' ? t('all') : t(`status_${s.toLowerCase()}`)}
            {s !== 'All' && <span style={{ marginLeft: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', padding: '0 6px', fontSize: '11px' }}>
              {crops.filter(c => c.status === s).length}
            </span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌾</div>
          <h3>{t('no_crops_yet')}</h3>
          <p>Start by listing your first crop to reach buyers directly.</p>
          <Link to="/farmer/sell"><button className="btn btn-primary">{t('add_listing')}</button></Link>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(crop => (
            <div key={crop.id} className="crop-card">
              <div className="crop-card-header">
                <div className="crop-name">
                  <span>{CROP_ICONS[crop.crop] || '🌾'}</span>
                  <span>{crop.crop}</span>
                  {crop.variety && <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 400 }}>({crop.variety})</span>}
                </div>
                <span className={`badge ${STATUS_BADGE[crop.status] || 'badge-gray'}`}>
                  {t(`status_${crop.status?.toLowerCase()}`) || crop.status}
                </span>
              </div>

              <div className="crop-details">
                <div className="crop-detail-row">
                  <span>⚖️</span>
                  <span style={{ fontWeight: 600 }}>{crop.quantity} {crop.unit}</span>
                  <span style={{ color: 'var(--text-light)' }}>·</span>
                  <span style={{ fontWeight: 700, color: 'var(--green-primary)' }}>₹{crop.expectedPrice?.toLocaleString('en-IN')}/{t('quintal')}</span>
                </div>
                <div className="crop-detail-row">
                  <span>🏷️</span>
                  <span>{crop.quality}</span>
                </div>
                <div className="crop-detail-row">
                  <span>📍</span>
                  <span>{crop.location}</span>
                </div>
                <div className="crop-detail-row">
                  <span>📅</span>
                  <span>Harvest: {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '16px', margin: '14px 0', padding: '10px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>👁️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{crop.views}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{t('buyer_views')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>🤝</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{crop.interestedBuyers}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{t('interested_buyers')}</div>
                  </div>
                </div>
              </div>

              <div className="crop-actions">
                <button className="btn btn-outline btn-sm">👁 {t('view')}</button>
                <button className="btn btn-outline btn-sm">✏️ {t('edit')}</button>
                {(crop.status === 'Active' || crop.status === 'Paused') && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleToggleStatus(crop)}
                    style={{ color: crop.status === 'Active' ? 'var(--orange-accent)' : 'var(--green-primary)' }}>
                    {crop.status === 'Active' ? `⏸ ${t('pause_listing')}` : `▶ ${t('activate_listing')}`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
