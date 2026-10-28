# 🌿 KisanDirect — Sell Direct. Earn More.

> India's farmer-first agricultural marketplace for direct crop selling, live mandi price discovery, and direct buyer connections.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, Axios, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Email | Resend |
| Mandi Prices | APMC Mandi Price API |

## Project Structure

```
KisanDirect/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/       # Route-level page components
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth + Language context
│   │   ├── services/    # API calls (axios)
│   │   ├── i18n/        # Hindi + English translations
│   │   └── utils/       # Calculations (net earnings, etc.)
│   └── .env.example
│
└── server/          # Express.js backend
    ├── models/      # Mongoose models
    ├── routes/      # Express route handlers
    ├── services/    # Business logic (auth, email, OTP, mandi)
    ├── controllers/ # HTTP request/response handlers
    ├── config/      # MongoDB connection
    ├── data/        # Mock/seed data
    ├── scripts/     # seed.js — populate Atlas with demo data
    └── .env.example
```

## Quick Start

### 1. Clone & install dependencies

```bash
git clone <your-repo-url>
cd KisanDirect

# Install all dependencies
npm run install:all
```

### 2. Configure environment variables

```bash
# Backend
cp server/.env.example server/.env
# Fill in MONGODB_URI, JWT_SECRET, RESEND_API_KEY

# Frontend
cp client/.env.example client/.env
# VITE_API_URL is pre-filled for local development
```

### 3. Seed the database (first time only)

```bash
cd server
npm run seed
```

### 4. Start both servers

```bash
# Terminal 1 — Backend (port 5000)
npm run server

# Terminal 2 — Frontend (port 3000)
npm run client
```

## Demo Login Credentials

| Role | Mobile / Username | Password |
|---|---|---|
| Farmer | 9876543210 | farmer123 |
| Buyer | 9871234560 | buyer123 |
| Admin | admin | admin123 |

## Key Features

- 📊 **Live Mandi Prices** — Real APMC data via mandi-api.onrender.com
- 🌾 **Crop Listings** — Farmers list crops, buyers browse directly
- 🧮 **Net Earnings Calculator** — Calculates profit after transport costs
- 💬 **Buyer Requests & Negotiation** — Accept / counter / reject offers
- 🔔 **Price Alerts** — Email notification when target price is reached
- 📧 **Transactional Email** — Welcome, OTP, order updates via Resend
- 🌐 **Hindi / English** — Full bilingual UI
- 📱 **Mobile-first** — Responsive on all screen sizes

## Environment Variables Reference

See `server/.env.example` for all required backend variables.

> ⚠️ Never commit `.env` files. Real credentials are git-ignored.
