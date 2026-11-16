/**
 * Server-Side Form Validation Controller
 * Re-validates all incoming form submissions on the backend and logs audit history to MongoDB.
 * Never stores passwords or plaintext sensitive strings.
 */

import ValidationHistory from '../models/ValidationHistory.js';
import { inMemoryHistory } from './historyController.js';
import mongoose from 'mongoose';

const SERVER_RULES = {
  fullName: {
    label: 'Full Name',
    required: true,
    minLength: 2,
    maxLength: 50,
    regex: /^[a-zA-Z]+(([ '-][a-zA-Z ])?[a-zA-Z]*)*$/,
    error: 'Full name must contain only letters, spaces, hyphens, and apostrophes (2-50 chars).'
  },
  email: {
    label: 'Email Address',
    required: true,
    minLength: 5,
    maxLength: 100,
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    error: 'Email address must follow the syntactic standard: local-part@domain.tld'
  },
  mobile: {
    label: 'Mobile Number',
    required: true,
    minLength: 10,
    maxLength: 10,
    regex: /^[6-9][0-9]{9}$/,
    error: 'Mobile number must be a 10-digit number starting with 6, 7, 8, or 9.'
  },
  username: {
    label: 'Username',
    required: true,
    minLength: 3,
    maxLength: 20,
    regex: /^[a-zA-Z0-9_-]{3,20}$/,
    error: 'Username must be 3-20 characters consisting of letters, numbers, underscores, and hyphens.'
  },
  password: {
    label: 'Password',
    required: true,
    minLength: 8,
    maxLength: 64,
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/,
    error: 'Password must have at least 8 chars with 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol.'
  },
  pincode: {
    label: 'PIN Code',
    required: true,
    minLength: 6,
    maxLength: 6,
    regex: /^[1-9][0-9]{5}$/,
    error: 'PIN code must be a 6-digit number starting with digits 1-9.'
  },
  website: {
    label: 'Website URL',
    required: false,
    minLength: 8,
    maxLength: 120,
    regex: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
    error: 'Website must be a valid HTTP or HTTPS URL.'
  },
  dob: {
    label: 'Date of Birth',
    required: true,
    regex: /^\d{4}-\d{2}-\d{2}$/,
    error: 'Date of birth must be in YYYY-MM-DD format.'
  }
};

export const validateForm = async (req, res) => {
  const startTime = performance.now();
  const formData = req.body || {};
  const errors = {};
  const firstInvalidIndices = {};
  const auditRecords = [];

  // 1. Validate each declared field
  for (const [fieldId, rule] of Object.entries(SERVER_RULES)) {
    const rawVal = formData[fieldId];
    const val = typeof rawVal === 'string' ? rawVal.trim() : '';
    let isFieldValid = true;
    let errorCategory = 'NONE';
    let errorMessage = null;

    // Check required
    if (rule.required && !val) {
      isFieldValid = false;
      errorCategory = 'LENGTH_VIOLATION';
      errorMessage = `${rule.label} is required.`;
      errors[fieldId] = errorMessage;
    } else if (!rule.required && !val) {
      // Optional empty is valid
      isFieldValid = true;
    } else if (rule.minLength && val.length < rule.minLength) {
      isFieldValid = false;
      errorCategory = 'LENGTH_VIOLATION';
      errorMessage = `${rule.label} must be at least ${rule.minLength} characters.`;
      errors[fieldId] = errorMessage;
      firstInvalidIndices[fieldId] = val.length;
    } else if (rule.maxLength && val.length > rule.maxLength) {
      isFieldValid = false;
      errorCategory = 'LENGTH_VIOLATION';
      errorMessage = `${rule.label} must not exceed ${rule.maxLength} characters.`;
      errors[fieldId] = errorMessage;
      firstInvalidIndices[fieldId] = rule.maxLength;
    } else if (rule.regex && !rule.regex.test(val)) {
      isFieldValid = false;
      errorCategory = 'PATTERN_MISMATCH';
      errorMessage = rule.error;
      errors[fieldId] = errorMessage;
      for (let i = 0; i < val.length; i++) {
        if (!rule.regex.test(val.slice(0, i + 1)) && !firstInvalidIndices[fieldId]) {
          firstInvalidIndices[fieldId] = i;
        }
      }
    }

    // Build audit record without storing sensitive value
    auditRecords.push({
      fieldId,
      ruleName: rule.label,
      isValid: isFieldValid,
      algorithm: 'DFA Deterministic Engine',
      executionTimeMs: 0.1,
      errorCategory,
      errorMessage,
      inputLength: val.length,
      clientIp: req.ip || '127.0.0.1',
      createdAt: new Date()
    });
  }

  // 2. Validate Password Match
  if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
    auditRecords.push({
      fieldId: 'confirmPassword',
      ruleName: 'Confirm Password Match',
      isValid: false,
      algorithm: 'Identity Check',
      executionTimeMs: 0.05,
      errorCategory: 'PATTERN_MISMATCH',
      errorMessage: 'Passwords do not match.',
      inputLength: (formData.confirmPassword || '').length,
      clientIp: req.ip || '127.0.0.1',
      createdAt: new Date()
    });
  }

  // 3. Validate Age from DOB
  if (formData.dob && !errors.dob) {
    const dobDate = new Date(formData.dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 13) {
      errors.dob = `Age must be at least 13 years (calculated: ${age} years).`;
      const dobRec = auditRecords.find(r => r.fieldId === 'dob');
      if (dobRec) {
        dobRec.isValid = false;
        dobRec.errorCategory = 'AGE_VIOLATION';
        dobRec.errorMessage = errors.dob;
      }
    }
  }

  const durationMs = parseFloat((performance.now() - startTime).toFixed(3));
  const isValid = Object.keys(errors).length === 0;

  // Persist audit records to MongoDB asynchronously
  try {
    if (mongoose.connection.readyState === 1) {
      ValidationHistory.insertMany(auditRecords).catch(e => console.warn('Failed to insert history:', e.message));
    } else {
      inMemoryHistory.unshift(...auditRecords);
      if (inMemoryHistory.length > 500) inMemoryHistory.length = 500;
    }
  } catch (err) {
    console.warn('History storage error:', err.message);
  }

  return res.status(isValid ? 200 : 422).json({
    success: true,
    isValid,
    message: isValid 
      ? 'All form inputs strictly satisfied server-side syntactic grammars.' 
      : 'Form validation failed against server-side regular expressions.',
    errors,
    firstInvalidIndices,
    metadata: {
      executionTimeMs: durationMs,
      timestamp: new Date().toISOString(),
      validationEngine: 'Server-Side Regular Expression Deterministic Engine',
      algorithm: 'ECMA RegExp Linear/NFA Engine'
    }
  });
};
