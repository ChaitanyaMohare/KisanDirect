const express = require('express');
const router = express.Router();
const { login, registerFarmer, registerBuyer } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/register/farmer', registerFarmer);
router.post('/register/buyer', registerBuyer);

module.exports = router;
