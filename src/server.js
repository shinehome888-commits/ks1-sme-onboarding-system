const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();
require('./config/db');

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: ['https://ks1-alkebulan-pay.pages.dev', /\.pages\.dev$/],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root route – prevents "Not Found" and confirms service is live
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'KS1 SME Onboarding System',
    status: 'OK',
    message: 'Ready to register African SMEs',
    endpoints: {
      createAccount: 'POST /api/onboarding/create-account',
      verifyPhone: 'POST /api/onboarding/verify-phone',
      createSMEProfile: 'POST /api/onboarding/create-sme-profile',
      uploadDocument: 'POST /api/onboarding/upload-document',
      submitOnboarding: 'POST /api/onboarding/submit-onboarding'
    },
    docs: 'Visit https://ks1-alkebulan-pay.pages.dev to begin registration'
  });
});

// API routes
app.use('/api/onboarding', require('./routes/onboarding.routes'));

// Health check for Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'KS1 SME Onboarding',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[KS1 ONBOARDING] Running on port ${PORT}`);
});
