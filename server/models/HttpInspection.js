import mongoose from 'mongoose';

// 1. HttpRequests Schema
const HttpRequestSchema = new mongoose.Schema({
  method: { type: String, required: true },
  url: { type: String, required: true },
  path: { type: String, required: true },
  headers: { type: Map, of: String, default: {} },
  clientIp: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: 'Unknown' },
  headerCount: { type: Number, default: 0 },
  validHeaderCount: { type: Number, default: 0 },
  invalidHeaderCount: { type: Number, default: 0 },
  hasSuspiciousHeaders: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// 2. HttpResponses Schema
const HttpResponseSchema = new mongoose.Schema({
  statusCode: { type: Number, required: true },
  statusMessage: { type: String, default: 'OK' },
  headers: { type: Map, of: String, default: {} },
  missingSecurityHeaders: [{ type: String }],
  isSecurelyConfigured: { type: Boolean, default: false },
  durationMs: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// 3. HeaderValidations Schema
const HeaderValidationSchema = new mongoose.Schema({
  headerName: { type: String, required: true },
  headerValue: { type: String, required: true },
  headerType: { type: String, enum: ['REQUEST', 'RESPONSE', 'CUSTOM'], default: 'REQUEST' },
  isValid: { type: Boolean, required: true },
  appliedRegex: { type: String, default: '' },
  validationErrors: [{
    field: String,
    message: String,
    suggestion: String
  }],
  warnings: [{
    header: String,
    message: String,
    suggestion: String
  }],
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true, suppressReservedKeysWarning: true });

// 4. CookieRecords Schema
const CookieRecordSchema = new mongoose.Schema({
  cookieName: { type: String, required: true },
  maskedValue: { type: String, default: '' },
  domain: { type: String, default: null },
  path: { type: String, default: '/' },
  secure: { type: Boolean, default: false },
  httpOnly: { type: Boolean, default: false },
  sameSite: { type: String, default: null },
  expires: { type: String, default: null },
  maxAge: { type: Number, default: null },
  isSessionCookie: { type: Boolean, default: false },
  isValid: { type: Boolean, required: true },
  securityWarnings: [{
    severity: String,
    message: String,
    suggestion: String
  }],
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// 5. SessionStates Schema (DFA Session Lifecycle)
const SessionStateSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  currentState: { 
    type: String, 
    enum: ['ISSUED', 'ACTIVE', 'EXPIRED', 'REVOKED'], 
    default: 'ISSUED', 
    required: true,
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  clientIp: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: 'Unknown' },
  domain: { type: String, default: 'localhost' },
  path: { type: String, default: '/' },
  transitionHistory: [{
    fromState: String,
    toState: String,
    event: String,
    timestamp: { type: Date, default: Date.now },
    reason: String,
    explanation: String,
    success: Boolean,
    actor: String
  }]
}, { timestamps: true });

// 6. SecurityWarnings Schema
const SecurityWarningSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['MISSING_SECURITY_HEADER', 'MALFORMED_HEADER', 'SUSPICIOUS_HEADER', 'INSECURE_COOKIE', 'ILLEGAL_DFA_TRANSITION', 'CRLF_INJECTION_ATTEMPT'], 
    required: true 
  },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  target: { type: String, required: true },
  details: { type: String, required: true },
  suggestion: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const HttpRequest = mongoose.models.HttpRequest || mongoose.model('HttpRequest', HttpRequestSchema);
export const HttpResponse = mongoose.models.HttpResponse || mongoose.model('HttpResponse', HttpResponseSchema);
export const HeaderValidation = mongoose.models.HeaderValidation || mongoose.model('HeaderValidation', HeaderValidationSchema);
export const CookieRecord = mongoose.models.CookieRecord || mongoose.model('CookieRecord', CookieRecordSchema);
export const SessionState = mongoose.models.SessionState || mongoose.model('SessionState', SessionStateSchema);
export const SecurityWarning = mongoose.models.SecurityWarning || mongoose.model('SecurityWarning', SecurityWarningSchema);
