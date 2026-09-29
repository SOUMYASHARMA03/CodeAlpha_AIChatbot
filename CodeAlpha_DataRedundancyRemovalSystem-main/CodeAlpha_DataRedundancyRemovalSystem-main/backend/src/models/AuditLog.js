const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    submittedData: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      city: { type: String, default: '' },
      organization: { type: String, default: '' },
      category: { type: String, default: '' },
      description: { type: String, default: '' }
    },
    classification: {
      type: String,
      enum: ['UNIQUE', 'REDUNDANT_EXACT', 'REDUNDANT_SIMILAR', 'FALSE_POSITIVE', 'INVALID'],
      required: true,
      index: true
    },
    similarityScore: {
      type: Number,
      default: 0
    },
    action: {
      type: String,
      enum: ['INSERTED', 'REJECTED'],
      required: true,
      index: true
    },
    reason: {
      type: String,
      required: true
    },
    matchedRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Record',
      default: null
    },
    matchedRecordSummary: {
      name: String,
      email: String,
      phone: String,
      organization: String
    },
    fieldBreakdown: {
      nameScore: { type: Number, default: 0 },
      emailScore: { type: Number, default: 0 },
      phoneScore: { type: Number, default: 0 },
      orgScore: { type: Number, default: 0 },
      cityScore: { type: Number, default: 0 }
    },
    matchedFields: [String],
    differentFields: [String],
    dataHash: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
