import ValidationRule from '../models/ValidationRule.js';
import mongoose from 'mongoose';

const DEFAULT_RULES = [
  {
    fieldId: 'fullName',
    label: 'Full Name',
    pattern: "^[a-zA-Z]+(([ '-][a-zA-Z ])?[a-zA-Z]*)*$",
    description: 'Letters, spaces, hyphens, and apostrophes only (2 to 50 characters).',
    required: true,
    minLength: 2,
    maxLength: 50
  },
  {
    fieldId: 'email',
    label: 'Email Address',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'RFC-compliant standard email structure (local-part@domain.tld).',
    required: true,
    minLength: 5,
    maxLength: 100
  },
  {
    fieldId: 'mobile',
    label: 'Mobile Number',
    pattern: '^[6-9][0-9]{9}$',
    description: '10-digit Indian standard mobile number starting with 6, 7, 8, or 9.',
    required: true,
    minLength: 10,
    maxLength: 10
  },
  {
    fieldId: 'username',
    label: 'Username',
    pattern: '^[a-zA-Z0-9_-]{3,20}$',
    description: '3 to 20 alphanumeric characters, underscores, and hyphens.',
    required: true,
    minLength: 3,
    maxLength: 20
  },
  {
    fieldId: 'password',
    label: 'Password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,64}$',
    description: 'At least 8 chars with uppercase, lowercase, digit, and special symbol.',
    required: true,
    minLength: 8,
    maxLength: 64
  },
  {
    fieldId: 'confirmPassword',
    label: 'Confirm Password',
    pattern: '.*',
    description: 'Must match password exactly.',
    required: true,
    minLength: 8,
    maxLength: 64
  },
  {
    fieldId: 'pincode',
    label: 'PIN Code',
    pattern: '^[1-9][0-9]{5}$',
    description: '6 numeric digits starting with 1-9.',
    required: true,
    minLength: 6,
    maxLength: 6
  },
  {
    fieldId: 'website',
    label: 'Website URL',
    pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$',
    description: 'Valid HTTP/HTTPS web address.',
    required: false,
    minLength: 8,
    maxLength: 120
  },
  {
    fieldId: 'dob',
    label: 'Date of Birth',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    description: 'YYYY-MM-DD calendar format, age >= 13 years.',
    required: true,
    minLength: 10,
    maxLength: 10
  }
];

export const getRules = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let rules = await ValidationRule.find({}).lean();
      if (rules.length === 0) {
        // Seed default rules
        await ValidationRule.insertMany(DEFAULT_RULES);
        rules = await ValidationRule.find({}).lean();
      }
      return res.status(200).json({
        success: true,
        count: rules.length,
        data: rules
      });
    } else {
      return res.status(200).json({
        success: true,
        count: DEFAULT_RULES.length,
        data: DEFAULT_RULES
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch validation rules: ${err.message}`
    });
  }
};

export const createRule = async (req, res) => {
  try {
    const { fieldId, label, pattern, description, required = true, minLength = 0, maxLength } = req.body;

    if (!fieldId || !label || !pattern) {
      return res.status(400).json({
        success: false,
        message: 'fieldId, label, and pattern are compulsory fields.'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const existing = await ValidationRule.findOne({ fieldId });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Rule for field '${fieldId}' already exists.`
        });
      }

      const newRule = await ValidationRule.create({
        fieldId,
        label,
        pattern,
        description,
        required,
        minLength,
        maxLength
      });

      return res.status(201).json({
        success: true,
        data: newRule
      });
    } else {
      const newRule = { fieldId, label, pattern, description, required, minLength, maxLength };
      DEFAULT_RULES.push(newRule);
      return res.status(201).json({
        success: true,
        data: newRule
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to create rule: ${err.message}`
    });
  }
};
