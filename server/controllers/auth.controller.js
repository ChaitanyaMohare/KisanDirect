// Auth Controller — handles HTTP request/response only
const authService   = require('../services/auth.service');
const emailService  = require('../services/email.service');

const login = async (req, res, next) => {
  try {
    const { mobile, password, role } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ success: false, message: 'Mobile and password are required' });
    }
    let result;
    if (role === 'buyer') {
      result = await authService.loginBuyer(mobile, password);
    } else if (role === 'admin') {
      result = await authService.loginAdmin(mobile, password);
    } else {
      result = await authService.loginFarmer(mobile, password);
    }
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const registerFarmer = async (req, res, next) => {
  try {
    const { name, mobile, password, village, district, state, preferredLanguage, mainCrop, email } = req.body;
    if (!name || !mobile || !password) {
      return res.status(400).json({ success: false, message: 'Name, mobile, and password are required' });
    }
    const result = await authService.registerFarmer({ name, mobile, password, village, district, state, preferredLanguage, mainCrop, email });

    // Send welcome email — non-blocking (never fail registration if email fails)
    if (email) {
      emailService.sendFarmerWelcome({
        to: email, name, village, district, state,
        mainCrop, mobile, preferredLanguage,
      }).catch(err => console.error('[Email] Welcome farmer failed:', err.message));
    }

    res.status(201).json({ success: true, message: 'Farmer registered successfully', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const registerBuyer = async (req, res, next) => {
  try {
    const { name, companyName, mobile, email, businessType, location } = req.body;
    if (!name || !mobile) {
      return res.status(400).json({ success: false, message: 'Name and mobile are required' });
    }
    const result = await authService.registerBuyer({ name, companyName, mobile, email, businessType, location });

    // Send welcome email if email address provided
    if (email) {
      emailService.sendBuyerWelcome({ to: email, name, companyName, businessType })
        .catch(err => console.error('[Email] Welcome buyer failed:', err.message));
    }

    res.status(201).json({ success: true, message: 'Buyer registered successfully', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

module.exports = { login, registerFarmer, registerBuyer };
