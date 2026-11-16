import mongoose from 'mongoose';

/**
 * Validation History Mongoose Schema
 * Stores validation metadata without sensitive payload content.
 * Follows security & privacy guidelines.
 */
const ValidationHistorySchema = new mongoose.Schema(
  {
    fieldId: {
      type: String,
      required: true,
      index: true
    },
    ruleName: {
      type: String,
      required: true
    },
    isValid: {
      type: Boolean,
      required: true,
      index: true
    },
    algorithm: {
      type: String,
      default: 'DFA Deterministic Engine'
    },
    executionTimeMs: {
      type: Number,
      required: true
    },
    errorCategory: {
      type: String,
      enum: ['NONE', 'SYNTAX_ERROR', 'LENGTH_VIOLATION', 'CHARACTER_SET_ERROR', 'PATTERN_MISMATCH', 'AGE_VIOLATION', 'UNKNOWN'],
      default: 'NONE'
    },
    errorMessage: {
      type: String,
      default: null
    },
    inputLength: {
      type: Number,
      default: 0
    },
    clientIp: {
      type: String,
      default: '127.0.0.1'
    }
  },
  {
    timestamps: true
  }
);

// Compound index for analytics range queries
ValidationHistorySchema.index({ createdAt: -1, isValid: 1 });

const ValidationHistory = mongoose.model('ValidationHistory', ValidationHistorySchema);

export default ValidationHistory;
