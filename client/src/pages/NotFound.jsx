import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gray)' }}>
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 68px)', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>🌾</div>
        <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'var(--green-primary)', marginBottom: '8px' }}>404</h1>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '32px', fontSize: '16px' }}>
          The page you're looking for doesn't exist.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/"><button className="btn btn-primary btn-lg">🏠 Go Home</button></Link>
          <Link to="/marketplace"><button className="btn btn-outline btn-lg">🌾 Marketplace</button></Link>
        </div>
      </div>
    </div>
  );
}
