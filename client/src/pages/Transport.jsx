import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { getTransport } from '../services/api';
import { estimateTransportCost } from '../utils/calculations';

export default function Transport() {
  const { t } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState({});
  const [estimator, setEstimator] = useState({ distance: '', quantity: '' });
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTransport();
        setProviders(res.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleRequest = (id) => {
    setRequested(prev => ({ ...prev, [id]: true }));
  };

  const handleEstimate = () => {
    if (estimator.distance && estimator.quantity) {
      const cost = estimateTransportCost(Number(estimator.distance), Number(estimator.quantity));
      setEstimate(cost);
    }
  };

  return (
    <DashboardLayout title={t('transport_title')}>
      <div className="page-header">
        <h1 className="page-title">🚛 {t('transport_title')}</h1>
        <p className="page-subtitle">Find reliable transport for your crop delivery</p>
      </div>

      {/* Cost estimator */}
      <div className="card" style={{ marginBottom: '20px', border: '2px solid var(--green-primary)' }}>
        <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '12px' }}>🧮 Estimate Transport Cost</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 140px' }}>
            <label className="form-label">Distance (km)</label>
            <input className="form-input" type="number" placeholder="72" value={estimator.distance} onChange={e => setEstimator(p => ({ ...p, distance: e.target.value }))} />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label className="form-label">Quantity (Quintal)</label>
            <input className="form-input" type="number" placeholder="50" value={estimator.quantity} onChange={e => setEstimator(p => ({ ...p, quantity: e.target.value }))} />
          </div>
          <button className="btn btn-primary" onClick={handleEstimate}>Calculate</button>
          {estimate !== null && (
            <div style={{ background: 'var(--green-light)', padding: '12px 20px', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '18px', color: 'var(--green-primary)' }}>
              ≈ ₹{estimate.toLocaleString('en-IN')}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : (
        <div className="grid-2">
          {providers.map(p => (
            <div key={p.id} className="card card-hover" style={{ opacity: p.isAvailable ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '17px' }}>{p.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>Owner: {p.ownerName}</div>
                </div>
                <span className={`badge ${p.isAvailable ? 'badge-green' : 'badge-red'}`}>
                  {p.isAvailable ? t('available') : t('unavailable')}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {[
                  { icon: '🚛', label: 'Vehicle', value: p.vehicleType },
                  { icon: '⚖️', label: t('capacity'), value: `${p.capacity} ${p.capacityUnit}` },
                  { icon: '💰', label: 'Base Price', value: `₹${p.basePrice?.toLocaleString('en-IN')}` },
                  { icon: '⭐', label: t('rating'), value: `${p.rating}/5 (${p.totalTrips} trips)` },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'var(--bg-gray)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{item.icon} {item.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {p.features?.map(f => (
                  <span key={f} className="badge badge-blue" style={{ fontSize: '11px' }}>{f}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {requested[p.id] ? (
                  <div className="alert alert-success" style={{ margin: 0, flex: 1, justifyContent: 'center' }}>
                    ✅ Request Sent! {p.ownerName} will contact you on {p.mobile}
                  </div>
                ) : (
                  <>
                    <button className="btn btn-primary btn-sm" disabled={!p.isAvailable} onClick={() => handleRequest(p.id)}>
                      🚛 {t('request_transport')}
                    </button>
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>📞 {p.mobile}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
