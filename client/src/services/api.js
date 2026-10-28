import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kisan_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kisan_token');
      localStorage.removeItem('kisan_user');
    }
    return Promise.reject(err);
  }
);

// Market Prices
export const getMarketPrices = (params) => api.get('/market-prices', { params });
export const getMarketPricesByCrop = (crop) => api.get(`/market-prices/${crop}`);

// Crops
export const getCrops = (params) => api.get('/crops', { params });
export const getFarmerCrops = (farmerId) => api.get(`/crops/farmer/${farmerId}`);
export const getCrop = (id) => api.get(`/crops/${id}`);
export const createCrop = (data) => api.post('/crops', data);
export const updateCrop = (id, data) => api.put(`/crops/${id}`, data);
export const deleteCrop = (id) => api.delete(`/crops/${id}`);

// Buyers
export const getBuyers = () => api.get('/buyers');
export const getBuyer = (id) => api.get(`/buyers/${id}`);

// Requests
export const getRequests = (params) => api.get('/requests', { params });
export const getRequest = (id) => api.get(`/requests/${id}`);
export const createRequest = (data) => api.post('/requests', data);
export const updateRequest = (id, data) => api.put(`/requests/${id}`, data);

// Orders
export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);

// Transport
export const getTransport = (params) => api.get('/transport', { params });

// Notifications
export const getNotifications = (userId) => api.get('/notifications', { params: { userId } });
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

// Earnings
export const getEarnings = (farmerId) => api.get(`/earnings/${farmerId}`);

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminFarmers = () => api.get('/admin/farmers');
export const getAdminBuyers = () => api.get('/admin/buyers');
export const getAdminListings = () => api.get('/admin/listings');
export const getAdminTransactions = () => api.get('/admin/transactions');
export const verifyFarmer = (id) => api.put(`/admin/farmers/${id}/verify`);
export const verifyBuyer = (id) => api.put(`/admin/buyers/${id}/verify`);

// Reports
export const submitReport = (data) => api.post('/reports', data);

// Alerts
export const getAlerts = (farmerId) => api.get('/alerts', { params: { farmerId } });
export const createAlert = (data) => api.post('/alerts', data);
export const deleteAlert = (id) => api.delete(`/alerts/${id}`);

// Mandi Prices (live APMC data via server proxy)
export const getMandiPrices = (params) => api.get('/mandi-prices', { params });
export const getMandiMeta = () => api.get('/mandi-prices/meta');

// Email — trigger transactional emails via backend
export const sendTestEmail           = (to) => api.post('/email/test', { to });
export const sendWelcomeFarmerEmail  = (data) => api.post('/email/welcome-farmer', data);
export const sendWelcomeBuyerEmail   = (data) => api.post('/email/welcome-buyer', data);
export const sendBuyerRequestEmail   = (data) => api.post('/email/buyer-request', data);
export const sendOrderUpdateEmail    = (data) => api.post('/email/order-update', data);
export const sendPriceAlertEmail     = (data) => api.post('/email/price-alert', data);
export const sendOTPEmail            = (data) => api.post('/email/otp', data);

// OTP — send and verify email OTP
export const sendOTP   = (email, name) => api.post('/otp/send',   { email, name });
export const verifyOTP = (email, otp)  => api.post('/otp/verify', { email, otp });

export default api;
