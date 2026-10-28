import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { useLanguage } from '../context/LanguageContext';
import { getAdminStats, getAdminFarmers, getAdminBuyers, getAdminListings, verifyFarmer, verifyBuyer } from '../services/api';
import { formatIndianCurrency } from '../utils/calculations';

const TABS = ['Overview', 'Farmers', 'Buyers', 'Listings', 'Transactions'];

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, farmersRes, buyersRes, listingsRes] = await Promise.all([
          getAdminStats(), getAdminFarmers(), getAdminBuyers(), getAdminListings()
        ]);
        setStats(statsRes.data.data);
        setFarmers(farmersRes.data.data || []);
        setBuyers(buyersRes.data.data || []);
        setListings(listingsRes.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleVerifyFarmer = async (id) => {
    try {
      await verifyFarmer(id);
      setFarmers(prev => prev.map(f => f.id === id ? { ...f, farmerVerified: true, isVerified: true } : f));
      setSuccessMsg('Farmer verified successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) { console.error(e); }
  };

  const handleVerifyBuyer = async (id) => {
    try {
      await verifyBuyer(id);
      setBuyers(prev => prev.map(b => b.id === id ? { ...b, businessVerified: true, isVerified: true } : b));
      setSuccessMsg('Buyer verified successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gray)' }}>
      <Navbar />
      <div className="container" style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900 }}>⚙️ {t('admin_title')}</h1>
            <p style={{ color: 'var(--text-light)', marginTop: '4px' }}>KisanDirect Platform Management</p>
          </div>
          <span className="demo-badge">DEMO MODE</span>
        </div>

        {successMsg && <div className="alert alert-success" style={{ marginBottom: '16px' }}>✓ {successMsg}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-white)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', width: 'fit-content', flexWrap: 'wrap' }}>
          {TABS.map(tabName => (
            <button key={tabName} onClick={() => setTab(tabName)}
              className={`btn btn-sm ${tab === tabName ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}>
              {tabName}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-container"><div className="spinner" /></div>
        ) : (
          <>
            {tab === 'Overview' && stats && (
              <>
                <div className="grid-4" style={{ marginBottom: '24px' }}>
                  <StatCard icon="👨‍🌾" label={t('total_farmers')} value={stats.totalFarmers} iconBg="var(--green-light)" />
                  <StatCard icon="🏭" label={t('total_buyers')} value={stats.totalBuyers} iconBg="var(--blue-light)" />
                  <StatCard icon="🌾" label={t('total_listings')} value={stats.activeListings} iconBg="var(--orange-light)" />
                  <StatCard icon="✅" label={t('total_transactions')} value={stats.completedTransactions} iconBg="#f3e5f5" />
                </div>
                <div className="grid-2">
                  <div className="card">
                    <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>📊 Platform Summary</h3>
                    {[
                      { label: 'Total Crop Volume', value: stats.totalCropVolume },
                      { label: 'Total Transaction Value', value: formatIndianCurrency(stats.totalTransactionValue) },
                      { label: 'Reported Listings', value: stats.reportedListings },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span style={{ fontWeight: 700 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="card">
                    <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>🌾 Recent Listings</h3>
                    {listings.slice(0, 4).map(l => (
                      <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                        <span>{l.crop} · {l.farmerName}</span>
                        <span className={`badge ${l.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{l.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === 'Farmers' && (
              <div className="card">
                <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>👨‍🌾 Registered Farmers</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-gray)' }}>
                        {['Name', 'Mobile', 'Location', 'Main Crop', 'Verified', 'Earnings', 'Action'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {farmers.map(f => (
                        <tr key={f.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>{f.name}</td>
                          <td style={{ padding: '12px 14px' }}>{f.mobile}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-light)' }}>{f.district}, {f.state}</td>
                          <td style={{ padding: '12px 14px' }}>{f.mainCrop}</td>
                          <td style={{ padding: '12px 14px' }}>
                            {f.farmerVerified ? <span className="badge badge-green">✓ Verified</span> : <span className="badge badge-orange">Pending</span>}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--green-primary)' }}>
                            {formatIndianCurrency(f.totalEarnings)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {!f.farmerVerified && (
                              <button className="btn btn-primary btn-sm" onClick={() => handleVerifyFarmer(f.id)}>✓ {t('verify')}</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'Buyers' && (
              <div className="card">
                <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>🏭 Registered Buyers</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-gray)' }}>
                        {['Name', 'Company', 'Mobile', 'Type', 'Location', 'GST', 'Action'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {buyers.map(b => (
                        <tr key={b.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>{b.name}</td>
                          <td style={{ padding: '12px 14px' }}>{b.companyName}</td>
                          <td style={{ padding: '12px 14px' }}>{b.mobile}</td>
                          <td style={{ padding: '12px 14px' }}><span className="badge badge-blue">{b.businessType}</span></td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-light)' }}>{b.location}</td>
                          <td style={{ padding: '12px 14px' }}>
                            {b.gstVerified ? <span className="badge badge-green">✓ GST</span> : <span className="badge badge-gray">No GST</span>}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {!b.businessVerified && (
                              <button className="btn btn-primary btn-sm" onClick={() => handleVerifyBuyer(b.id)}>✓ {t('verify')}</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'Listings' && (
              <div className="card">
                <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>🌾 All Crop Listings</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-gray)' }}>
                        {['Farmer', 'Crop', 'Quantity', 'Price', 'Location', 'Status', 'Action'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(l => (
                        <tr key={l.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>{l.farmerName}</td>
                          <td style={{ padding: '12px 14px' }}>{l.crop} · {l.variety}</td>
                          <td style={{ padding: '12px 14px' }}>{l.quantity} {l.unit}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--green-primary)' }}>₹{l.expectedPrice?.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-light)' }}>{l.district}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className={`badge ${l.status === 'Active' ? 'badge-green' : l.status === 'Sold' ? 'badge-blue' : 'badge-orange'}`}>{l.status}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <button className="btn btn-outline btn-sm" style={{ color: 'var(--red-alert)', borderColor: 'var(--red-alert)' }}>{t('remove')}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'Transactions' && (
              <div className="empty-state">
                <div className="empty-state-icon">🧾</div>
                <h3>Transaction History</h3>
                <p>Detailed transaction log will appear here</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
