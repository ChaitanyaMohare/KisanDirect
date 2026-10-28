import React, { useState } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal]     = useState('');
  const { user, logout }              = useAuth();
  const { language }                  = useLanguage();
  const navigate                      = useNavigate();
  const hi                            = language === 'hi';

  const handleSearchKey = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/farmer/market-prices`);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main">
        {/* ── Top bar ── */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #f0f0f0',
          height: '64px', display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: '16px', position: 'sticky', top: 0, zIndex: 50,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          {/* Hamburger (mobile) */}
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            style={{ display: 'none', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: 'pointer', color: '#6b7280', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          {/* Search bar */}
          <div style={{ flex: 1, maxWidth: '380px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder={hi ? 'फसल, मंडी या जिला खोजें...' : 'Search crops, markets or districts...'}
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={handleSearchKey}
              style={{
                width: '100%', padding: '9px 14px 9px 38px',
                border: '1.5px solid #e5e7eb', borderRadius: '10px',
                fontSize: '14px', outline: 'none', background: '#f9fafb',
                fontFamily: 'inherit', color: '#111827',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#16a34a'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Notification bell */}
          <button style={{ position: 'relative', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '10px', background: '#fff', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BellIcon />
            <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
          </button>

          {/* User profile */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '10px', background: '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#16a34a,#15803d)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '14px',
                }}>
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{user.name}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{[user.district, user.state].filter(Boolean).join(', ') || 'Maharashtra'}</div>
                </div>
                <span style={{ color: '#9ca3af', marginLeft: '2px' }}><ChevronDown /></span>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div style={{ position: 'absolute', top: '48px', right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '180px', zIndex: 200, overflow: 'hidden' }}>
                  {[
                    { label: hi ? 'डैशबोर्ड' : 'Dashboard', path: '/farmer/dashboard' },
                    { label: hi ? 'प्रोफ़ाइल' : 'Profile', path: '/farmer/profile' },
                  ].map(item => (
                    <button key={item.path} onClick={() => { navigate(item.path); setProfileOpen(false); }}
                      style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#374151', borderBottom: '1px solid #f3f4f6' }}>
                      {item.label}
                    </button>
                  ))}
                  <button onClick={() => { logout(); navigate('/'); }}
                    style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>
                    {hi ? 'लॉगआउट' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Content */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>

      <BottomNav />

      <style>{`
        @media (max-width: 768px) {
          #sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
