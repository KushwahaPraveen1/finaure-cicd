const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register-phone', authController.registerPhone);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/login', authController.login);
router.post('/check',authController.check);
router.post('/subscribe-email',authController.subscribed);

module.exports = router;
