import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getMarketPrices } from '../services/api';
import { generateSellingRecommendations, formatIndianCurrency } from '../utils/calculations';
import { PriceLineChart } from '../components/PriceChart';
import DashboardLayout from '../components/DashboardLayout';
import Navbar from '../components/Navbar';
import LiveMandiPrices from '../components/LiveMandiPrices';
import { sendPriceAlertEmail } from '../services/api';

// ── Smart Tools (Price Trends tab) — preserved from original ──────────────
const CROPS    = ['Onion', 'Wheat', 'Tomato', 'Soybean', 'Cotton', 'Maize', 'Potato'];
const DISTRICTS = ['All', 'Ahmednagar', 'Nashik', 'Pune', 'Nagpur', 'Latur', 'Solapur'];

function SmartPriceTrends({ user, t, language }) {
  const [selectedCrop,     setSelectedCrop]     = useState('Onion');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [allPrices,        setAllPrices]        = useState([]);
  const [filtered,         setFiltered]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [selectedMarket,   setSelectedMarket]   = useState(null);
  const [recForm,          setRecForm]          = useState({ crop: 'Onion', quantity: 50 });
  const [recommendations,  setRecommendations]  = useState([]);
  const [showRec,          setShowRec]          = useState(false);
  const [alertForm,        setAlertForm]        = useState({ crop: 'Onion', targetPrice: '', market: '' });
  const [alertSet,         setAlertSet]         = useState(false);

  useEffect(() => {
    getMarketPrices({}).then(r => setAllPrices(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let r = allPrices.filter(p => p.crop === selectedCrop);
    if (selectedDistrict !== 'All') r = r.filter(p => p.district === selectedDistrict);
    r = [...r].sort((a, b) => b.price - a.price).map((p, i) => ({ ...p, isBestPrice: i === 0 }));
    setFiltered(r); setSelectedMarket(r[0] || null);
  }, [allPrices, selectedCrop, selectedDistrict]);

  const best  = filtered[0];
  const worst = filtered[filtered.length - 1];
  const diff  = best && worst ? best.price - worst.price : 0;

  return (
    <div>
      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label className="form-label">{t('select_crop')}</label>
            <select className="form-select" value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>
              {CROPS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label className="form-label">{t('select_district')}</label>
            <select className="form-select" value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
              {DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? <div className="spinner-container"><div className="spinner" /></div> : (
        <>
          {best && (
            <div style={{ background: 'linear-gradient(135deg,var(--green-dark),var(--green-primary))', borderRadius: 'var(--radius-md)', padding: '20px 24px', marginBottom: '20px', color: '#fff', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase' }}>⭐ {t('best_price_nearby')}</div>
                <div style={{ fontSize: '34px', fontWeight: 900 }}>₹{best.price?.toLocaleString('en-IN')}<span style={{ fontSize: '14px', opacity: 0.8 }}>/{t('quintal')}</span></div>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>{best.market}, {best.district}</div>
                {diff > 0 && <div style={{ marginTop: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '4px 12px', display: 'inline-block', fontSize: '13px', fontWeight: 700 }}>₹{diff.toLocaleString('en-IN')} {t('more_than_local')}</div>}
              </div>
              <div style={{ textAlign: 'right', opacity: 0.9 }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: best.trendDirection === 'up' ? '#a5d6a7' : '#ef9a9a' }}>
                  {best.trendDirection === 'up' ? '↑' : '↓'} {Math.abs(best.trend)}%
                </div>
              </div>
            </div>
          )}

          {/* Comparison table */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '16px' }}>{selectedCrop} — Price Comparison</h3>
            {filtered.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>No data</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-gray)' }}>
                      {[t('market'), t('price'), t('distance'), t('trend'), t('buyer_demand'), ''].map((h, i) => (
                        <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} style={{ borderTop: '1px solid var(--border)', background: p.isBestPrice ? 'var(--green-light)' : 'transparent', cursor: 'pointer' }} onClick={() => setSelectedMarket(p)}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700 }}>{p.market}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{p.district}</div>
                          {p.isBestPrice && <span className="badge badge-green" style={{ fontSize: '10px' }}>⭐ Best</span>}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--green-primary)' }}>₹{p.price?.toLocaleString('en-IN')}</span>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{p.distance} km</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ color: p.trendDirection === 'up' ? 'var(--green-primary)' : 'var(--red-alert)', fontWeight: 700 }}>
                            {p.trendDirection === 'up' ? '↑' : '↓'} {Math.abs(p.trend)}%
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className={`badge ${p.buyerDemand === 'High' ? 'badge-green' : p.buyerDemand === 'Medium' ? 'badge-orange' : 'badge-gray'}`}>{p.buyerDemand}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); setSelectedMarket(p); }}>📈 Chart</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Price chart */}
          {selectedMarket?.priceHistory && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>📈 {selectedMarket.market} — {t('price_trend')}</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '13px', marginBottom: '16px' }}>{selectedCrop} · Last 7 days</p>
              <PriceLineChart data={selectedMarket.priceHistory} dataKey="price" xKey="date" />
            </div>
          )}

          {/* Smart selling */}
          <div className="card" style={{ marginBottom: '20px', border: '2px solid var(--green-primary)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>🧭 {t('where_to_sell')}</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '20px' }}>Calculates NET earnings after transport.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ flex: '1 1 160px' }}>
                <label className="form-label">{t('select_crop')}</label>
                <select className="form-select" value={recForm.crop} onChange={e => setRecForm(p => ({ ...p, crop: e.target.value }))}>
                  {CROPS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label className="form-label">Quantity (Quintal)</label>
                <input className="form-input" type="number" value={recForm.quantity} min={1} max={1000} onChange={e => setRecForm(p => ({ ...p, quantity: e.target.value }))} />
              </div>
              <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => { setRecommendations(generateSellingRecommendations(recForm.crop, Number(recForm.quantity), '', allPrices)); setShowRec(true); }}>🔍 Get Recommendation</button>
              </div>
            </div>
            {showRec && recommendations.length > 0 && (
              <div style={{ background: 'var(--green-light)', border: '2px solid var(--green-primary)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                <div className="badge badge-green" style={{ marginBottom: '8px' }}>✓ {t('recommended')}</div>
                <h4 style={{ fontWeight: 800, fontSize: '20px' }}>{recommendations[0].market}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{recommendations[0].district} · {recommendations[0].distance} km</p>
                <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--green-primary)', marginTop: '8px' }}>{formatIndianCurrency(recommendations[0].netEarning)}</div>
              </div>
            )}
          </div>

          {/* Price alert */}
          {user?.role === 'farmer' && (
            <div className="card">
              <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>🔔 {t('price_alert')}</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '13px', marginBottom: '16px' }}>{t('alert_desc')}</p>
              {alertSet ? (
                <div className="alert alert-success">🔔 {alertForm.crop} alert active — ₹{alertForm.targetPrice}/Quintal</div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <label className="form-label">{t('select_crop')}</label>
                    <select className="form-select" value={alertForm.crop} onChange={e => setAlertForm(p => ({ ...p, crop: e.target.value }))}>
                      {CROPS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <label className="form-label">{t('target_price')} (₹)</label>
                    <input className="form-input" type="number" placeholder="3200" value={alertForm.targetPrice} onChange={e => setAlertForm(p => ({ ...p, targetPrice: e.target.value }))} />
                  </div>
                  <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => {
                      if (!alertForm.targetPrice) return;
                      setAlertSet(true);
                      if (user?.email) {
                        sendPriceAlertEmail({ to: user.email, farmerName: user.name, crop: alertForm.crop, targetPrice: alertForm.targetPrice, market: alertForm.market || 'any market', currentPrice: alertForm.targetPrice }).catch(() => {});
                      }
                    }}>🔔 {t('set_alert')}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
function MarketPricesContent() {
  const { t, language } = useLanguage();
  const { user }        = useAuth();
  const hi              = language === 'hi';

  const [activeTab, setActiveTab] = useState('live');

  const content = (
    <div>
      {/* Tab switcher — matches reference screenshot style */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', width: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <button
          onClick={() => setActiveTab('live')}
          style={{
            padding: '10px 20px', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '7px',
            background: activeTab === 'live' ? '#16a34a' : 'transparent',
            color: activeTab === 'live' ? '#fff' : '#6b7280',
            transition: 'all 0.15s',
          }}>
          <span>🔍</span>
          <span>{hi ? 'भाव खोजें' : 'Search Prices'}</span>
          {activeTab !== 'live' && <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '1px 7px', borderRadius: '10px', fontWeight: 800 }}>LIVE</span>}
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          style={{
            padding: '10px 20px', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '7px',
            background: activeTab === 'trends' ? '#16a34a' : 'transparent',
            color: activeTab === 'trends' ? '#fff' : '#6b7280',
            borderLeft: '1px solid #e5e7eb', transition: 'all 0.15s',
          }}>
          <span>📈</span>
          <span>{hi ? 'मूल्य रुझान' : 'Price Trends'}</span>
          <span style={{ fontSize: '10px', background: activeTab === 'trends' ? 'rgba(255,255,255,0.25)' : '#fef3c7', color: activeTab === 'trends' ? '#fff' : '#b45309', padding: '1px 7px', borderRadius: '10px', fontWeight: 800 }}>NEW</span>
        </button>
      </div>

      {activeTab === 'live'   && <LiveMandiPrices />}
      {activeTab === 'trends' && <SmartPriceTrends user={user} t={t} language={language} />}
    </div>
  );

  if (user?.role === 'farmer') {
    return <DashboardLayout title={hi ? 'बाजार भाव' : 'Market Prices'}>{content}</DashboardLayout>;
  }
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div className="container" style={{ padding: '24px 20px' }}>{content}</div>
    </div>
  );
}

export default MarketPricesContent;
