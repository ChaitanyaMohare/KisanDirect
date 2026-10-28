import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { createCrop } from '../services/api';
import { calculateNetEarning, formatIndianCurrency } from '../utils/calculations';

const CROPS = ['Onion', 'Wheat', 'Tomato', 'Soybean', 'Cotton', 'Maize', 'Potato', 'Sugarcane', 'Other'];
const VARIETIES = {
  Onion: ['Red Onion (Nasik)', 'White Onion', 'Pink Onion'],
  Wheat: ['Lok-1', 'GW-322', 'NW-1014'],
  Tomato: ['Hybrid', 'Desi', 'Cherry'],
  Soybean: ['JS-335', 'JS-9305', 'MACS-58'],
  Cotton: ['Bt Cotton', 'Hybrid Cotton'],
  Maize: ['Hybrid', 'Desi Yellow'],
  Potato: ['Jyoti', 'Kufri Chipsona', 'Pukhraj'],
  Sugarcane: ['Co-86032', 'Co-0238'],
  Other: ['Other']
};
const GRADES = ['Grade A', 'Grade B', 'Grade C', 'Export Quality', 'Processing Grade'];
const UNITS = ['Quintal', 'Ton', 'Kg'];
const DISTRICTS = ['Ahmednagar', 'Nashik', 'Pune', 'Nagpur', 'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur', 'Latur'];

export default function SellCrop() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [form, setForm] = useState({
    crop: 'Onion', variety: 'Red Onion (Nasik)', quantity: '', unit: 'Quintal',
    expectedPrice: '', harvestDate: '', quality: 'Grade A',
    location: user?.district ? `${user.village || ''}, ${user.district}` : '',
    district: user?.district || '', state: user?.state || 'Maharashtra',
    availableFrom: '', description: ''
  });

  // Live earnings preview
  const [transportCost, setTransportCost] = useState('');
  const earningsPreview = form.quantity && form.expectedPrice
    ? calculateNetEarning(Number(form.quantity), Number(form.expectedPrice), Number(transportCost) || 0)
    : null;

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (e.target.name === 'crop') setForm(p => ({ ...p, crop: e.target.value, variety: VARIETIES[e.target.value]?.[0] || '' }));
    setFormErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.crop) errs.crop = 'Crop is required';
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'Enter valid quantity';
    if (!form.expectedPrice || Number(form.expectedPrice) <= 0) errs.expectedPrice = 'Enter valid price';
    if (!form.harvestDate) errs.harvestDate = 'Harvest date is required';
    if (!form.district) errs.district = 'District is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setLoading(true); setError('');
    try {
      await createCrop({
        ...form,
        farmerId: user.id,
        farmerName: user.name,
        farmerLocation: `${user.village || ''}, ${user.district}`,
        quantity: Number(form.quantity),
        expectedPrice: Number(form.expectedPrice)
      });
      setSuccess(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create listing');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <DashboardLayout title={t('sell_your_crop')}>
        <div style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center' }}>
          <div style={{ fontSize: '72px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px', color: 'var(--green-primary)' }}>
            {t('listing_success')}
          </h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '28px', fontSize: '15px', lineHeight: 1.6 }}>
            Your {form.crop} listing ({form.quantity} {form.unit} at ₹{Number(form.expectedPrice).toLocaleString('en-IN')}/Quintal) is now visible to buyers across Maharashtra.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/farmer/crops')}>View My Crops</button>
            <button className="btn btn-outline" onClick={() => { setSuccess(false); setForm(p => ({ ...p, quantity: '', expectedPrice: '', description: '' })); }}>
              + Add Another
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('sell_your_crop')}>
      <div className="page-header">
        <h1 className="page-title">🌾 {t('sell_your_crop')}</h1>
        <p className="page-subtitle">List your crop and connect directly with verified buyers</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        {/* Main form */}
        <div className="card">
          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('crop_name')} *</label>
                <select className="form-select" name="crop" value={form.crop} onChange={handleChange}>
                  {CROPS.map(c => <option key={c}>{c}</option>)}
                </select>
                {formErrors.crop && <div className="form-error">{formErrors.crop}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">{t('crop_variety')}</label>
                <select className="form-select" name="variety" value={form.variety} onChange={handleChange}>
                  {(VARIETIES[form.crop] || ['Other']).map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('quantity')} *</label>
                <input className="form-input" type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="50" min="1" />
                {formErrors.quantity && <div className="form-error">{formErrors.quantity}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">{t('unit')}</label>
                <select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('expected_price')} *</label>
                <input className="form-input" type="number" name="expectedPrice" value={form.expectedPrice} onChange={handleChange} placeholder="3000" min="1" />
                {formErrors.expectedPrice && <div className="form-error">{formErrors.expectedPrice}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">{t('quality_grade')}</label>
                <select className="form-select" name="quality" value={form.quality} onChange={handleChange}>
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('harvest_date')} *</label>
                <input className="form-input" type="date" name="harvestDate" value={form.harvestDate} onChange={handleChange} />
                {formErrors.harvestDate && <div className="form-error">{formErrors.harvestDate}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">{t('available_from')}</label>
                <input className="form-input" type="date" name="availableFrom" value={form.availableFrom} onChange={handleChange} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('district')} *</label>
                <select className="form-select" name="district" value={form.district} onChange={handleChange}>
                  <option value="">Select District</option>
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
                {formErrors.district && <div className="form-error">{formErrors.district}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">{t('location')}</label>
                <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="Village, District" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('description')}</label>
              <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange}
                placeholder="Describe quality, storage conditions, any certifications..." rows={3} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('upload_images')}</label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', padding: '24px', textAlign: 'center', color: 'var(--text-light)', cursor: 'pointer' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                <p style={{ fontSize: '14px' }}>Click to upload crop photos (JPEG, PNG)</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Max 5 photos, 5MB each</p>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? t('loading') : `🌾 ${t('publish_crop')}`}
            </button>
          </form>
        </div>

        {/* Earnings preview sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ border: '2px solid var(--green-primary)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '16px' }}>🧮 {t('calculator_title')}</h3>
            {earningsPreview ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: `${form.quantity} ${form.unit} × ₹${Number(form.expectedPrice).toLocaleString('en-IN')}`, value: formatIndianCurrency(earningsPreview.grossRevenue), color: 'var(--text-primary)' },
                    { label: `− ${t('transport_cost')}`, value: formatIndianCurrency(earningsPreview.transportCost), color: 'var(--red-alert)' },
                    { label: `= ${t('net_earning')}`, value: formatIndianCurrency(earningsPreview.netEarning), color: 'var(--green-primary)', bold: true },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: i === 2 ? 'var(--green-light)' : 'var(--bg-gray)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ fontWeight: row.bold ? 800 : 600, color: row.color, fontSize: row.bold ? '18px' : '14px' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Estimated Transport Cost (₹)</label>
                  <input className="form-input" type="number" placeholder="8000" value={transportCost} onChange={e => setTransportCost(e.target.value)} />
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-light)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                Enter quantity and price to see earnings estimate
              </p>
            )}
          </div>

          <div className="card" style={{ background: 'var(--green-light)', border: 'none' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--green-dark)' }}>💡 Tips for Better Prices</h4>
            <ul style={{ fontSize: '13px', color: 'var(--green-dark)', paddingLeft: '16px', lineHeight: 1.8 }}>
              <li>Add clear photos of your crop</li>
              <li>Mention quality grade and certifications</li>
              <li>Check current market prices before setting your rate</li>
              <li>List your crop early for better reach</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sell-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
