import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { PriceLineChart } from '../components/PriceChart';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getFarmerCrops, getRequests, getOrders, getEarnings, getAlerts, getMarketPricesByCrop } from '../services/api';
import { formatIndianCurrency } from '../utils/calculations';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState({ crops: [], requests: [], orders: [], earnings: null, alerts: [], priceData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cropsRes, reqRes, ordRes, earnRes, alertRes, priceRes] = await Promise.all([
          getFarmerCrops(user.id),
          getRequests({ farmerId: user.id }),
          getOrders({ farmerId: user.id }),
          getEarnings(user.id),
          getAlerts(user.id),
          getMarketPricesByCrop(user.mainCrop || 'Onion')
        ]);
        setData({
          crops: cropsRes.data.data || [],
          requests: reqRes.data.data || [],
          orders: ordRes.data.data || [],
          earnings: earnRes.data.data || null,
          alerts: alertRes.data.data || [],
          priceData: priceRes.data.data?.[0]?.priceHistory || []
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user.id, user.mainCrop]);

  const activeListings = data.crops.filter(c => c.status === 'Active').length;
  const pendingRequests = data.requests.filter(r => r.status === 'Pending').length;
  const completedOrders = data.orders.filter(o => o.status === 'Completed').length;
  const totalEarnings = data.earnings?.totalEarnings || user.totalEarnings || 0;
  const bestPrice = data.priceData?.length ? Math.max(...data.priceData.map(p => p.price)) : null;
  const activeAlerts = data.alerts.filter(a => a.isActive);

  return (
    <DashboardLayout title={t('dashboard')}>
      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : (
        <>
          {/* Greeting */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800 }}>
              {t('namaste')}, {user.name} 👋
            </h2>
            <p style={{ color: 'var(--text-light)', fontSize: '15px', marginTop: '4px' }}>
              {user.village}, {user.district} · {user.mainCrop}
            </p>
          </div>

          {/* Active price alert banner */}
          {activeAlerts.length > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: '20px', background: '#fff3e0', borderColor: 'var(--orange-accent)' }}>
              🔔 {activeAlerts[0].crop} {t('alert_active')} — {t('target_price')}: ₹{activeAlerts[0].targetPrice?.toLocaleString('en-IN')}/{t('quintal')}
              <span style={{ marginLeft: '8px', color: 'var(--green-primary)', fontWeight: 700 }}>✓ {t('alert_active')}</span>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid-4" style={{ marginBottom: '28px' }}>
            <StatCard icon="🌾" label={t('active_listings')} value={activeListings} iconBg="var(--green-light)" />
            <StatCard icon="📩" label={t('buyer_interests')} value={pendingRequests} iconBg="#e3f2fd" />
            <StatCard icon="✅" label={t('completed_sales')} value={completedOrders} iconBg="#f3e5f5" />
            <StatCard icon="💰" label={t('total_earnings')} value={formatIndianCurrency(totalEarnings)} iconBg="#fff8e1" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Price trend card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '16px' }}>📊 {user.mainCrop} {t('price_trend')}</h3>
                  {bestPrice && <p style={{ color: 'var(--green-primary)', fontWeight: 700, marginTop: '2px' }}>{t('best_price_nearby')}: ₹{bestPrice?.toLocaleString('en-IN')}/{t('quintal')}</p>}
                </div>
                <Link to="/farmer/market-prices">
                  <button className="btn btn-outline btn-sm">{t('view')}</button>
                </Link>
              </div>
              {data.priceData.length > 0
                ? <PriceLineChart data={data.priceData} dataKey="price" xKey="date" />
                : <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>No price data</div>
              }
            </div>

            {/* My crops */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 800, fontSize: '16px' }}>🧅 {t('my_crops')}</h3>
                <Link to="/farmer/crops"><button className="btn btn-outline btn-sm">{t('view')}</button></Link>
              </div>
              {data.crops.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <p style={{ color: 'var(--text-light)', marginBottom: '12px' }}>{t('no_crops_yet')}</p>
                  <Link to="/farmer/sell"><button className="btn btn-primary btn-sm">{t('add_listing')}</button></Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.crops.slice(0, 3).map(crop => (
                    <div key={crop.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-gray)', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>{crop.crop}</span>
                        <span style={{ marginLeft: '8px', color: 'var(--text-light)', fontSize: '13px' }}>{crop.quantity} {crop.unit}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--green-primary)' }}>₹{crop.expectedPrice?.toLocaleString('en-IN')}</span>
                        <span className={`badge ${crop.status === 'Active' ? 'badge-green' : crop.status === 'Sold' ? 'badge-blue' : 'badge-gray'}`}>{crop.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buyer requests preview */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '16px' }}>📩 {t('buyer_requests')}</h3>
              <Link to="/farmer/requests"><button className="btn btn-outline btn-sm">{t('view')}</button></Link>
            </div>
            {data.requests.length === 0 ? (
              <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '20px' }}>{t('no_requests')}</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-gray)' }}>
                      {['Buyer', 'Crop', 'Qty', 'Offered Price', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.requests.slice(0, 3).map(req => (
                      <tr key={req.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{req.buyerName}</td>
                        <td style={{ padding: '10px 12px' }}>{req.crop}</td>
                        <td style={{ padding: '10px 12px' }}>{req.quantity} {req.unit}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--green-primary)', fontWeight: 700 }}>₹{req.offeredPrice?.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={`badge ${req.status === 'Pending' ? 'badge-orange' : req.status === 'Accepted' ? 'badge-green' : req.status === 'Rejected' ? 'badge-red' : 'badge-blue'}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card">
            <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '16px' }}>⚡ Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {[
                { icon: '🌾', label: t('sell_crop'), path: '/farmer/sell', color: 'var(--green-primary)' },
                { icon: '📊', label: t('market_prices'), path: '/farmer/market-prices', color: 'var(--blue-info)' },
                { icon: '📦', label: t('orders'), path: '/farmer/orders', color: '#7b1fa2' },
                { icon: '🚛', label: t('transport'), path: '/farmer/transport', color: 'var(--orange-accent)' },
              ].map(action => (
                <Link key={action.path} to={action.path}>
                  <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-gray)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--green-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-gray)'}>
                    <span style={{ fontSize: '24px' }}>{action.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
