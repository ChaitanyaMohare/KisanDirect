import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const items = [
  { key: 'dashboard', icon: '🏠', path: '/farmer/dashboard' },
  { key: 'market_prices', icon: '📊', path: '/farmer/market-prices' },
  { key: 'sell_crop', icon: '🌾', path: '/farmer/sell' },
  { key: 'buyer_requests', icon: '📩', path: '/farmer/requests' },
  { key: 'earnings', icon: '💰', path: '/farmer/earnings' },
];

export default function BottomNav() {
  const { t } = useLanguage();
  return (
    <nav className="bottom-nav" style={{ display: 'none' }}>
      {items.map(item => (
        <NavLink
          key={item.key}
          to={item.path}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <span>{item.icon}</span>
          <span>{t(item.key)}</span>
        </NavLink>
      ))}
      <style>{`@media (max-width: 768px) { .bottom-nav { display: flex !important; } }`}</style>
    </nav>
  );
}
