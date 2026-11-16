import mongoose from 'mongoose';

const ValidationRuleSchema = new mongoose.Schema(
  {
    fieldId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    label: {
      type: String,
      required: true
    },
    pattern: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    required: {
      type: Boolean,
      default: true
    },
    minLength: {
      type: Number,
      default: 0
    },
    maxLength: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

const ValidationRule = mongoose.model('ValidationRule', ValidationRuleSchema);

export default ValidationRule;
