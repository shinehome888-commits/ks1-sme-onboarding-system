const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  smeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SMEProfile', required: true },
  documentType: { type: String, enum: ['NATIONAL_ID', 'BUSINESS_CERTIFICATE'], required: true },
  fileUrl: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
