import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import OrderTimeline from '../components/OrderTimeline';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getOrders } from '../services/api';
import { formatIndianCurrency } from '../utils/calculations';

const STATUS_BADGE = {
  Requested: 'badge-gray', Negotiating: 'badge-blue', Accepted: 'badge-green',
  'Ready for Pickup': 'badge-orange', 'In Transit': 'badge-gold', Completed: 'badge-green'
};

export default function Orders() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOrders({ farmerId: user.id });
        setOrders(res.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user.id]);

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);
  const statuses = ['All', 'Negotiating', 'Accepted', 'In Transit', 'Completed'];

  return (
    <DashboardLayout title={t('orders_title')}>
      <div className="page-header">
        <h1 className="page-title">📦 {t('orders_title')}</h1>
        <p className="page-subtitle">{orders.length} total orders</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Accept buyer requests to create orders</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(order => (
            <div key={order.id} className="card">
              {/* Order header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '16px' }}>Order #{order.id}</span>
                    <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`}>{order.status}</span>
                    {order.paymentStatus === 'Paid' && <span className="badge badge-green">💰 Paid</span>}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    🏭 {order.buyerName} · 🌾 {order.crop} · {order.quantity} {order.unit}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '2px' }}>
                    📍 {order.pickupLocation} → {order.deliveryLocation}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>Total Value</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--green-primary)' }}>
                    {formatIndianCurrency(order.totalValue)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                    ₹{order.agreedPrice?.toLocaleString('en-IN')}/{t('quintal')}
                  </div>
                </div>
              </div>

              {/* Timeline toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                  Created: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setSelected(selected?.id === order.id ? null : order)}>
                  {selected?.id === order.id ? '▲ Hide Timeline' : '▼ View Timeline'}
                </button>
              </div>

              {/* Order timeline */}
              {selected?.id === order.id && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>Order Progress</h4>
                  <OrderTimeline timeline={order.timeline || []} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
