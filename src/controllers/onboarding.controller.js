const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const SMEProfile = require('../models/SMEProfile.model');
const Document = require('../models/Document.model');
const { sendOTP } = require('../services/otp.service');

const createAccount = async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ phone, email, passwordHash: hashedPassword });
    await user.save();
    res.status(201).json({ success: true, userId: user._id });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Phone already registered' });
    res.status(500).json({ message: err.message });
  }
};

const verifyPhone = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    await User.updateOne({ phone }, { isPhoneVerified: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createSMEProfile = async (req, res) => {
  try {
    const { userId, businessName, businessType, industry, city, address, ownerName, idType, idNumber } = req.body;
    const profile = new SMEProfile({
      userId,
      businessName,
      businessType,
      industry,
      city,
      address,
      country: 'Ghana'
    });
    await profile.save();
    res.status(201).json({ success: true, smeId: profile._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const { smeId, documentType } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;
    const doc = new Document({ smeId, documentType, fileUrl });
    await doc.save();
    res.json({ success: true, documentId: doc._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSMEProfile = async (req, res) => {
  try {
    const profile = await SMEProfile.findById(req.params.id)
      .populate('userId', 'phone email')
      .lean();
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// STEP 4 – Final Submission
const submitOnboarding = async (req, res) => {
  try {
    const { smeId } = req.body;
    const profile = await SMEProfile.findById(smeId);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // Update status to pending verification
    profile.status = 'PENDING_KYC_VERIFICATION';
    await profile.save();

    // 🔥 TEMPORARY: Replace Kafka with console log for MVP
    console.log('✅ ONBOARDING SUBMITTED – Forwarding to KS1 Verification System');
    console.log('SME ID:', profile._id);
    console.log('Business:', profile.businessName);
    console.log('Status:', profile.status);

    res.json({ 
      success: true, 
      message: 'Onboarding submitted successfully. Awaiting KYC verification.',
      smeId: profile._id,
      status: profile.status
    });
  } catch (err) {
    console.error('❌ Onboarding submission failed:', err.message);
    res.status(500).json({ message: 'Failed to submit onboarding. Please try again.' });
  }
};

// ✅ CRITICAL: Export ALL functions — including uploadDocument
module.exports = {
  createAccount,
  verifyPhone,
  createSMEProfile,
  uploadDocument,
  getSMEProfile,
  submitOnboarding
};
