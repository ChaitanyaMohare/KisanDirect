import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// SVG icons matching the reference screenshot style
const Icons = {
  Dashboard:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  MarketPrices: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  SellCrop:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  MyCrops:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12m0 0C12 7 7 4 4 4c0 4 2.5 8 8 8zm0 0c0-5 5-8 8-8-1 4-3 8-8 8"/></svg>,
  Requests:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Orders:       () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  Earnings:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Transport:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Profile:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Logout:       () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Globe:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
};

const navItems = [
  { key: 'dashboard',      Icon: Icons.Dashboard,    path: '/farmer/dashboard',     label: { en: 'Dashboard',      hi: 'डैशबोर्ड' } },
  { key: 'market_prices',  Icon: Icons.MarketPrices, path: '/farmer/market-prices', label: { en: 'Market Prices',  hi: 'बाजार भाव' } },
  { key: 'sell_crop',      Icon: Icons.SellCrop,     path: '/farmer/sell',          label: { en: 'Sell Crop',      hi: 'फसल बेचें' } },
  { key: 'my_crops',       Icon: Icons.MyCrops,      path: '/farmer/crops',         label: { en: 'My Crops',       hi: 'मेरी फसलें' } },
  { key: 'buyer_requests', Icon: Icons.Requests,     path: '/farmer/requests',      label: { en: 'Buyer Requests', hi: 'खरीदार अनुरोध' } },
  { key: 'orders',         Icon: Icons.Orders,       path: '/farmer/orders',        label: { en: 'Orders',         hi: 'ऑर्डर' } },
  { key: 'earnings',       Icon: Icons.Earnings,     path: '/farmer/earnings',      label: { en: 'Earnings',       hi: 'कमाई' } },
  { key: 'transport',      Icon: Icons.Transport,    path: '/farmer/transport',     label: { en: 'Transport',      hi: 'परिवहन' } },
  { key: 'profile',        Icon: Icons.Profile,      path: '/farmer/profile',       label: { en: 'Profile',        hi: 'प्रोफ़ाइल' } },
];

export default function Sidebar({ isOpen, onClose }) {
  const { language, switchLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const hi = language === 'hi';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99, display: 'none' }}
          className="sidebar-overlay-mobile"
        />
      )}

      <aside
        className={`dashboard-sidebar${isOpen ? ' open' : ''}`}
        style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}
      >
        {/* ── Brand ── */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
              🌿
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '16px', color: '#15803d', letterSpacing: '-0.3px' }}>
                Kisan<span style={{ color: '#111827' }}>Direct</span>
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 500 }}>Sell Direct. Earn More.</div>
            </div>
          </div>
        </div>

        {/* ── Farmer info ── */}
        {user && (
          <div style={{ padding: '14px 16px', margin: '12px 12px 4px', background: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,#16a34a,#15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '15px', flexShrink: 0,
            }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {[user.district, user.state].filter(Boolean).join(', ') || 'Maharashtra'}
              </div>
            </div>
          </div>
        )}

        {/* ── Nav links ── */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink
              key={item.key}
              to={item.path}
              onClick={onClose}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 16px', margin: '1px 8px',
                  borderRadius: '8px', cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: isActive ? '#f0fdf4' : 'transparent',
                  color: isActive ? '#15803d' : '#374151',
                  borderLeft: isActive ? '3px solid #16a34a' : '3px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                }}>
                  <span style={{ color: isActive ? '#16a34a' : '#9ca3af', flexShrink: 0, display: 'flex' }}>
                    <item.Icon />
                  </span>
                  <span style={{ fontSize: '14px' }}>{hi ? item.label.hi : item.label.en}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom section ── */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
          {/* Language switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: '#9ca3af' }}><Icons.Globe /></span>
            <div style={{ display: 'flex', flex: 1, background: '#f3f4f6', borderRadius: '20px', padding: '2px', gap: '2px' }}>
              <button
                onClick={() => switchLanguage('en')}
                style={{ flex: 1, padding: '5px 8px', borderRadius: '18px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: language === 'en' ? '#16a34a' : 'transparent', color: language === 'en' ? '#fff' : '#6b7280', transition: 'all 0.15s' }}
              >
                English
              </button>
              <button
                onClick={() => switchLanguage('hi')}
                style={{ flex: 1, padding: '5px 8px', borderRadius: '18px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: language === 'hi' ? '#16a34a' : 'transparent', color: language === 'hi' ? '#fff' : '#6b7280', transition: 'all 0.15s' }}
              >
                हिंदी
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', border: '1px solid #fee2e2', borderRadius: '8px', cursor: 'pointer', background: '#fff5f5', color: '#dc2626', fontWeight: 600, fontSize: '13px', transition: 'all 0.15s' }}
          >
            <Icons.Logout />
            {hi ? 'लॉगआउट' : 'Logout'}
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-overlay-mobile { display: block !important; }
        }
      `}</style>
    </>
  );
}
