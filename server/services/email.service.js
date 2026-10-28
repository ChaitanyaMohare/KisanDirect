/**
 * KisanDirect — Email Service
 * ---------------------------
 * All outgoing emails flow through this single file.
 * Provider: Resend (resend.com)
 *
 * FREE TIER BEHAVIOUR (EMAIL_DOMAIN_VERIFIED=false):
 *   Resend only allows sending to your own verified account email.
 *   We redirect to RESEND_OWNER_EMAIL and show a dev banner inside the email
 *   so you can see exactly who it was meant for and what it contains.
 *   replyTo is always set to the farmer/buyer's real email.
 *
 * PRODUCTION (EMAIL_DOMAIN_VERIFIED=true):
 *   Sends directly to the farmer/buyer's real email — no redirect.
 *   Steps: verify domain at resend.com/domains → set EMAIL_FROM=noreply@yourdomain.com
 *          → set EMAIL_DOMAIN_VERIFIED=true in .env  — zero code changes needed.
 */

'use strict';

const { Resend } = require('resend');

// ── Lazy-initialize client (safe to require without env loaded) ────────────
let _resend = null;
function getClient() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not set in server/.env');
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// ── Config (read at call-time so .env is always loaded first) ─────────────
function cfg() {
  return {
    FROM:       process.env.EMAIL_FROM            || 'onboarding@resend.dev',
    OWNER:      process.env.RESEND_OWNER_EMAIL     || 'gradebinn@gmail.com',
    DOMAIN_OK:  process.env.EMAIL_DOMAIN_VERIFIED  === 'true',
    APP_URL:    process.env.CLIENT_URL             || 'http://localhost:3000',
  };
}

// ── Shared HTML shell ──────────────────────────────────────────────────────
function shell(bodyHtml, appUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>KisanDirect</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;color:#111827}
  .wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)}
  .bdy{padding:32px}
  .row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #e5e7eb;font-size:14px}
  .row:last-child{border-bottom:none}
  .row .k{color:#6b7280} .row .v{font-weight:600}
  .btn{display:inline-block;margin-top:20px;padding:13px 28px;background:#2d7a3a;color:#fff!important;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none}
  .ftr{background:#f9fafb;padding:18px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb}
  .ftr a{color:#2d7a3a}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
  .bg{background:#dcfce7;color:#15803d} .bo{background:#fff7ed;color:#c2410c} .bb{background:#eff6ff;color:#1d4ed8}
</style>
</head>
<body>
<div class="wrap">
  <div style="background:linear-gradient(135deg,#1e5428,#2d7a3a);padding:22px 32px;text-align:center">
    <div style="font-size:28px;margin-bottom:6px">🌿</div>
    <div style="color:#fff;font-size:20px;font-weight:800">KisanDirect</div>
    <div style="color:rgba(255,255,255,.75);font-size:12px;margin-top:2px">Sell Direct. Earn More.</div>
  </div>
  <div class="bdy">${bodyHtml}</div>
  <div class="ftr">
    © 2026 KisanDirect &nbsp;·&nbsp; <a href="${appUrl}">kisandirect.in</a><br/>
    You received this because you registered on KisanDirect.
  </div>
</div>
</body></html>`;
}

// ── Core send (smart routing) ──────────────────────────────────────────────
async function send({ to, subject, html, recipientName }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY missing — skipped:', subject);
    return { skipped: true };
  }

  const { FROM, OWNER, DOMAIN_OK } = cfg();

  // Who actually receives the email from Resend
  const actualTo      = DOMAIN_OK ? to : OWNER;
  const finalSubject  = DOMAIN_OK ? subject : `[For: ${recipientName || to}] ${subject}`;

  // When in dev/free-tier, inject a visible banner at the top of the email
  // so the owner sees exactly who the email was meant for
  let finalHtml = html;
  if (!DOMAIN_OK) {
    const banner = `
<div style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:8px;padding:14px 18px;
            margin:0 0 24px;font-size:13px;color:#78350f;line-height:1.7">
  <strong>📬 Dev Redirect</strong> — This email was meant for:<br/>
  <strong>${recipientName || ''}</strong> &lt;${to}&gt;<br/>
  <span style="opacity:.8">Resend free-tier only delivers to the verified owner address until a domain is added.</span><br/>
  <a href="https://resend.com/domains" style="color:#92400e;font-weight:700">
    → Verify a domain at resend.com/domains
  </a>
  then set <code style="background:#fde68a;padding:1px 6px;border-radius:3px">EMAIL_DOMAIN_VERIFIED=true</code>
  in <code>server/.env</code>.
</div>`;
    finalHtml = html.replace('<div class="bdy">', `<div class="bdy">${banner}`);
    console.log(`[Email] ⚠  Dev redirect: [${to}] → owner [${OWNER}]  |  "${subject}"`);
  }

  const result = await getClient().emails.send({
    from:    FROM,
    replyTo: to,       // owner can reply directly to the intended recipient
    to:      actualTo,
    subject: finalSubject,
    html:    finalHtml,
  });

  const id = result?.data?.id || result?.id || '—';
  console.log(`[Email] ✓  id:${id}  deliveredTo:${actualTo}  intendedFor:${to}  | "${subject}"`);
  return { success: true, id, deliveredTo: actualTo, intendedFor: to, domainVerified: DOMAIN_OK };
}

// ═══════════════════════════════════════════════════════════════════════════
//  TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

/** 1. Farmer Welcome — sent immediately after registration */
async function sendFarmerWelcome({ to, name, village, district, state, mainCrop, mobile, preferredLanguage }) {
  const { APP_URL } = cfg();
  const hi = preferredLanguage === 'hi';

  const features = hi ? [
    { icon: '📡', text: '<strong>लाइव मंडी भाव देखें</strong> — महाराष्ट्र की सभी APMC मंडियों के ताज़ा भाव' },
    { icon: '🌾', text: '<strong>अपनी फसल सूचीबद्ध करें</strong> — सत्यापित खरीदारों तक सीधे पहुँचें' },
    { icon: '🧮', text: '<strong>शुद्ध कमाई की गणना करें</strong> — परिवहन घटाकर असली मुनाफा जानें' },
    { icon: '🔔', text: '<strong>मूल्य अलर्ट सेट करें</strong> — लक्ष्य भाव पहुँचते ही तुरंत सूचना' },
    { icon: '🤝', text: '<strong>खरीदारों से सीधे बात करें</strong> — मोलभाव करें, ऑर्डर स्वीकार करें' },
    { icon: '🚛', text: '<strong>परिवहन खोजें</strong> — फसल को सही बाजार तक पहुँचाएँ' },
  ] : [
    { icon: '📡', text: '<strong>Live Mandi Prices</strong> — Real APMC prices across all Maharashtra districts' },
    { icon: '🌾', text: '<strong>List Your Crop</strong> — Reach verified buyers across Maharashtra directly' },
    { icon: '🧮', text: '<strong>Net Earnings Calculator</strong> — Know your real profit after transport' },
    { icon: '🔔', text: '<strong>Price Alerts</strong> — Get notified the moment your target price is hit' },
    { icon: '🤝', text: '<strong>Direct Buyer Connect</strong> — Negotiate, accept offers, close deals' },
    { icon: '🚛', text: '<strong>Find Transport</strong> — Arrange delivery to the best market' },
  ];

  const promises = hi
    ? ['✅ कोई बिचौलिया नहीं', '✅ पारदर्शी भाव', '✅ सत्यापित खरीदार', '✅ हिंदी में पूरी सहायता']
    : ['✅ No middlemen', '✅ Transparent pricing', '✅ Verified buyers only', '✅ Support in Hindi & English'];

  const location = [village, district, state].filter(Boolean).join(', ') || '—';

  return send({
    to,
    recipientName: name,
    subject: hi
      ? `${name} जी, KisanDirect में आपका स्वागत है! 🌾`
      : `Welcome to KisanDirect, ${name}! Your farming journey starts now 🌾`,
    html: shell(`
      <!-- Hero -->
      <div style="background:linear-gradient(135deg,#1e5428,#2d7a3a);margin:-32px -32px 28px;
                  padding:40px 32px;text-align:center;color:#fff">
        <div style="font-size:56px;margin-bottom:14px">👨‍🌾</div>
        <h2 style="font-size:26px;font-weight:900;margin:0 0 8px;color:#fff">
          ${hi ? `नमस्ते ${name} जी! 🙏` : `Welcome, ${name}! 🌱`}
        </h2>
        <p style="font-size:16px;opacity:.9;margin:0">
          ${hi ? 'KisanDirect परिवार में आपका स्वागत है!' : 'You are now part of the KisanDirect family!'}
        </p>
      </div>

      <!-- Intro -->
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:22px">
        ${hi
          ? `हमें बेहद खुशी है कि आप <strong>KisanDirect</strong> से जुड़े। यह प्लेटफॉर्म आपके लिए बना है — ताकि आप अपनी फसल सीधे खरीदारों को बेचें, बेहतर मंडी भाव खोजें, और अपनी कमाई बढ़ाएँ — बिना किसी बिचौलिए के।`
          : `We're thrilled to have you on <strong>KisanDirect</strong> — built for farmers like you. Sell your crops directly to verified buyers, discover the best mandi prices, and maximize your earnings — completely without middlemen.`}
      </p>

      <!-- Profile card -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px 22px;margin-bottom:24px">
        <div style="font-size:11px;font-weight:800;color:#15803d;text-transform:uppercase;
                    letter-spacing:.8px;margin-bottom:14px">
          📋 ${hi ? 'आपकी पंजीकृत प्रोफ़ाइल' : 'Your Registered Profile'}
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="border-bottom:1px solid #dcfce7">
            <td style="padding:9px 4px;color:#6b7280;width:38%">${hi ? 'नाम' : 'Name'}</td>
            <td style="padding:9px 4px;font-weight:700;color:#111827">${name}</td>
          </tr>
          ${mobile ? `<tr style="border-bottom:1px solid #dcfce7">
            <td style="padding:9px 4px;color:#6b7280">${hi ? 'मोबाइल' : 'Mobile'}</td>
            <td style="padding:9px 4px;font-weight:700;color:#111827">+91 ${mobile}</td>
          </tr>` : ''}
          <tr style="border-bottom:1px solid #dcfce7">
            <td style="padding:9px 4px;color:#6b7280">${hi ? 'स्थान' : 'Location'}</td>
            <td style="padding:9px 4px;font-weight:700;color:#111827">${location}</td>
          </tr>
          <tr>
            <td style="padding:9px 4px;color:#6b7280">${hi ? 'मुख्य फसल' : 'Main Crop'}</td>
            <td style="padding:9px 4px;font-weight:800;color:#2d7a3a;font-size:15px">🌾 ${mainCrop || '—'}</td>
          </tr>
        </table>
      </div>

      <!-- Features -->
      <p style="font-size:15px;font-weight:700;color:#111827;margin-bottom:14px">
        ${hi ? 'अब आप KisanDirect पर क्या कर सकते हैं:' : 'Here\'s what you can do on KisanDirect:'}
      </p>
      ${features.map(f => `
        <div style="display:flex;align-items:flex-start;gap:12px;background:#fafafa;
                    border-radius:8px;padding:12px 14px;border:1px solid #e5e7eb;margin-bottom:8px">
          <span style="font-size:20px;flex-shrink:0;margin-top:1px">${f.icon}</span>
          <span style="font-size:14px;line-height:1.65;color:#374151">${f.text}</span>
        </div>`).join('')}

      <!-- Promises -->
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;
                  padding:18px 22px;margin:20px 0 24px">
        <div style="font-size:12px;font-weight:800;color:#c2410c;text-transform:uppercase;
                    letter-spacing:.6px;margin-bottom:12px">
          🤝 ${hi ? 'हमारा वादा' : 'Our Promise to You'}
        </div>
        ${promises.map(p => `
          <div style="font-size:14px;color:#374151;padding:4px 0;line-height:1.6">${p}</div>`).join('')}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin:28px 0 22px">
        <a href="${APP_URL}/farmer/dashboard"
           style="display:inline-block;padding:15px 40px;background:#2d7a3a;color:#fff;
                  border-radius:10px;font-size:16px;font-weight:800;text-decoration:none;
                  box-shadow:0 4px 14px rgba(45,122,58,.3)">
          ${hi ? 'डैशबोर्ड खोलें →' : 'Go to Your Dashboard →'}
        </a>
      </div>

      <!-- Sign off -->
      <p style="font-size:14px;line-height:1.7;color:#6b7280;text-align:center;
                border-top:1px solid #e5e7eb;padding-top:20px">
        ${hi
          ? 'कोई सहायता चाहिए? हम यहाँ हैं। KisanDirect के साथ ज्यादा कमाएँ!'
          : 'Need help? We\'re always here. Wishing you a great harvest and even better prices!'}
      </p>
      <p style="font-size:14px;color:#374151;text-align:center;margin-top:10px">
        ${hi ? 'शुभकामनाओं सहित,' : 'Warm regards,'}<br/>
        <strong>The KisanDirect Team 🌿</strong>
      </p>
    `, APP_URL),
  });
}

/** 2. Buyer Welcome */
async function sendBuyerWelcome({ to, name, companyName, businessType }) {
  const { APP_URL } = cfg();
  return send({
    to, recipientName: name,
    subject: `Welcome to KisanDirect, ${name}!`,
    html: shell(`
      <div style="background:linear-gradient(135deg,#1e5428,#2d7a3a);margin:-32px -32px 28px;
                  padding:36px 32px;text-align:center;color:#fff">
        <div style="font-size:48px;margin-bottom:12px">🏭</div>
        <h2 style="font-size:24px;font-weight:900;margin:0 0 6px;color:#fff">Welcome, ${name}!</h2>
        <p style="opacity:.85;margin:0">Your buyer account is ready on KisanDirect</p>
      </div>
      <p style="font-size:15px;line-height:1.8;color:#374151;margin-bottom:20px">
        You can now browse fresh crop listings directly from verified farmers across Maharashtra —
        no intermediaries, transparent pricing, direct deals.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px 22px;margin-bottom:22px">
        <div style="font-size:11px;font-weight:800;color:#15803d;text-transform:uppercase;letter-spacing:.7px;margin-bottom:12px">Account Details</div>
        <div class="row"><span class="k">Name</span><span class="v">${name}</span></div>
        ${companyName ? `<div class="row"><span class="k">Company</span><span class="v">${companyName}</span></div>` : ''}
        <div class="row"><span class="k">Business Type</span><span class="v">${businessType || '—'}</span></div>
      </div>
      <div style="text-align:center">
        <a href="${APP_URL}/marketplace" class="btn">Browse Marketplace →</a>
      </div>
    `, APP_URL),
  });
}

/** 3. Buyer request → notify farmer */
async function sendBuyerRequestNotification({ to, farmerName, buyerName, crop, quantity, unit, offeredPrice, deliveryDate }) {
  const { APP_URL } = cfg();
  return send({
    to, recipientName: farmerName,
    subject: `New buyer request for your ${crop} — ₹${Number(offeredPrice).toLocaleString('en-IN')}/Quintal`,
    html: shell(`
      <h2 style="font-size:20px;font-weight:800;margin-bottom:16px">नया खरीदार अनुरोध 📩</h2>
      <p style="font-size:15px;color:#374151;margin-bottom:16px">
        Hello <strong>${farmerName}</strong>, you have a new buyer request on KisanDirect.
      </p>
      <div style="background:#f0fdf4;border-left:4px solid #2d7a3a;border-radius:6px;padding:16px 18px;margin-bottom:20px">
        <div style="font-size:11px;font-weight:800;color:#16a34a;text-transform:uppercase;margin-bottom:6px">Offered Price</div>
        <div style="font-size:28px;font-weight:900;color:#111827">₹${Number(offeredPrice).toLocaleString('en-IN')}<span style="font-size:14px;font-weight:500;color:#6b7280"> / Quintal</span></div>
      </div>
      <div class="row"><span class="k">Buyer</span><span class="v">${buyerName}</span></div>
      <div class="row"><span class="k">Crop</span><span class="v">${crop}</span></div>
      <div class="row"><span class="k">Quantity</span><span class="v">${quantity} ${unit || 'Quintal'}</span></div>
      <div class="row"><span class="k">Delivery By</span><span class="v">${deliveryDate || 'Flexible'}</span></div>
      <p style="font-size:14px;color:#374151;margin-top:16px">Log in to <strong>accept, reject, or negotiate</strong> this offer.</p>
      <div style="text-align:center"><a href="${APP_URL}/farmer/requests" class="btn">View Request →</a></div>
    `, APP_URL),
  });
}

/** 4. Order status update */
async function sendOrderStatusUpdate({ to, farmerName, orderId, status, buyerName, crop, quantity, totalValue }) {
  const { APP_URL } = cfg();
  const labels = {
    'Accepted':         { text: '✅ Price Accepted',    cls: 'bg' },
    'Pickup Scheduled': { text: '📅 Pickup Scheduled',  cls: 'bb' },
    'In Transit':       { text: '🚛 In Transit',         cls: 'bo' },
    'Completed':        { text: '🎉 Order Completed',    cls: 'bg' },
    'Negotiating':      { text: '💬 Negotiation Started',cls: 'bb' },
  };
  const s = labels[status] || { text: status, cls: 'bb' };
  return send({
    to, recipientName: farmerName,
    subject: `Order #${orderId} — ${s.text}`,
    html: shell(`
      <h2 style="font-size:20px;font-weight:800;margin-bottom:16px">Order Update</h2>
      <p style="font-size:15px;color:#374151;margin-bottom:16px">Hello <strong>${farmerName}</strong>, your order status has changed.</p>
      <div style="background:#f0fdf4;border-left:4px solid #2d7a3a;border-radius:6px;padding:16px 18px;margin-bottom:20px">
        <div style="font-size:12px;font-weight:700;color:#16a34a;margin-bottom:8px">Order #${orderId}</div>
        <span class="badge ${s.cls}">${s.text}</span>
      </div>
      <div class="row"><span class="k">Buyer</span><span class="v">${buyerName}</span></div>
      <div class="row"><span class="k">Crop</span><span class="v">${crop}</span></div>
      <div class="row"><span class="k">Quantity</span><span class="v">${quantity} Quintal</span></div>
      <div class="row"><span class="k">Total Value</span><span class="v">₹${Number(totalValue).toLocaleString('en-IN')}</span></div>
      ${status === 'Completed' ? `<p style="color:#15803d;font-weight:700;margin-top:16px">🎉 Congratulations! Payment will be processed shortly.</p>` : ''}
      <div style="text-align:center"><a href="${APP_URL}/farmer/orders" class="btn">View Order →</a></div>
    `, APP_URL),
  });
}

/** 5. Price alert triggered */
async function sendPriceAlertTriggered({ to, farmerName, crop, targetPrice, market, currentPrice }) {
  const { APP_URL } = cfg();
  return send({
    to, recipientName: farmerName,
    subject: `🔔 ${crop} reached ₹${Number(currentPrice).toLocaleString('en-IN')}/Quintal at ${market}`,
    html: shell(`
      <h2 style="font-size:20px;font-weight:800;margin-bottom:16px">🔔 Price Alert Triggered!</h2>
      <p style="font-size:15px;color:#374151;margin-bottom:16px">Hello <strong>${farmerName}</strong>, the price you were waiting for has been reached!</p>
      <div style="background:#f0fdf4;border-left:4px solid #2d7a3a;border-radius:6px;padding:16px 18px;margin-bottom:20px">
        <div style="font-size:11px;font-weight:800;color:#16a34a;text-transform:uppercase;margin-bottom:6px">Current Price at ${market}</div>
        <div style="font-size:28px;font-weight:900;color:#2d7a3a">₹${Number(currentPrice).toLocaleString('en-IN')}<span style="font-size:14px;font-weight:500;color:#6b7280"> / Quintal</span></div>
      </div>
      <div class="row"><span class="k">Crop</span><span class="v">${crop}</span></div>
      <div class="row"><span class="k">Market</span><span class="v">${market}</span></div>
      <div class="row"><span class="k">Your Target</span><span class="v">₹${Number(targetPrice).toLocaleString('en-IN')}</span></div>
      <div class="row"><span class="k">Current Price</span><span class="v" style="color:#15803d">₹${Number(currentPrice).toLocaleString('en-IN')} ✓</span></div>
      <p style="font-size:14px;color:#374151;margin-top:16px">Now is a great time to list your crop and connect with buyers!</p>
      <div style="text-align:center"><a href="${APP_URL}/farmer/market-prices" class="btn">View Market Prices →</a></div>
    `, APP_URL),
  });
}

/** 6. OTP */
async function sendOTP({ to, name, otp }) {
  const { APP_URL } = cfg();
  return send({
    to, recipientName: name,
    subject: `KisanDirect — Your OTP is ${otp}`,
    html: shell(`
      <h2 style="font-size:20px;font-weight:800;margin-bottom:16px">Verify Your Account</h2>
      <p style="font-size:15px;color:#374151;margin-bottom:16px">Hello <strong>${name || 'there'}</strong>, use the OTP below to verify your KisanDirect account.</p>
      <div style="text-align:center;background:#f0fdf4;border-radius:10px;padding:28px;margin-bottom:16px">
        <div style="font-size:11px;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px">Your One-Time Password</div>
        <div style="font-size:44px;font-weight:900;letter-spacing:16px;color:#2d7a3a">${otp}</div>
      </div>
      <p style="font-size:13px;color:#6b7280;text-align:center">Valid for <strong>10 minutes</strong>. Never share this OTP with anyone.</p>
    `, APP_URL),
  });
}

/** 7. Integration test */
async function sendTestEmail({ to }) {
  const { APP_URL } = cfg();
  return send({
    to, recipientName: 'Test',
    subject: 'KisanDirect — Email Integration Test ✅',
    html: shell(`
      <h2 style="font-size:20px;font-weight:800;margin-bottom:16px">Email Integration Working! ✅</h2>
      <p style="font-size:15px;color:#374151;margin-bottom:16px">Resend is connected. The following emails are active:</p>
      ${[
        '✅ Farmer Welcome (on registration)',
        '✅ Buyer Welcome (on registration)',
        '✅ New Buyer Request Notification',
        '✅ Order Status Updates',
        '✅ Price Alert Triggers',
        '✅ OTP Verification',
      ].map(item => `<div style="padding:7px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151">${item}</div>`).join('')}
      <div style="text-align:center"><a href="${APP_URL}" class="btn">Go to KisanDirect →</a></div>
    `, APP_URL),
  });
}

module.exports = {
  sendFarmerWelcome,
  sendBuyerWelcome,
  sendBuyerRequestNotification,
  sendOrderStatusUpdate,
  sendPriceAlertTriggered,
  sendOTP,
  sendTestEmail,
};
