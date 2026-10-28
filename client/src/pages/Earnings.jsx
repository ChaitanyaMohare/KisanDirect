import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { EarningsBarChart } from '../components/PriceChart';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getEarnings } from '../services/api';
import { formatIndianCurrency, calculateNetEarning } from '../utils/calculations';

export default function Earnings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculator state
  const [calc, setCalc] = useState({ crop: 'Onion', quantity: '', price: '', transport: '', other: '' });
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getEarnings(user.id);
        setData(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user.id]);

  const handleCalculate = () => {
    if (!calc.quantity || !calc.price) return;
    const result = calculateNetEarning(
      Number(calc.quantity), Number(calc.price),
      Number(calc.transport) || 0, Number(calc.other) || 0
    );
    setCalcResult(result);
  };

  return (
    <DashboardLayout title={t('earnings_title')}>
      <div className="page-header">
        <h1 className="page-title">💰 {t('earnings_title')}</h1>
        <p className="page-subtitle">Track all your sales and earnings</p>
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid-4" style={{ marginBottom: '24px' }}>
            <StatCard icon="💰" label={t('total_earnings')} value={formatIndianCurrency(data?.totalEarnings || 0)} iconBg="#fff8e1" />
            <StatCard icon="📅" label={t('this_month')} value={formatIndianCurrency(data?.thisMonth || 0)} iconBg="var(--green-light)" />
            <StatCard icon="⏳" label={t('pending_payments')} value={formatIndianCurrency(data?.pendingPayments || 0)} iconBg="var(--orange-light)" />
            <StatCard icon="✅" label={t('completed_payments')} value={formatIndianCurrency(data?.completedPayments || 0)} iconBg="var(--blue-light)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Monthly chart */}
            <div className="card">
              <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '16px' }}>📊 {t('monthly_earnings')}</h3>
              {data?.monthlyData ? (
                <EarningsBarChart data={data.monthlyData} />
              ) : <p style={{ color: 'var(--text-light)' }}>No data available</p>}
            </div>

            {/* Earnings Calculator */}
            <div className="card" style={{ border: '2px solid var(--green-primary)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>🧮 {t('calculator_title')}</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '13px', marginBottom: '16px' }}>Calculate your net earning from any sale</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t('quantity')} (Quintal)</label>
                    <input className="form-input" type="number" placeholder="50" value={calc.quantity} onChange={e => setCalc(p => ({ ...p, quantity: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Price (₹/Quintal)</label>
                    <input className="form-input" type="number" placeholder="3200" value={calc.price} onChange={e => setCalc(p => ({ ...p, price: e.target.value }))} />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t('transport_cost')} (₹)</label>
                    <input className="form-input" type="number" placeholder="8000" value={calc.transport} onChange={e => setCalc(p => ({ ...p, transport: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t('other_costs')} (₹)</label>
                    <input className="form-input" type="number" placeholder="2000" value={calc.other} onChange={e => setCalc(p => ({ ...p, other: e.target.value }))} />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleCalculate}>{t('calculate')}</button>
                {calcResult && (
                  <div style={{ background: 'var(--bg-gray)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                    {[
                      { label: `${calc.quantity} × ₹${calc.price}`, val: formatIndianCurrency(calcResult.grossRevenue), color: 'var(--text-primary)' },
                      { label: `− ${t('transport_cost')}`, val: `− ${formatIndianCurrency(calcResult.transportCost)}`, color: 'var(--red-alert)' },
                      { label: `− ${t('other_costs')}`, val: `− ${formatIndianCurrency(calcResult.otherCosts)}`, color: 'var(--red-alert)' },
                    ].map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                        <span style={{ fontWeight: 600, color: r.color }}>{r.val}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', padding: '8px 0 0' }}>
                      <span style={{ fontWeight: 700 }}>= {t('net_earning')}</span>
                      <span style={{ fontWeight: 900, fontSize: '20px', color: 'var(--green-primary)' }}>{formatIndianCurrency(calcResult.netEarning)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transactions table */}
          <div className="card">
            <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '16px' }}>🧾 {t('transactions')}</h3>
            {!data?.transactions?.length ? (
              <p style={{ color: 'var(--text-light)', padding: '20px', textAlign: 'center' }}>No transactions yet</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-gray)' }}>
                      {['Order', 'Buyer', 'Crop', 'Qty', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map(tx => (
                      <tr key={tx.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--blue-info)' }}>#{tx.orderId}</td>
                        <td style={{ padding: '12px 14px' }}>{tx.buyerName}</td>
                        <td style={{ padding: '12px 14px' }}>{tx.crop}</td>
                        <td style={{ padding: '12px 14px' }}>{tx.quantity} {tx.unit}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--green-primary)' }}>{formatIndianCurrency(tx.amount)}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className={`badge ${tx.status === 'Paid' ? 'badge-green' : 'badge-orange'}`}>
                            {tx.status === 'Paid' ? `✓ ${t('paid')}` : `⏳ ${t('pending')}`}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-light)', fontSize: '13px' }}>
                          {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
