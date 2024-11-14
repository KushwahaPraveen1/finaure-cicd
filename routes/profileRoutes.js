    const express = require('express');
    const router = express.Router();
    const profileController = require('../controllers/profileController');

    router.post('/set-profile', profileController.setProfile);
    router.post('/set-pin', profileController.setPin);

    module.exports = router;