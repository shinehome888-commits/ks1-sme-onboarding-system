const express = require('express');
const router = express.Router();
const controller = require('../controllers/onboarding.controller');

// ✅ All routes use valid controller functions
router.post('/create-account', controller.createAccount);
router.post('/create-sme-profile', controller.createSMEProfile);
router.post('/upload-document', controller.uploadDocument);
router.post('/submit-onboarding', controller.submitOnboarding);

module.exports = router;
