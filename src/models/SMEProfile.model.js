const mongoose = require('mongoose');

const SMEProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  industry: { type: String, required: true },
  country: { type: String, required: true, default: 'Ghana' },
  city: { type: String, required: true },
  address: { type: String, required: true },
  website: String,
  socialMedia: [String],
  status: { type: String, default: 'PENDING_KYC_VERIFICATION' }
}, { timestamps: true });

module.exports = mongoose.model('SMEProfile', SMEProfileSchema);
