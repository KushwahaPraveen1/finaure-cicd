const express = require('express');
const router = express.Router();
const phoneController = require('../controllers/phoneController');
const verifyToken = require('../middlewares/phoneMiddleware')

// Registration and authentication
router.post('/register', verifyToken, phoneController.register);

// Profile and PIN managementx  
router.post('/set-profile', verifyToken, phoneController.setProfile);
router.post('/set-pin', verifyToken, phoneController.setPin);

// Login
router.post('/login',  phoneController.login);

// Check user existence
router.post('/check', phoneController.check);

module.exports = router;
