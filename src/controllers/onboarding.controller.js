const User = require('../models/User.model');
const SMEProfile = require('../models/SMEProfile.model');

// 🔑 Generate KS1-style ID: KS1-ABCD
const generateSmeId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'KS1-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const createAccount = async (req, res) => {
  try {
    const { fullName, phone, wallet, password } = req.body;
    if (!fullName || !phone || !password) {
      return res.status(400).json({ message: 'Full name, phone, and password are required' });
    }
    const existing = await User.findOne({ phone });
    if (existing) return res.status(409).json({ message: 'Phone already registered' });
    const user = new User({ fullName, phone, wallet, password });
    await user.save();
    res.json({ success: true, userId: user._id.toString() });
  } catch (err) {
    console.error('Create Account Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createSMEProfile = async (req, res) => {
  try {
    const { userId, businessName, businessType, industry, country, city, address } = req.body;
    if (!userId || !businessName || !businessType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const smeId = generateSmeId();
    const profile = new SMEProfile({
      userId, smeId, businessName, businessType, industry, country, city, address
    });
    await profile.save();
    res.json({ success: true, smeId });
  } catch (err) {
    console.error('Create SME Profile Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const uploadDocument = async (req, res) => {
  try {
    // Simulate upload
    res.json({ success: true, documentUrl: 'https://example.com/id.jpg' });
  } catch (err) {
    console.error('Upload Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const submitOnboarding = async (req, res) => {
  try {
    const { smeId } = req.body;
    if (!smeId) return res.status(400).json({ message: 'smeId required' });
    const sme = await SMEProfile.findOne({ smeId });
    if (!sme) return res.status(404).json({ message: 'SME not found' });

    console.log('✅ ONBOARDING SUBMITTED – Forwarding to KS1 Verification System');
    console.log('SME ID:', smeId);
    console.log('Business:', sme.businessName);
    console.log('Status: PENDING_KYC_VERIFICATION');

    // Call KYC
    await fetch('https://ks1-verification-kyc-system-2.onrender.com/api/kyc/start-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        smeId,
        businessName: sme.businessName,
        ownerName: 'N/A',
        idType: 'Ghana Card',
        idNumber: 'GHA123456789',
        documentUrls: ['https://example.com/id.jpg'],
        city: sme.city
      })
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Submit Error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ EXPORT ALL FUNCTIONS CORRECTLY
module.exports = {
  createAccount,
  createSMEProfile,
  uploadDocument,
  submitOnboarding
};
