const express = require('express');
const router = express.Router();
const controller = require('../controllers/onboarding.controller');

router.post('/create-account', controller.createAccount);
router.post('/create-sme-profile', controller.createSMEProfile);
router.post('/upload-document', controller.uploadDocument);
router.post('/submit-onboarding', controller.submitOnboarding);
router.get('/stats', controller.getStats); // 👈 STATS ENDPOINT

module.exports = router;
