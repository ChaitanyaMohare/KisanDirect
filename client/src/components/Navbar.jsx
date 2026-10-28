import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, language, switchLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="leaf">🌿</span>
          <span>KisanDirect</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link to="/market-prices" className={`nav-link${isActive('/market-prices') ? ' active' : ''}`}>
            {t('nav_market_prices')} {!user && <span style={{ fontSize: '11px', opacity: 0.6 }}>🔒</span>}
          </Link>
          <Link to="/marketplace" className={`nav-link${isActive('/marketplace') ? ' active' : ''}`}>
            {t('nav_marketplace')} {!user && <span style={{ fontSize: '11px', opacity: 0.6 }}>🔒</span>}
          </Link>
          <a href="#how-it-works" className="nav-link">{t('nav_how_it_works')}</a>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language switcher */}
          <div className="lang-switcher">
            <button className={`lang-btn${language === 'en' ? ' active' : ''}`} onClick={() => switchLanguage('en')}>EN</button>
            <button className={`lang-btn${language === 'hi' ? ' active' : ''}`} onClick={() => switchLanguage('hi')}>हिंदी</button>
          </div>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span>👤</span>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                <span>▾</span>
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '48px', right: 0,
                  background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                  minWidth: '180px', zIndex: 300, overflow: 'hidden'
                }}>
                  {user.role === 'farmer' && (
                    <>
                      <Link to="/farmer/dashboard" className="nav-link" style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--border)' }} onClick={() => setMenuOpen(false)}>{t('dashboard')}</Link>
                      <Link to="/farmer/profile" className="nav-link" style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--border)' }} onClick={() => setMenuOpen(false)}>{t('profile')}</Link>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="nav-link" style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--border)' }} onClick={() => setMenuOpen(false)}>{t('admin_title')}</Link>
                  )}
                  <button onClick={handleLogout} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--red-alert)', fontWeight: 600, fontSize: '14px' }}>
                    🚪 {t('nav_logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline btn-sm">{t('nav_login')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">{t('nav_register')}</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="btn btn-outline btn-icon" style={{ display: 'none' }} aria-label="Menu">☰</button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
