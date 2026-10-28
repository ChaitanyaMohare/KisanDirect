/**
 * LiveMandiPrices — Redesigned to match reference screenshot
 * Hero section + filter card + summary cards + professional table
 * All data comes from the real APMC Mandi Price API via backend proxy.
 * Never fabricates prices. Shows clear data-freshness warnings.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getMandiPrices } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

// ── Constants ─────────────────────────────────────────────────────────────
const COMMODITIES = [
  'Onion', 'Wheat', 'Tomato', 'Potato', 'Soybean',
  'Cotton', 'Maize', 'Rice', 'Bajra', 'Jowar', 'Tur', 'Gram',
];
const STATES = [
  'Maharashtra', 'Punjab', 'Uttar Pradesh',
  'Karnataka', 'Rajasthan', 'Madhya Pradesh',
];
const CROP_ICONS = {
  Onion: '🧅', Wheat: '🌾', Tomato: '🍅', Potato: '🥔', Soybean: '🫘',
  Cotton: '🌿', Maize: '🌽', Rice: '🍚', Bajra: '🌾', Jowar: '🌾',
  Tur: '🫘', Gram: '🫘', Sugarcane: '🎋',
};
const POPULAR_CROPS = [
  { name: 'Onion', icon: '🧅' }, { name: 'Tomato', icon: '🍅' },
  { name: 'Potato', icon: '🥔' }, { name: 'Wheat', icon: '🌾' },
  { name: 'Rice', icon: '🍚' }, { name: 'Soybean', icon: '🫘' },
  { name: 'Sugarcane', icon: '🎋' }, { name: 'Cotton', icon: '🌿' },
  { name: 'Maize', icon: '🌽' },
];

// Data is considered stale if arrival_date is older than this many days
const STALE_DAYS = 3;
const AUTO_REFRESH_MS = 60 * 60 * 1000;

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt = (n) => (n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN'));
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
};
const fmtTime = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return d; }
};
const isStale = (dateStr) => {
  if (!dateStr) return false;
  const diff = (Date.now() - new Date(dateStr).getTime()) / 86400000;
  return diff > STALE_DAYS;
};

// ── Summary card component ────────────────────────────────────────────────
function SummaryCard({ icon, label, value, sub1, sub2, bg, iconBg, valueColor }) {
  return (
    <div style={{
      background: bg, borderRadius: '14px', padding: '18px 20px',
      border: '1px solid rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            {label}
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: valueColor || '#111827', lineHeight: 1, marginBottom: '6px' }}>
            {value}
            {value !== '—' && value !== '…' && <span style={{ fontSize: '13px', fontWeight: 500, color: '#9ca3af' }}> /quintal</span>}
          </div>
          {sub1 && <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub1}</div>}
          {sub2 && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{sub2}</div>}
        </div>
        <div style={{ width: 52, height: 52, borderRadius: '12px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, marginLeft: '12px' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function LiveMandiPrices() {
  const { language } = useLanguage();
  const hi = language === 'hi';

  const [commodity, setCommodity]       = useState('Onion');
  const [state, setState]               = useState('Maharashtra');
  const [districtFilter, setDistFilter] = useState('All');
  const [marketSearch, setMktSearch]    = useState('');

  const [allRecords, setAllRecords] = useState([]);
  const [meta, setMeta]             = useState(null);
  const [districts, setDistricts]   = useState([]);
  const [bestPrice, setBestPrice]   = useState(null);
  const [cachedAt, setCachedAt]     = useState(null);
  const [fromCache, setFromCache]   = useState(false);
  const [lastFetch, setLastFetch]   = useState(null);

  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [coldStart, setColdStart] = useState(false);

  const [page, setPage]   = useState(1);
  const ROWS_PER_PAGE     = 10;
  const timerRef          = useRef(null);

  const fetchPrices = useCallback(async (com, st) => {
    setLoading(true); setError(null); setColdStart(false);
    try {
      const res = await getMandiPrices({ commodity: com, state: st });
      const d = res.data;
      setAllRecords(d.data || []);
      setMeta(d.meta || null);
      setDistricts(['All', ...(d.districts || [])]);
      setBestPrice(d.bestPrice || null);
      setCachedAt(d.cachedAt || null);
      setFromCache(d.fromCache || false);
      setLastFetch(new Date().toISOString());
      setDistFilter('All'); setMktSearch(''); setPage(1);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch';
      setError(msg);
      if (msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('cold') || err.response?.status === 503)
        setColdStart(true);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPrices(commodity, state); }, [commodity, state, fetchPrices]);
  useEffect(() => {
    timerRef.current = setInterval(() => fetchPrices(commodity, state), AUTO_REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [commodity, state, fetchPrices]);

  const displayed = allRecords.filter(r => {
    const mDist = districtFilter === 'All' || r.district === districtFilter;
    const mMkt  = !marketSearch || r.market?.toLowerCase().includes(marketSearch.toLowerCase());
    return mDist && mMkt;
  });

  // Summary calculations from filtered data
  const modalPrices = displayed.map(r => r.modal_price).filter(Boolean);
  const highRecord  = displayed.reduce((a, b) => (b.modal_price > (a?.modal_price || 0) ? b : a), null);
  const lowRecord   = displayed.reduce((a, b) => (b.modal_price < (a?.modal_price || Infinity) ? b : a), null);
  const avgPrice    = modalPrices.length ? Math.round(modalPrices.reduce((s, v) => s + v, 0) / modalPrices.length) : null;

  const latestDate = displayed[0]?.arrival_date || null;
  const staleData  = isStale(latestDate);

  // Pagination
  const totalPages = Math.ceil(displayed.length / ROWS_PER_PAGE);
  const pageRows   = displayed.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif" }}>

      {/* ═══ HERO SECTION ═══════════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)',
        borderRadius: '16px', padding: '28px 32px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '24px', overflow: 'hidden', position: 'relative',
        border: '1px solid #bbf7d0',
      }}>
        {/* Left text */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px' }}>📊</span>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#14532d', margin: 0 }}>
              {hi ? 'मंडी भाव' : 'Market Prices'}
            </h1>
          </div>
          <p style={{ fontSize: '15px', color: '#166534', margin: '0 0 20px', lineHeight: 1.6 }}>
            {hi
              ? 'लाइव मंडी भाव देखें और अपनी फसल के लिए सबसे अच्छा बाजार खोजें'
              : 'Check live mandi prices and find the best market for your crops'}
          </p>
          {/* Info badges */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { icon: '₹', label: hi ? 'असली मंडी डेटा' : 'Real Market Data', sub: hi ? 'APMC मंडियों से' : 'From APMC Mandis' },
              { icon: '🔄', label: hi ? 'दैनिक अपडेट' : 'Updated Daily', sub: hi ? 'ताज़ा मंडी रिपोर्ट' : 'Latest mandi reports' },
              { icon: '📍', label: hi ? 'पूरे भारत में' : 'Across India', sub: hi ? '700+ मंडियाँ' : '700+ mandis covered' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#15803d' }}>
                  {b.icon}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#14532d' }}>{b.label}</div>
                  <div style={{ fontSize: '11px', color: '#4ade80' }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right illustration */}
        <div style={{
          flexShrink: 0, width: 200, height: 120,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {/* CSS farm illustration */}
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Sky / hills */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg,#86efac,#4ade80)', borderRadius: '50% 50% 0 0 / 30px 30px 0 0' }} />
            {/* Tractor */}
            <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', fontSize: '40px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>🚜</div>
            {/* Crops */}
            {['🌾', '🧅', '🍅'].map((e, i) => (
              <div key={i} style={{ position: 'absolute', bottom: 55, left: `${15 + i * 30}%`, fontSize: '20px' }}>{e}</div>
            ))}
            {/* Sign board */}
            <div style={{ position: 'absolute', top: 8, right: 8, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '8px', padding: '4px 8px', fontSize: '10px', fontWeight: 800, color: '#92400e', textAlign: 'center', lineHeight: 1.4 }}>
              किसान से<br/>सीधे बाज़ार
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FILTER CARD ════════════════════════════════════════════════ */}
      <div style={{
        background: '#fff', borderRadius: '14px', padding: '24px',
        marginBottom: '20px', border: '1px solid #e5e7eb',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
          {/* Commodity */}
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {hi ? 'फसल चुनें' : 'Select Crop'}
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>
                {CROP_ICONS[commodity] || '🌾'}
              </span>
              <select
                value={commodity}
                onChange={e => { setCommodity(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
              >
                {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* State */}
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {hi ? 'राज्य' : 'State'}
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>📍</span>
              <select
                value={state}
                onChange={e => { setState(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '10px 12px 10px 32px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* District */}
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {hi ? 'जिला' : 'District'}
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🏘️</span>
              <select
                value={districtFilter}
                onChange={e => { setDistFilter(e.target.value); setPage(1); }}
                disabled={loading || districts.length === 0}
                style={{ width: '100%', padding: '10px 12px 10px 32px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
              >
                {districts.map(d => <option key={d} value={d}>{d === 'All' ? (hi ? 'सभी जिले' : 'All Districts') : d}</option>)}
              </select>
            </div>
          </div>

          {/* Market search */}
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {hi ? 'मंडी (Market)' : 'Market (Mandi)'}
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🏪</span>
              <select
                value={marketSearch}
                onChange={e => { setMktSearch(e.target.value); setPage(1); }}
                disabled={loading}
                style={{ width: '100%', padding: '10px 12px 10px 32px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
              >
                <option value="">{hi ? 'सभी मंडियाँ' : 'All Markets'}</option>
                {[...new Set(allRecords.filter(r => districtFilter === 'All' || r.district === districtFilter).map(r => r.market?.trim()))].filter(Boolean).sort().map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search button */}
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => fetchPrices(commodity, state)}
              disabled={loading}
              style={{
                padding: '11px 24px', background: '#16a34a', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', display: 'flex',
                alignItems: 'center', gap: '6px', opacity: loading ? 0.7 : 1,
                transition: 'background 0.15s',
              }}
            >
              🔍 {hi ? 'खोजें' : 'Search'}
            </button>
          </div>
        </div>

        {/* Popular crops shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', flexShrink: 0 }}>
            {hi ? 'लोकप्रिय फसलें:' : 'Popular Crops:'}
          </span>
          {POPULAR_CROPS.map(c => (
            <button
              key={c.name}
              onClick={() => { setCommodity(c.name); setPage(1); }}
              style={{
                padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '5px',
                background: commodity === c.name ? '#dcfce7' : '#f3f4f6',
                color: commodity === c.name ? '#15803d' : '#374151',
                outline: commodity === c.name ? '2px solid #16a34a' : 'none',
              }}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ LOADING ══════════════════════════════════════════════════════ */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
          <div style={{ width: 44, height: 44, border: '4px solid #dcfce7', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>
            {hi ? `${commodity} के भाव लोड हो रहे हैं...` : `Loading ${commodity} prices for ${state}...`}
          </p>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '6px' }}>
            {hi ? 'फ्री API को शुरू होने में कुछ समय लग सकता है' : 'Free-tier API may take a moment to wake up'}
          </p>
        </div>
      )}

      {/* ═══ ERROR ════════════════════════════════════════════════════════ */}
      {!loading && error && (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #fecaca' }}>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '12px', fontSize: '14px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ {error}
          </div>
          {coldStart && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#c2410c' }}>
              🌡️ {hi ? 'API सो रही थी। 30–60 सेकंड में फिर कोशिश करें।' : 'The API was sleeping (free server). Please retry in 30–60 seconds.'}
            </div>
          )}
          <button onClick={() => fetchPrices(commodity, state)} style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            🔄 {hi ? 'फिर कोशिश करें' : 'Retry'}
          </button>
        </div>
      )}

      {/* ═══ DATA ═════════════════════════════════════════════════════════ */}
      {!loading && !error && (
        <>
          {/* ── Summary cards ── */}
          {displayed.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
              <SummaryCard
                icon="🏆"
                label={hi ? 'आज का सबसे ऊँचा भाव' : 'Highest Price Today'}
                value={highRecord ? fmt(highRecord.modal_price) : '—'}
                sub1={highRecord?.market?.trim()}
                sub2={highRecord ? `${highRecord.district}, Maharashtra` : ''}
                bg="#f0fdf4"
                iconBg="#bbf7d0"
                valueColor="#15803d"
              />
              <SummaryCard
                icon="📊"
                label={hi ? 'औसत भाव' : 'Average Price'}
                value={avgPrice ? fmt(avgPrice) : '—'}
                sub1={displayed.length ? `Across ${displayed.length} markets` : ''}
                bg="#fffbeb"
                iconBg="#fde68a"
                valueColor="#b45309"
              />
              <SummaryCard
                icon="📉"
                label={hi ? 'आज का सबसे कम भाव' : 'Lowest Price Today'}
                value={lowRecord ? fmt(lowRecord.modal_price) : '—'}
                sub1={lowRecord?.market?.trim()}
                sub2={lowRecord ? `${lowRecord.district}, Maharashtra` : ''}
                bg="#fff1f2"
                iconBg="#fecdd3"
                valueColor="#be123c"
              />
              <SummaryCard
                icon="🏪"
                label={hi ? 'कुल मंडियाँ' : 'Total Markets'}
                value={displayed.length > 0 ? String(displayed.length) : '—'}
                sub1={hi ? 'मंडियाँ मिलीं' : 'Markets found'}
                bg="#f0f9ff"
                iconBg="#bae6fd"
                valueColor="#0369a1"
              />
            </div>
          )}

          {/* ── Stale data warning ── */}
          {staleData && latestDate && (
            <div style={{
              background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px',
              padding: '12px 16px', marginBottom: '16px', display: 'flex',
              alignItems: 'center', gap: '10px', fontSize: '13px', color: '#c2410c',
            }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <div>
                <strong>{hi ? 'डेटा पुराना है' : 'Data may be stale'}:</strong>{' '}
                {hi
                  ? `मंडी की नवीनतम रिपोर्ट ${fmtDate(latestDate)} की है। यह वर्तमान बाजार भाव नहीं दर्शाता।`
                  : `The latest market report is from ${fmtDate(latestDate)}. This may not reflect current market prices.`}
                {' '}<em style={{ opacity: 0.8 }}>{hi ? 'APMC मंडी API का डेटा।' : 'Source: APMC Mandi API.'}</em>
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {displayed.length === 0 && (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '60px 20px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '52px', marginBottom: '12px' }}>📭</div>
              <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{hi ? 'कोई रिकॉर्ड नहीं मिला' : 'No records found'}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                {hi ? 'फ़िल्टर बदलकर देखें या बाद में फिर आएं' : 'Try adjusting the filters or check back later.'}
              </p>
            </div>
          )}

          {/* ── Table ── */}
          {displayed.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              {/* Table header row */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{CROP_ICONS[commodity] || '🌾'}</span>
                    <h3 style={{ fontWeight: 800, fontSize: '16px', margin: 0 }}>
                      {hi ? `${commodity} के मंडी भाव` : `Market Prices for ${commodity}`}
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '3px 0 0' }}>
                    {hi ? `${state} में ${displayed.length} मंडियाँ दिख रही हैं` : `Showing ${displayed.length} markets in ${state}`}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                    <span>📅</span>
                    <span>{hi ? 'अंतिम अपडेट:' : 'Last updated:'} {fmtDate(latestDate)}</span>
                  </div>
                  {lastFetch && (
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      🕐 {hi ? 'फ़ेच:' : 'Fetched:'} {fmtTime(lastFetch)}
                    </div>
                  )}
                  <button
                    onClick={() => fetchPrices(commodity, state)}
                    disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#374151' }}
                  >
                    🔄 {hi ? 'रिफ्रेश' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f0fdf4', borderBottom: '2px solid #bbf7d0' }}>
                      {['#', hi ? 'मंडी / बाज़ार' : 'Market / Mandi', hi ? 'जिला' : 'District', hi ? 'किस्म' : 'Variety',
                        hi ? 'न्यूनतम भाव' : 'Min Price', hi ? 'अधिकतम भाव' : 'Max Price',
                        hi ? 'मोडल भाव' : 'Modal Price', hi ? 'रिपोर्ट तारीख' : 'Date', hi ? 'एक्शन' : 'Action',
                      ].map((h, i) => (
                        <th key={i} style={{
                          padding: '11px 14px', textAlign: i >= 4 && i <= 6 ? 'right' : 'left',
                          fontWeight: 700, fontSize: '12px', color: '#15803d',
                          textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r, i) => {
                      const rowIdx       = (page - 1) * ROWS_PER_PAGE + i;
                      const isBest       = r.id === bestPrice?.id && districtFilter === 'All' && !marketSearch;
                      const rowBg        = isBest ? '#f0fdf4' : rowIdx % 2 === 0 ? '#fff' : '#fafafa';
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6', background: rowBg, transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                          onMouseLeave={e => e.currentTarget.style.background = rowBg}>
                          <td style={{ padding: '12px 14px', color: '#9ca3af', fontWeight: 600 }}>{rowIdx + 1}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '18px', flexShrink: 0 }}>🏪</span>
                              <div>
                                <div style={{ fontWeight: 700, color: '#111827' }}>{r.market?.trim()}</div>
                                {isBest && (
                                  <span style={{ fontSize: '10px', background: '#16a34a', color: '#fff', padding: '1px 7px', borderRadius: '10px', fontWeight: 800, letterSpacing: '0.3px' }}>
                                    BEST
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#6b7280' }}>{r.district}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ background: '#f3f4f6', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>{r.variety || '—'}</span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', color: '#6b7280' }}>{fmt(r.min_price)}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', color: '#6b7280' }}>{fmt(r.max_price)}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <span style={{ fontWeight: 900, fontSize: '15px', color: isBest ? '#15803d' : '#16a34a' }}>
                              {fmt(r.modal_price)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: '13px', whiteSpace: 'nowrap' }}>{fmtDate(r.arrival_date)}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <button style={{ padding: '5px 12px', border: '1.5px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              👁 {hi ? 'देखें' : 'View'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    {hi
                      ? `${(page - 1) * ROWS_PER_PAGE + 1}–${Math.min(page * ROWS_PER_PAGE, displayed.length)} / ${displayed.length} मंडियाँ`
                      : `${(page - 1) * ROWS_PER_PAGE + 1}–${Math.min(page * ROWS_PER_PAGE, displayed.length)} of ${displayed.length} markets`}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      style={{ padding: '6px 14px', border: '1.5px solid #e5e7eb', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', background: '#fff', fontSize: '13px', fontWeight: 600, opacity: page === 1 ? 0.4 : 1 }}>
                      ← {hi ? 'पिछला' : 'Prev'}
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const n = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      return (
                        <button key={n} onClick={() => setPage(n)}
                          style={{ width: 34, height: 34, border: '1.5px solid', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, background: page === n ? '#16a34a' : '#fff', color: page === n ? '#fff' : '#374151', borderColor: page === n ? '#16a34a' : '#e5e7eb' }}>
                          {n}
                        </button>
                      );
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      style={{ padding: '6px 14px', border: '1.5px solid #e5e7eb', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', background: '#fff', fontSize: '13px', fontWeight: 600, opacity: page === totalPages ? 0.4 : 1 }}>
                      {hi ? 'अगला' : 'Next'} →
                    </button>
                  </div>
                </div>
              )}

              {/* Footer note */}
              <div style={{ padding: '10px 20px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: '#9ca3af' }}>
                <span>📡 {hi ? 'स्रोत: APMC मंडी भाव API · दैनिक रिपोर्ट — रियल-टाइम नहीं' : 'Source: APMC Mandi Price API · Daily reports — not real-time'}</span>
                {fromCache
                  ? <span>📦 {hi ? 'कैश से (60 मिनट रिफ्रेश)' : 'Cached — refreshes every 60 min'}</span>
                  : <span>✅ {hi ? 'ताज़ा डेटा' : 'Fresh from API'}</span>}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .mp-summary-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .mp-summary-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
