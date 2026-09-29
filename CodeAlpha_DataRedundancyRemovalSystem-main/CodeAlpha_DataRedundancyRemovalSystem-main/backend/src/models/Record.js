const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    city: {
      type: String,
      trim: true,
      default: 'N/A'
    },
    organization: {
      type: String,
      trim: true,
      default: 'Independent'
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    // Normalization & Hash fields for O(1) indexed cloud lookup
    dataHash: {
      type: String,
      required: true,
      index: true
    },
    contactHash: {
      type: String,
      index: true
    },
    normalizedName: {
      type: String,
      required: true,
      index: true
    },
    normalizedEmail: {
      type: String,
      required: true,
      index: true
    },
    normalizedPhone: {
      type: String,
      required: true,
      index: true
    },
    // Verification Metadata
    validationStatus: {
      type: String,
      enum: ['UNIQUE', 'FALSE_POSITIVE'],
      default: 'UNIQUE'
    },
    similarityScore: {
      type: Number,
      default: 0
    },
    verificationNotes: {
      type: String,
      default: 'Verified unique record'
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimal lookup efficiency
RecordSchema.index({ normalizedEmail: 1, normalizedPhone: 1 });
RecordSchema.index({ normalizedName: 1, normalizedEmail: 1 });

module.exports = mongoose.model('Record', RecordSchema);
