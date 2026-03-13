const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const SMEProfile = require('../models/SMEProfile.model');
const Document = require('../models/Document.model');
const { sendOTP } = require('../services/otp.service');
const { producer } = require('../config/kafka');

// STEP 1
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

// STEP 1B
const verifyPhone = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    // In real app: validate OTP against stored hash
    await User.updateOne({ phone }, { isPhoneVerified: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// STEP 2 + 3
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

    // Owner identity is stored within profile for simplicity
    // In production, use separate OwnerIdentity model if needed

    res.status(201).json({ success: true, smeId: profile._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// STEP 3B
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

// VIEW
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

    // Update status
    profile.status = 'PENDING_KYC_VERIFICATION';
    await profile.save();

    // 🔥 EVENT DRIVEN: Send to other services via Kafka
    await producer.send({
      topic: 'ks1.onboarding.submitted',
      messages: [{ value: JSON.stringify({ smeId: profile._id, ...profile.toObject() }) }]
    });

    res.json({ success: true, message: 'Onboarding submitted. Awaiting verification.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAccount,
  verifyPhone,
  createSMEProfile,
  uploadDocument,
  getSMEProfile,
  submitOnboarding
};
