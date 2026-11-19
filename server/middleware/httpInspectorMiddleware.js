import { validateHttpHeader, validateCookieString } from '../algorithms/headerRegexRules.js';
import { HttpRequest, HttpResponse, HeaderValidation, CookieRecord, SecurityWarning } from '../models/HttpInspection.js';
import mongoose from 'mongoose';

// High-performance in-memory ring-buffers for zero-downtime offline fallback
export const inMemoryHttpData = {
  requests: [],
  responses: [],
  headerValidations: [],
  cookies: [],
  warnings: []
};

const MAX_STORED = 100;

export function addInMemory(list, item) {
  list.unshift(item);
  if (list.length > MAX_STORED) {
    list.pop();
  }
}

const REQUIRED_SECURITY_HEADERS = [
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Strict-Transport-Security',
  'Content-Security-Policy'
];

/**
 * Live HTTP Request and Response Header Inspector Middleware
 */
export const httpInspectorMiddleware = (req, res, next) => {
  const start = performance.now();

  // Capture incoming request headers
  const rawHeaders = { ...req.headers };
  const headerKeys = Object.keys(rawHeaders);
  let validHeaders = 0;
  let invalidHeaders = 0;
  let hasSuspicious = false;

  const headerResults = [];

  for (const key of headerKeys) {
    const val = String(rawHeaders[key]);
    const validation = validateHttpHeader(key, val);

    if (validation.isValid) {
      validHeaders++;
    } else {
      invalidHeaders++;
    }

    if (validation.warnings.length > 0) {
      hasSuspicious = true;
      for (const w of validation.warnings) {
        const warningRecord = {
          type: 'SUSPICIOUS_HEADER',
          severity: 'MEDIUM',
          target: `${key}: ${val}`,
          details: w.message,
          suggestion: w.suggestion,
          timestamp: new Date()
        };
        addInMemory(inMemoryHttpData.warnings, warningRecord);
        if (mongoose.connection.readyState === 1) {
          SecurityWarning.create(warningRecord).catch(() => {});
        }
      }
    }

    for (const err of validation.errors) {
      const warningRecord = {
        type: 'MALFORMED_HEADER',
        severity: 'HIGH',
        target: `${key}: ${val}`,
        details: err.message,
        suggestion: err.suggestion,
        timestamp: new Date()
      };
      addInMemory(inMemoryHttpData.warnings, warningRecord);
      if (mongoose.connection.readyState === 1) {
        SecurityWarning.create(warningRecord).catch(() => {});
      }
    }

    const headerRec = {
      headerName: key,
      headerValue: val,
      headerType: 'REQUEST',
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      timestamp: new Date()
    };
    headerResults.push(headerRec);
    addInMemory(inMemoryHttpData.headerValidations, headerRec);
  }

  // Parse Cookie header if present
  if (rawHeaders.cookie) {
    const cookieTokens = String(rawHeaders.cookie).split(';');
    for (const token of cookieTokens) {
      const cookieRes = validateCookieString(token.trim(), false);
      const cookieRec = {
        cookieName: cookieRes.name,
        maskedValue: cookieRes.value,
        isValid: cookieRes.isValid,
        isSessionCookie: cookieRes.isSessionCookie,
        securityWarnings: cookieRes.warnings,
        timestamp: new Date()
      };
      addInMemory(inMemoryHttpData.cookies, cookieRec);
      if (mongoose.connection.readyState === 1) {
        CookieRecord.create(cookieRec).catch(() => {});
      }
    }
  }

  const reqRecord = {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    headers: rawHeaders,
    clientIp: req.ip || req.socket?.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown',
    headerCount: headerKeys.length,
    validHeaderCount: validHeaders,
    invalidHeaderCount: invalidHeaders,
    hasSuspiciousHeaders: hasSuspicious,
    timestamp: new Date()
  };

  addInMemory(inMemoryHttpData.requests, reqRecord);
  if (mongoose.connection.readyState === 1) {
    HttpRequest.create(reqRecord).catch(() => {});
  }

  // Intercept response headers upon completion
  res.on('finish', () => {
    const duration = performance.now() - start;
    const responseHeaders = res.getHeaders ? res.getHeaders() : {};
    const resHeaderKeys = Object.keys(responseHeaders).map(k => k.toLowerCase());

    const missingSecurity = [];
    for (const reqSec of REQUIRED_SECURITY_HEADERS) {
      if (!resHeaderKeys.includes(reqSec.toLowerCase())) {
        missingSecurity.push(reqSec);
        const warningRecord = {
          type: 'MISSING_SECURITY_HEADER',
          severity: 'MEDIUM',
          target: reqSec,
          details: `Response to ${req.method} ${req.originalUrl} lacks the essential security header ${reqSec}.`,
          suggestion: `Add standard header: ${reqSec}.`,
          timestamp: new Date()
        };
        addInMemory(inMemoryHttpData.warnings, warningRecord);
        if (mongoose.connection.readyState === 1) {
          SecurityWarning.create(warningRecord).catch(() => {});
        }
      }
    }

    const resRecord = {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage || 'OK',
      headers: responseHeaders,
      missingSecurityHeaders: missingSecurity,
      isSecurelyConfigured: missingSecurity.length === 0,
      durationMs: parseFloat(duration.toFixed(2)),
      timestamp: new Date()
    };

    addInMemory(inMemoryHttpData.responses, resRecord);
    if (mongoose.connection.readyState === 1) {
      HttpResponse.create(resRecord).catch(() => {});
    }
  });

  next();
};
