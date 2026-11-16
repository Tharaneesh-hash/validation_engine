/**
 * Validation Rules Configuration & Syntactic Logic
 * Maps form fields to formal regular expressions, length constraints,
 * and first-invalid-character detection algorithms.
 */

export const FORM_VALIDATION_RULES = {
  fullName: {
    id: 'fullName',
    label: 'Full Name',
    type: 'text',
    placeholder: 'e.g. Alan Turing',
    required: true,
    minLength: 2,
    maxLength: 50,
    regexStr: '^[a-zA-Z]+(([ \'-][a-zA-Z ])?[a-zA-Z]*)*$',
    regex: /^[a-zA-Z]+(([ '-][a-zA-Z ])?[a-zA-Z]*)*$/,
    description: 'Letters, spaces, hyphens, and apostrophes only (2 to 50 characters).',
    syntacticNote: 'Validates alphabetical naming format; does not verify legal identity.'
  },
  email: {
    id: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'e.g. alan.turing@automata.edu',
    required: true,
    minLength: 5,
    maxLength: 100,
    regexStr: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    description: 'Standard RFC-compliant email structure (local-part@domain.tld).',
    syntacticNote: 'Performs syntactic structure validation; does not verify mailbox existence or SMTP handshake.'
  },
  mobile: {
    id: 'mobile',
    label: 'Mobile Number',
    type: 'tel',
    placeholder: 'e.g. 9876543210 (10 digits starting with 6-9)',
    required: true,
    minLength: 10,
    maxLength: 10,
    regexStr: '^[6-9][0-9]{9}$',
    regex: /^[6-9][0-9]{9}$/,
    description: '10-digit Indian standard mobile number starting with digits 6, 7, 8, or 9.',
    syntacticNote: 'Syntactically validates telecom numbering plan format; does not send SMS OTP.'
  },
  username: {
    id: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'e.g. turing_1912',
    required: true,
    minLength: 3,
    maxLength: 20,
    regexStr: '^[a-zA-Z0-9_-]{3,20}$',
    regex: /^[a-zA-Z0-9_-]{3,20}$/,
    description: '3 to 20 alphanumeric characters, underscores, and hyphens.',
    syntacticNote: 'Ensures safe string storage without special symbols.'
  },
  password: {
    id: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char',
    required: true,
    minLength: 8,
    maxLength: 64,
    regexStr: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,64}$',
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/,
    description: 'At least 8 chars containing uppercase, lowercase, digit, and special symbol (@$!%*?&).',
    syntacticNote: 'Evaluates entropy criteria locally; password value is never transmitted unhashed or logged in plaintext.'
  },
  confirmPassword: {
    id: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Re-enter your password',
    required: true,
    minLength: 8,
    maxLength: 64,
    description: 'Must strictly match the password entered above.',
    syntacticNote: 'String identity equality check.'
  },
  pincode: {
    id: 'pincode',
    label: 'PIN Code',
    type: 'text',
    placeholder: 'e.g. 560001 (6 digits, non-zero starting)',
    required: true,
    minLength: 6,
    maxLength: 6,
    regexStr: '^[1-9][0-9]{5}$',
    regex: /^[1-9][0-9]{5}$/,
    description: '6 numeric digits starting with digits 1-9 (Indian Postal Index Number).',
    syntacticNote: 'Syntactically confirms postal code layout.'
  },
  website: {
    id: 'website',
    label: 'Website URL',
    type: 'url',
    placeholder: 'e.g. https://automata-engine.org',
    required: false,
    minLength: 8,
    maxLength: 120,
    regexStr: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$',
    regex: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
    description: 'Fully qualified HTTP or HTTPS web address.',
    syntacticNote: 'Performs URI syntax validation; does not perform DNS resolution or send HTTP ping.'
  },
  dob: {
    id: 'dob',
    label: 'Date of Birth',
    type: 'date',
    placeholder: 'YYYY-MM-DD',
    required: true,
    regexStr: '^\\d{4}-\\d{2}-\\d{2}$',
    regex: /^\d{4}-\\d{2}-\\d{2}$/,
    description: 'ISO 8601 calendar format (YYYY-MM-DD), minimum age requirement 13 years.',
    syntacticNote: 'Syntactic and calendar boundary verification.'
  }
};

/**
 * Finds the index of the first character that violates character set constraints
 */
export function findFirstInvalidChar(value, fieldId) {
  if (!value) return { index: -1, char: null };

  if (fieldId === 'fullName') {
    for (let i = 0; i < value.length; i++) {
      if (!/^[a-zA-Z '-]$/.test(value[i])) {
        return { index: i, char: value[i] };
      }
    }
  }

  if (fieldId === 'mobile' || fieldId === 'pincode') {
    for (let i = 0; i < value.length; i++) {
      if (!/^[0-9]$/.test(value[i])) {
        return { index: i, char: value[i] };
      }
    }
    if (fieldId === 'mobile' && value.length > 0 && !/^[6-9]$/.test(value[0])) {
      return { index: 0, char: value[0], reason: 'Mobile number must begin with digits 6, 7, 8, or 9' };
    }
    if (fieldId === 'pincode' && value.length > 0 && value[0] === '0') {
      return { index: 0, char: '0', reason: 'PIN code cannot start with 0' };
    }
  }

  if (fieldId === 'username') {
    for (let i = 0; i < value.length; i++) {
      if (!/^[a-zA-Z0-9_-]$/.test(value[i])) {
        return { index: i, char: value[i] };
      }
    }
  }

  if (fieldId === 'email') {
    // Check characters before @
    const atIndex = value.indexOf('@');
    if (atIndex === -1 && value.includes(' ')) {
      return { index: value.indexOf(' '), char: ' ', reason: 'Spaces are not allowed in email addresses' };
    }
    for (let i = 0; i < value.length; i++) {
      if (!/^[a-zA-Z0-9._%+-@]$/.test(value[i])) {
        return { index: i, char: value[i] };
      }
    }
  }

  return { index: -1, char: null };
}

/**
 * Validates a single field value against the configured rule set
 */
export function validateFormField(fieldId, value, allValues = {}) {
  const rule = FORM_VALIDATION_RULES[fieldId];
  if (!rule) {
    return { isValid: true, error: null };
  }

  const strVal = (value || '').trim();

  // Check required
  if (rule.required && !strVal) {
    return {
      isValid: false,
      error: `${rule.label} is required.`,
      firstInvalidIndex: -1,
      firstInvalidChar: null
    };
  }

  // If optional and empty, it is valid
  if (!rule.required && !strVal) {
    return { isValid: true, error: null, firstInvalidIndex: -1, firstInvalidChar: null };
  }

  // Length checks
  if (rule.minLength && strVal.length < rule.minLength) {
    return {
      isValid: false,
      error: `${rule.label} must be at least ${rule.minLength} characters (current: ${strVal.length}).`,
      firstInvalidIndex: strVal.length,
      firstInvalidChar: null
    };
  }

  if (rule.maxLength && strVal.length > rule.maxLength) {
    return {
      isValid: false,
      error: `${rule.label} must not exceed ${rule.maxLength} characters (current: ${strVal.length}).`,
      firstInvalidIndex: rule.maxLength,
      firstInvalidChar: strVal[rule.maxLength]
    };
  }

  // Confirm password special check
  if (fieldId === 'confirmPassword') {
    if (strVal !== (allValues.password || '')) {
      return {
        isValid: false,
        error: 'Passwords do not match.',
        firstInvalidIndex: -1,
        firstInvalidChar: null
      };
    }
    return { isValid: true, error: null, firstInvalidIndex: -1, firstInvalidChar: null };
  }

  // Date of birth age check
  if (fieldId === 'dob') {
    const dobDate = new Date(strVal);
    if (isNaN(dobDate.getTime())) {
      return { isValid: false, error: 'Please enter a valid date in YYYY-MM-DD format.' };
    }
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (dobDate > today) {
      return { isValid: false, error: 'Date of birth cannot be in the future.' };
    }
    if (age < 13) {
      return { isValid: false, error: `Must be at least 13 years old (calculated age: ${age}).` };
    }
    if (age > 120) {
      return { isValid: false, error: 'Please enter a realistic date of birth.' };
    }
    return { isValid: true, error: null };
  }

  // Invalid character scanning
  const invalidCharCheck = findFirstInvalidChar(strVal, fieldId);
  if (invalidCharCheck.index !== -1) {
    const reasonMsg = invalidCharCheck.reason 
      ? invalidCharCheck.reason 
      : `Invalid character '${invalidCharCheck.char}' found at index ${invalidCharCheck.index}.`;
    return {
      isValid: false,
      error: reasonMsg,
      firstInvalidIndex: invalidCharCheck.index,
      firstInvalidChar: invalidCharCheck.char
    };
  }

  // Regular expression test
  if (rule.regex && !rule.regex.test(strVal)) {
    let specificMsg = `${rule.label} does not match required format.`;
    if (fieldId === 'password') {
      specificMsg = 'Password must include uppercase, lowercase, digit, and special character (@$!%*?&).';
    } else if (fieldId === 'email') {
      specificMsg = 'Invalid email structure (e.g. name@domain.com).';
    } else if (fieldId === 'mobile') {
      specificMsg = 'Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9.';
    } else if (fieldId === 'pincode') {
      specificMsg = 'PIN code must be exactly 6 numeric digits starting with 1-9.';
    } else if (fieldId === 'website') {
      specificMsg = 'Must be a valid URL starting with http:// or https://';
    }

    return {
      isValid: false,
      error: specificMsg,
      firstInvalidIndex: -1,
      firstInvalidChar: null
    };
  }

  return { isValid: true, error: null, firstInvalidIndex: -1, firstInvalidChar: null };
}
