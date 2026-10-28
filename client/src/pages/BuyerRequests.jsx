import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getRequests, updateRequest } from '../services/api';
import { sendBuyerRequestEmail } from '../services/api';

const STATUS_BADGE = { Pending: 'badge-orange', Negotiating: 'badge-blue', Accepted: 'badge-green', Rejected: 'badge-red' };

export default function BuyerRequests() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [message, setMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getRequests({ farmerId: user.id });
        setRequests(res.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user.id]);

  const handleAction = async (reqId, action, extraData = {}) => {
    const statusMap = { accept: 'Accepted', reject: 'Rejected', negotiate: 'Negotiating' };
    try {
      const req = requests.find(r => r.id === reqId);
      const updatedHistory = action === 'negotiate' && counterPrice
        ? [...(req.negotiationHistory || []), { from: 'farmer', price: Number(counterPrice), message: message || `Counter offer: ₹${counterPrice}/Quintal`, timestamp: new Date().toISOString() }]
        : req.negotiationHistory;
      await updateRequest(reqId, { status: statusMap[action], negotiationHistory: updatedHistory, ...extraData });
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: statusMap[action], negotiationHistory: updatedHistory } : r));
      setSuccessMsg(`Request ${statusMap[action]} successfully`);
      setSelected(null); setCounterPrice(''); setMessage('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) { console.error(e); }
  };

  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  return (
    <DashboardLayout title={t('requests_title')}>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="page-title">📩 {t('requests_title')}</h1>
            <p className="page-subtitle">{pendingCount} pending · {requests.length} total</p>
          </div>
        </div>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '16px' }}>✓ {successMsg}</div>}

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📩</div>
          <h3>{t('no_requests')}</h3>
          <p>List your crops to start receiving buyer requests.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map(req => (
            <div key={req.id} className="card" style={{ border: req.status === 'Pending' ? '2px solid var(--orange-accent)' : '1px solid var(--border)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '16px' }}>{req.buyerName}</span>
                    <span className="badge badge-blue">{req.buyerType}</span>
                    <span className={`badge ${STATUS_BADGE[req.status] || 'badge-gray'}`}>{req.status}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>📍 {req.buyerLocation}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>{t('offered_price')}</div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--green-primary)' }}>
                    ₹{req.offeredPrice?.toLocaleString('en-IN')}
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-light)' }}>/{t('quintal')}</span>
                  </div>
                </div>
              </div>

              {/* Request details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {[
                  { icon: '🌾', label: 'Crop', value: req.crop },
                  { icon: '⚖️', label: t('requested_qty'), value: `${req.quantity} ${req.unit}` },
                  { icon: '📅', label: t('delivery_by'), value: req.deliveryDate ? new Date(req.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A' },
                  { icon: '🚚', label: 'Delivery', value: req.deliveryRequired ? 'Required' : 'Self Pickup' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'var(--bg-gray)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '2px' }}>{item.icon} {item.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {req.message && (
                <div style={{ background: 'var(--blue-light)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)', borderLeft: '3px solid var(--blue-info)' }}>
                  💬 "{req.message}"
                </div>
              )}

              {/* Negotiation history */}
              {req.negotiationHistory?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Negotiation History</div>
                  <div className="negotiation-chat">
                    {req.negotiationHistory.map((msg, i) => (
                      <div key={i} className={`chat-bubble ${msg.from}`}>
                        <div className="sender">{msg.from === 'farmer' ? '👨‍🌾 You' : `🏭 ${req.buyerName}`}</div>
                        {msg.price && <div className="price-highlight">₹{msg.price?.toLocaleString('en-IN')}/{t('quintal')}</div>}
                        <div>{msg.message}</div>
                        <div className="timestamp">{msg.timestamp ? new Date(msg.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action area */}
              {(req.status === 'Pending' || req.status === 'Negotiating') && (
                <>
                  {selected?.id === req.id ? (
                    <div style={{ background: 'var(--bg-gray)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>💬 {t('counter_offer')}</div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <div style={{ flex: '1 1 160px' }}>
                          <label className="form-label">Your Price (₹/{t('quintal')})</label>
                          <input className="form-input" type="number" placeholder={req.offeredPrice + 100} value={counterPrice} onChange={e => setCounterPrice(e.target.value)} />
                        </div>
                        <div style={{ flex: '2 1 220px' }}>
                          <label className="form-label">Message (optional)</label>
                          <input className="form-input" placeholder="Reason for counter offer..." value={message} onChange={e => setMessage(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleAction(req.id, 'negotiate')} disabled={!counterPrice}>
                          📤 Send Counter Offer
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>{t('cancel')}</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAction(req.id, 'accept')} style={{ gap: '6px' }}>
                        ✅ {t('accept')}
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelected(req)} style={{ gap: '6px', color: 'var(--blue-info)', borderColor: 'var(--blue-info)' }}>
                        💬 {t('negotiate')}
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleAction(req.id, 'reject')} style={{ gap: '6px', color: 'var(--red-alert)', borderColor: 'var(--red-alert)' }}>
                        ✗ {t('reject')}
                      </button>
                    </div>
                  )}
                </>
              )}

              {req.status === 'Accepted' && (
                <div className="badge badge-green" style={{ fontSize: '14px', padding: '8px 16px' }}>✅ Accepted — Proceed to arrange transport</div>
              )}
              {req.status === 'Rejected' && (
                <div className="badge badge-red" style={{ fontSize: '14px', padding: '8px 16px' }}>✗ Rejected</div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
