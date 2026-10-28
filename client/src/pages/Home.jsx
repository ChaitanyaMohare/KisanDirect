import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const stats = [
  { value: '10,000+', key: 'stats_farmers', icon: '👨‍🌾' },
  { value: '₹2.4 Cr+', key: 'stats_crop_value', icon: '🌾' },
  { value: '4,500+', key: 'stats_connections', icon: '🤝' },
  { value: '18%', key: 'stats_improvement', icon: '📈' },
];

const features = [
  { icon: '🤝', key: 'why_direct', titleKey: 'why_direct_title', descKey: 'why_direct_desc' },
  { icon: '📊', key: 'why_price', titleKey: 'why_price_title', descKey: 'why_price_desc' },
  { icon: '🔍', key: 'why_transparent', titleKey: 'why_transparent_title', descKey: 'why_transparent_desc' },
  { icon: '🌐', key: 'why_buyers', titleKey: 'why_buyers_title', descKey: 'why_buyers_desc' },
  { icon: '✊', key: 'why_control', titleKey: 'why_control_title', descKey: 'why_control_desc' },
];

const howItWorks = [
  { step: 1, icon: '📋', en: 'Register as a Farmer', hi: 'किसान के रूप में रजिस्टर करें' },
  { step: 2, icon: '📊', en: 'Discover Market Prices', hi: 'बाजार भाव खोजें' },
  { step: 3, icon: '🧮', en: 'Calculate Net Earnings', hi: 'शुद्ध कमाई की गणना करें' },
  { step: 4, icon: '🌾', en: 'List Your Crop', hi: 'अपनी फसल सूचीबद्ध करें' },
  { step: 5, icon: '🤝', en: 'Receive Buyer Offers', hi: 'खरीदार के प्रस्ताव पाएँ' },
  { step: 6, icon: '💰', en: 'Complete Sale & Earn More', hi: 'बिक्री पूरी करें और ज्यादा कमाएँ' },
];

export default function Home() {
  const { t, language } = useLanguage();
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await demoLogin('farmer');
      navigate('/farmer/dashboard');
    } catch (e) { /* ignore */ }
  };

  // Live-ish price cards shown floating in the hero
  const heroPrices = [
    { crop: language === 'hi' ? 'प्याज' : 'Onion',   icon: '🧅', price: '₹4,250', unit: language === 'hi' ? '/क्विंटल' : '/quintal', trend: '+12%', up: true  },
    { crop: language === 'hi' ? 'गेहूँ'  : 'Wheat',   icon: '🌾', price: '₹2,180', unit: language === 'hi' ? '/क्विंटल' : '/quintal', trend: '+8%',  up: true  },
    { crop: language === 'hi' ? 'सोयाबीन': 'Soybean', icon: '🫘', price: '₹3,650', unit: language === 'hi' ? '/क्विंटल' : '/quintal', trend: '+5%',  up: true  },
  ];

  const trustBadges = [
    { icon: '📊', en: 'Live Market Prices',       hi: 'लाइव बाजार भाव'    },
    { icon: '🤝', en: 'Direct Buyers & Sellers',  hi: 'सीधे खरीदार-विक्रेता' },
    { icon: '🚛', en: 'Cargo & Export Support',   hi: 'माल-ढुलाई सहायता'  },
    { icon: '🔒', en: 'Safe & Secure Transactions',hi: 'सुरक्षित लेनदेन'   },
  ];

  const bottomStats = [
    { icon: '👥', value: '50,000+', en: 'Farmers Connected',      hi: 'किसान जुड़े' },
    { icon: '🏪', value: '500+',    en: 'Markets Covered',         hi: 'बाजार कवर' },
    { icon: '🌾', value: '25+',     en: 'Crops & Commodities',     hi: 'फसलें व जिंस' },
    { icon: '🌍', value: '',        en: 'Global Reach',            hi: 'वैश्विक पहुँच', sub: language === 'hi' ? 'निर्यात सहायता' : 'Cargo & Export Support' },
  ];

  return (
    <div style={{ background: 'var(--bg-white)' }}>
      <Navbar />

      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section style={{
        background: '#fff',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '520px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Subtle green blob top-right */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: 420, height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #c8e6c9 0%, #e8f5e9 60%, transparent 100%)',
          zIndex: 0,
        }} />
        {/* Small blob bottom-left */}
        <div style={{
          position: 'absolute', bottom: '60px', left: '-60px',
          width: 220, height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #dcedc8 0%, transparent 70%)',
          zIndex: 0,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '52px', paddingBottom: '0' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '0', alignItems: 'flex-end', minHeight: '400px' }}>

            {/* ── LEFT: headline + badges + CTAs ── */}
            <div style={{ paddingBottom: '40px' }}>
              {/* "Connecting Farmers" pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '5px 14px', marginBottom: '22px' }}>
                <span style={{ color: 'var(--green-primary)', fontSize: '14px' }}>🌿</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green-primary)' }}>
                  {language === 'hi' ? 'किसानों को बेहतर बाजार से जोड़ना' : 'Connecting Farmers to Better Markets'}
                </span>
              </div>

              {/* Main headline */}
              <h1 style={{
                fontSize: '48px', fontWeight: 900, lineHeight: 1.1,
                color: '#111827', margin: '0 0 8px',
              }}>
                {language === 'hi' ? (
                  <>हर किसान के लिए<br /><span style={{ color: 'var(--green-primary)' }}>ज्यादा मूल्य पाएँ</span> 🌱</>
                ) : (
                  <>Grow More Value<br /><span style={{ color: 'var(--green-primary)' }}>for Every Farmer</span> 🌱</>
                )}
              </h1>

              {/* Sub-headline */}
              <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.65, margin: '0 0 28px', maxWidth: '360px' }}>
                {language === 'hi'
                  ? 'लाइव मंडी भाव, सीधे खरीदार, सुरक्षित लेनदेन और निर्यात — एक ही प्लेटफॉर्म पर।'
                  : 'Live mandi prices, direct buyers, secure transactions and export opportunities — all in one platform.'}
              </p>

              {/* Trust badges row */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '32px' }}>
                {trustBadges.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px' }}>{b.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', lineHeight: 1.3, maxWidth: '72px' }}>
                      {language === 'hi' ? b.hi : b.en}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/market-prices">
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'var(--green-primary)', color: '#fff',
                    border: 'none', borderRadius: '10px',
                    padding: '14px 24px', fontSize: '15px', fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(45,122,58,0.35)',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <span>📊</span>
                    {language === 'hi' ? 'बाजार भाव देखें →' : 'Explore Market Prices →'}
                  </button>
                </Link>

                {user?.role === 'farmer' ? (
                  <Link to="/farmer/sell">
                    <button style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      background: '#fff', color: 'var(--green-primary)',
                      border: '2px solid var(--green-primary)', borderRadius: '10px',
                      padding: '13px 24px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                      <span>🛒</span>
                      {language === 'hi' ? 'फसल बेचें' : 'Sell Your Crop'}
                    </button>
                  </Link>
                ) : (
                  <button onClick={handleDemoLogin} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: '#fff', color: 'var(--green-primary)',
                    border: '2px solid var(--green-primary)', borderRadius: '10px',
                    padding: '13px 24px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}>
                    <span>🛒</span>
                    {language === 'hi' ? 'फसल बेचें' : 'Sell Your Crop'}
                  </button>
                )}
              </div>
            </div>

            {/* ── RIGHT: farmer illustration area + floating price cards ── */}
            <div className="hero-right" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', minHeight: '400px' }}>

              {/* Green field / farmer illustration background */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 40%, #a5d6a7 100%)',
                borderRadius: '24px 24px 0 0',
                overflow: 'hidden',
              }}>
                {/* Decorative field lines */}
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute', bottom: 0,
                    left: `${i * 17}%`, width: '12%', height: `${55 + i * 5}%`,
                    background: `rgba(76,175,80,${0.08 + i * 0.04})`,
                    borderRadius: '50% 50% 0 0',
                    transform: `skewX(${i % 2 === 0 ? -3 : 3}deg)`,
                  }} />
                ))}
                {/* Birds */}
                <span style={{ position: 'absolute', top: '18%', left: '20%', fontSize: '20px', opacity: 0.7 }}>🕊️</span>
                <span style={{ position: 'absolute', top: '12%', right: '25%', fontSize: '16px', opacity: 0.6 }}>🕊️</span>
              </div>

              {/* Farmer emoji / avatar centred */}
              <div style={{
                position: 'relative', zIndex: 2,
                fontSize: '140px', lineHeight: 1,
                marginBottom: '0',
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))',
                userSelect: 'none',
              }}>
                👨‍🌾
              </div>

              {/* Floating price card — Onion (top-left) */}
              <div style={{
                position: 'absolute', top: '12%', left: '4%', zIndex: 3,
                background: '#fff', borderRadius: '14px',
                boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
                padding: '12px 16px', minWidth: '148px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ fontSize: '28px' }}>🧅</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>
                    {language === 'hi' ? 'प्याज' : 'Onion'}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '17px', color: 'var(--green-primary)' }}>₹4,250<span style={{ fontSize: '11px', fontWeight: 500, color: '#9ca3af' }}>{language === 'hi' ? '/क्विंटल' : '/quintal'}</span></div>
                  <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>▲ 12% {language === 'hi' ? 'इस हफ्ते' : 'this week'}</div>
                </div>
              </div>

              {/* Floating price card — Wheat (top-right) */}
              <div style={{
                position: 'absolute', top: '8%', right: '4%', zIndex: 3,
                background: '#fff', borderRadius: '14px',
                boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
                padding: '12px 16px', minWidth: '148px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ fontSize: '28px' }}>🌾</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>
                    {language === 'hi' ? 'गेहूँ' : 'Wheat'}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '17px', color: 'var(--green-primary)' }}>₹2,180<span style={{ fontSize: '11px', fontWeight: 500, color: '#9ca3af' }}>{language === 'hi' ? '/क्विंटल' : '/quintal'}</span></div>
                  <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>▲ 8% {language === 'hi' ? 'इस हफ्ते' : 'this week'}</div>
                </div>
              </div>

              {/* Floating price card — Soybean (bottom-right) */}
              <div style={{
                position: 'absolute', bottom: '18%', right: '3%', zIndex: 3,
                background: '#fff', borderRadius: '14px',
                boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
                padding: '12px 16px', minWidth: '148px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ fontSize: '28px' }}>🫘</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>
                    {language === 'hi' ? 'सोयाबीन' : 'Soybean'}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '17px', color: 'var(--green-primary)' }}>₹3,650<span style={{ fontSize: '11px', fontWeight: 500, color: '#9ca3af' }}>{language === 'hi' ? '/क्विंटल' : '/quintal'}</span></div>
                  <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>▲ 5% {language === 'hi' ? 'इस हफ्ते' : 'this week'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom stats bar ── */}
        <div style={{
          background: '#fff',
          borderTop: '1px solid #e5e7eb',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
          position: 'relative', zIndex: 2,
        }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }} className="hero-stats-grid">
              {bottomStats.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '18px 24px',
                  borderRight: i < 3 ? '1px solid #e5e7eb' : 'none',
                }}>
                  <span style={{ fontSize: '28px', flexShrink: 0 }}>{s.icon}</span>
                  <div>
                    {s.value && <div style={{ fontSize: '22px', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{s.value}</div>}
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: s.value ? '2px' : 0 }}>
                      {language === 'hi' ? s.hi : s.en}
                    </div>
                    {s.sub && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>{s.sub}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why KisanDirect */}
      <section className="section" id="why">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)' }}>{t('why_title')}</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-light)', marginTop: '12px', maxWidth: '500px', margin: '12px auto 0' }}>
              {language === 'hi' ? 'किसानों के लिए, किसानों द्वारा बनाया गया' : 'Built for farmers. Designed to maximize your earnings.'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {features.map((f, i) => (
              <div key={i} className="card card-hover" style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px' }}>{t(f.titleKey)}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: 1.6 }}>{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how-it-works" style={{ background: 'var(--bg-gray)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 900 }}>{t('nav_how_it_works')}</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-light)', marginTop: '12px' }}>
              {language === 'hi' ? '6 आसान कदमों में ज्यादा कमाएँ' : 'Earn more in 6 simple steps'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            {howItWorks.map((step, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', margin: '0 auto 16px' }}>
                    {step.step}
                  </div>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>{step.icon}</div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {language === 'hi' ? step.hi : step.en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, var(--green-dark), var(--green-primary))', borderRadius: 'var(--radius-xl)', padding: '60px 40px', textAlign: 'center', color: '#fff' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '16px' }}>
              {language === 'hi' ? 'आज ही शुरू करें' : 'Start Earning More Today'}
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
              {language === 'hi' ? 'रजिस्टर करें और अपनी पहली फसल सूचीबद्ध करें' : 'Register and list your first crop in under 5 minutes'}
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--green-primary)' }}>
                👨‍🌾 {t('register_farmer')}
              </Link>
              <button className="btn btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff', background: 'transparent', border: '2px solid rgba(255,255,255,0.5)' }} onClick={handleDemoLogin}>
                🎯 {t('demo_login')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--green-dark)', color: 'rgba(255,255,255,0.8)', padding: '32px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>🌿 KisanDirect</div>
          <div style={{ fontSize: '14px', marginBottom: '16px' }}>
            {language === 'hi' ? 'सीधे बेचें, ज्यादा कमाएँ' : 'Sell Direct. Earn More.'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>
            © 2026 KisanDirect. {language === 'hi' ? 'सर्वाधिकार सुरक्षित' : 'All rights reserved.'}
          </div>
        </div>
      </footer>

      <style>{`
        /* Hero responsive */
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-right { display: none !important; }
          .hero-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .hero-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-headline { font-size: 34px !important; }
          .hero-trust { gap: 12px !important; }
        }
      `}</style>
    </div>
  );
}
