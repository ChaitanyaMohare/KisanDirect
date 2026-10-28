import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

import './App.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import FarmerDashboard from './pages/FarmerDashboard';
import MyCrops from './pages/MyCrops';
import MarketPrices from './pages/MarketPrices';
import SellCrop from './pages/SellCrop';
import BuyerRequests from './pages/BuyerRequests';
import Orders from './pages/Orders';
import Earnings from './pages/Earnings';
import Transport from './pages/Transport';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import VerifyEmail from './pages/VerifyEmail';

// ── Route Guards ──────────────────────────────────────────────────────────────

/**
 * Requires the user to be logged in (any role).
 * Saves the intended destination so we can redirect back after login.
 */
const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};

/**
 * Requires a specific role AND authentication.
 * Wrong-role logged-in users are sent to their own home.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
    if (user.role === 'buyer')  return <Navigate to="/marketplace" replace />;
    if (user.role === 'admin')  return <Navigate to="/admin" replace />;
  }
  return children;
};

/**
 * Redirect already-logged-in users away from /login and /register.
 */
const GuestOnly = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
    if (user.role === 'buyer')  return <Navigate to="/marketplace" replace />;
    if (user.role === 'admin')  return <Navigate to="/admin" replace />;
  }
  return children;
};

// ── Routes ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* ── Truly public (no login needed) ── */}
      <Route path="/" element={<Home />} />
      <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* ── Requires login (any role) ── */}
      <Route path="/marketplace"   element={<RequireAuth><Marketplace /></RequireAuth>} />
      <Route path="/market-prices" element={<RequireAuth><MarketPrices /></RequireAuth>} />

      {/* ── Farmer-only ── */}
      <Route path="/farmer/dashboard"    element={<ProtectedRoute requiredRole="farmer"><FarmerDashboard /></ProtectedRoute>} />
      <Route path="/farmer/crops"        element={<ProtectedRoute requiredRole="farmer"><MyCrops /></ProtectedRoute>} />
      <Route path="/farmer/market-prices"element={<ProtectedRoute requiredRole="farmer"><MarketPrices /></ProtectedRoute>} />
      <Route path="/farmer/sell"         element={<ProtectedRoute requiredRole="farmer"><SellCrop /></ProtectedRoute>} />
      <Route path="/farmer/requests"     element={<ProtectedRoute requiredRole="farmer"><BuyerRequests /></ProtectedRoute>} />
      <Route path="/farmer/orders"       element={<ProtectedRoute requiredRole="farmer"><Orders /></ProtectedRoute>} />
      <Route path="/farmer/earnings"     element={<ProtectedRoute requiredRole="farmer"><Earnings /></ProtectedRoute>} />
      <Route path="/farmer/transport"    element={<ProtectedRoute requiredRole="farmer"><Transport /></ProtectedRoute>} />
      <Route path="/farmer/profile"      element={<ProtectedRoute requiredRole="farmer"><Profile /></ProtectedRoute>} />

      {/* ── Admin-only ── */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

      {/* ── Catch-all ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
