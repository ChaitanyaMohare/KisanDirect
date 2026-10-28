import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import { getCrops, submitReport } from '../services/api';

const CROP_ICONS = { Onion: '🧅', Wheat: '🌾', Tomato: '🍅', Soybean: '🫘', Cotton: '🌿', Maize: '🌽', Potato: '🥔' };
const CROPS_FILTER = ['All', 'Onion', 'Wheat', 'Tomato', 'Soybean', 'Cotton', 'Maize', 'Potato'];
const DISTRICTS = ['All', 'Ahmednagar', 'Nashik', 'Pune', 'Nagpur', 'Solapur', 'Latur'];
const QUALITY = ['All', 'Grade A', 'Grade B', 'Export Quality'];

export default function Marketplace() {
  const { t } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ crop: 'All', district: 'All', quality: 'All' });
  const [contacted, setContacted] = useState({});
  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCrops({ status: 'Active' });
        setCrops(res.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = crops.filter(c => {
    const matchSearch = !search || c.crop.toLowerCase().includes(search.toLowerCase()) || c.farmerName?.toLowerCase().includes(search.toLowerCase());
    const matchCrop = filters.crop === 'All' || c.crop === filters.crop;
    const matchDistrict = filters.district === 'All' || c.district === filters.district;
    const matchQuality = filters.quality === 'All' || c.quality === filters.quality;
    return matchSearch && matchCrop && matchDistrict && matchQuality;
  });

  const handleContact = (cropId) => setContacted(p => ({ ...p, [cropId]: true }));

  const handleReport = async () => {
    if (!reportReason) return;
    try {
      await submitReport({ listingId: reportModal, reason: reportReason });
      setReportSuccess(true);
      setTimeout(() => { setReportModal(null); setReportSuccess(false); setReportReason(''); }, 2000);
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gray)' }}>
      <Navbar />

      {/* Header banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-dark), var(--green-primary))', color: '#fff', padding: '32px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
            🌾 {t('marketplace_title')}
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.85 }}>
            Buy directly from verified farmers — fresh crops, fair prices, no middlemen.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 20px' }}>
        {/* Search & Filter bar */}
        <div className="filter-bar">
          <div className="search-input-wrapper" style={{ flex: '1 1 220px' }}>
            <span className="search-icon">🔍</span>
            <input className="form-input" placeholder={t('search_crop')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowFilters(!showFilters)}>
            ⚙️ {t('filter')} {showFilters ? '▲' : '▼'}
          </button>
          <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>{filtered.length} listings found</div>
        </div>

        {showFilters && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', padding: '16px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            {[
              { label: t('select_crop'), key: 'crop', options: CROPS_FILTER },
              { label: t('district'), key: 'district', options: DISTRICTS },
              { label: t('quality_grade'), key: 'quality', options: QUALITY },
            ].map(f => (
              <div key={f.key} style={{ flex: '1 1 160px' }}>
                <label className="form-label">{f.label}</label>
                <select className="form-select" value={filters[f.key]} onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setFilters({ crop: 'All', district: 'All', quality: 'All' })}>
                ✕ Clear
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="spinner-container"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌾</div>
            <h3>No listings found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(crop => (
              <div key={crop.id} className="card card-hover" style={{ position: 'relative' }}>
                {/* Direct from farmer badge */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--green-primary)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🌱 {t('direct_from_farmer')}
                </div>

                {/* Crop header */}
                <div style={{ paddingTop: '32px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '32px' }}>{CROP_ICONS[crop.crop] || '🌾'}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '18px' }}>{crop.crop}</div>
                      {crop.variety && <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{crop.variety}</div>}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div style={{ background: 'var(--green-light)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>PRICE</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--green-primary)' }}>
                      ₹{crop.expectedPrice?.toLocaleString('en-IN')}
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-light)' }}>/{t('quintal')}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>QUANTITY</div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{crop.quantity} {crop.unit}</div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span>👨‍🌾</span>
                    <span style={{ fontWeight: 600 }}>{crop.farmerName}</span>
                    <span style={{ color: 'var(--text-light)' }}>· {crop.farmerLocation}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span>🏷️</span><span>{crop.quality}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span>📅</span>
                    <span>Harvest: {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}</span>
                  </div>
                </div>

                {/* Description */}
                {crop.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {crop.description}
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {contacted[crop.id] ? (
                    <div className="alert alert-success" style={{ margin: 0, flex: 1, fontSize: '13px', padding: '8px 12px' }}>
                      ✅ Request sent to {crop.farmerName}
                    </div>
                  ) : (
                    <>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleContact(crop.id)}>
                        📞 {t('contact_farmer')}
                      </button>
                      <button className="btn btn-outline btn-sm" title={t('report_listing')} onClick={() => setReportModal(crop.id)} style={{ color: 'var(--text-light)' }}>
                        🚩
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report modal */}
      {reportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>🚩 {t('report_listing')}</h3>
            {reportSuccess ? (
              <div className="alert alert-success">✓ Report submitted. We'll review this listing.</div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">{t('report_reason')}</label>
                  <select className="form-select" value={reportReason} onChange={e => setReportReason(e.target.value)}>
                    <option value="">Select reason</option>
                    {['report_fake', 'report_wrong_price', 'report_wrong_qty', 'report_fraud', 'report_other'].map(r => (
                      <option key={r} value={r}>{t(r)}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-danger btn-sm" onClick={handleReport}>{t('submit_report')}</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setReportModal(null)}>{t('cancel')}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
