import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { sendOTP, verifyOTP } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function VerifyEmail() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const { language } = useLanguage();

  // Passed from Register page via router state
  const email    = location.state?.email    || '';
  const name     = location.state?.name     || '';
  const redirect = location.state?.redirect || '/farmer/dashboard';

  const [otp,           setOtp]           = useState(['', '', '', '', '', '']);
  const [status,        setStatus]        = useState('idle');   // idle | sending | sent | verifying | success | error
  const [message,       setMessage]       = useState('');
  const [countdown,     setCountdown]     = useState(0);
  const [delivery,      setDelivery]      = useState(null);   // from backend response
  const inputRefs = useRef([]);

  // Redirect away if no email was provided
  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
  }, [email, navigate]);

  // Auto-send OTP on mount
  useEffect(() => {
    if (email) handleSendOTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleSendOTP() {
    setStatus('sending');
    setMessage('');
    try {
      const res = await sendOTP(email, name);
      setDelivery(res.data.delivery);
      setCountdown(60);
      setStatus('sent');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setMessage(msg);
      setStatus('error');
    }
  }

  function handleOtpChange(index, value) {
    // Accept only digits
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    // Auto-advance
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  }

  async function handleVerify(e) {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setMessage(language === 'hi' ? 'कृपया 6 अंकों का OTP दर्ज करें' : 'Please enter the complete 6-digit OTP');
      return;
    }
    setStatus('verifying');
    setMessage('');
    try {
      await verifyOTP(email, otpString);
      setStatus('success');
      setMessage(language === 'hi' ? 'ईमेल सफलतापूर्वक सत्यापित!' : 'Email verified successfully!');
      // Brief pause so the user sees the success state, then redirect
      setTimeout(() => navigate(redirect, { replace: true }), 1800);
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please try again.';
      setMessage(msg);
      setStatus('sent'); // back to input state
    }
  }

  const hi = language === 'hi';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gray)' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 68px)', padding: '20px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '52px', marginBottom: '14px' }}>
              {status === 'success' ? '✅' : '📧'}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800 }}>
              {hi ? 'ईमेल सत्यापित करें' : 'Verify Your Email'}
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '8px', lineHeight: 1.6 }}>
              {status === 'sending'
                ? (hi ? 'OTP भेजा जा रहा है...' : 'Sending OTP...')
                : (hi
                    ? `${email} पर 6 अंकों का OTP भेजा गया`
                    : `A 6-digit OTP has been sent to ${email}`)}
            </p>
          </div>

          {/* Delivery notice — shown when Resend free-tier redirects */}
          {delivery && !delivery.reachedFarmer && (
            <div className="alert alert-warning" style={{ marginBottom: '20px', fontSize: '13px' }}>
              <div><strong>ℹ️ {hi ? 'सूचना' : 'Note'}:</strong></div>
              <div style={{ marginTop: '4px' }}>
                {hi
                  ? `Resend फ्री टियर की सीमा के कारण OTP अभी ${delivery.emailDeliveredTo} पर भेजा गया है। आपका OTP देखने के लिए उस ईमेल को चेक करें।`
                  : `Due to Resend free-tier restrictions, the OTP was delivered to ${delivery.emailDeliveredTo} instead of your address. Check that inbox to find your OTP.`}
              </div>
            </div>
          )}

          {status === 'success' ? (
            <div className="alert alert-success" style={{ textAlign: 'center', padding: '20px', fontSize: '15px' }}>
              ✅ {message}<br />
              <span style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '6px', display: 'block' }}>
                {hi ? 'डैशबोर्ड पर जा रहे हैं...' : 'Redirecting to dashboard...'}
              </span>
            </div>
          ) : (
            <form onSubmit={handleVerify}>
              {/* 6-digit OTP input boxes */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    disabled={status === 'verifying' || status === 'sending'}
                    style={{
                      width: '48px', height: '56px',
                      textAlign: 'center', fontSize: '22px', fontWeight: 800,
                      border: `2px solid ${message && status === 'sent' ? 'var(--red-alert)' : digit ? 'var(--green-primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                      background: digit ? 'var(--green-light)' : '#fff',
                    }}
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              {/* Error/info message */}
              {message && status !== 'success' && (
                <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '13px' }}>
                  {message}
                </div>
              )}

              {/* Verify button */}
              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={status === 'verifying' || status === 'sending' || otp.join('').length < 6}
              >
                {status === 'verifying'
                  ? (hi ? 'सत्यापित हो रहा है...' : 'Verifying...')
                  : (hi ? 'OTP सत्यापित करें' : 'Verify OTP')}
              </button>

              {/* Resend */}
              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-light)' }}>
                {hi ? 'OTP नहीं मिला?' : "Didn't receive the OTP?"}{' '}
                {countdown > 0 ? (
                  <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>
                    {hi ? `${countdown}s में दोबारा भेजें` : `Resend in ${countdown}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={status === 'sending'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-primary)', fontWeight: 700, fontSize: '14px', padding: 0 }}
                  >
                    {hi ? 'दोबारा भेजें' : 'Resend OTP'}
                  </button>
                )}
              </div>

              {/* Skip link */}
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => navigate(redirect, { replace: true })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: '13px' }}
                >
                  {hi ? 'अभी छोड़ें, बाद में सत्यापित करें →' : 'Skip for now, verify later →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
