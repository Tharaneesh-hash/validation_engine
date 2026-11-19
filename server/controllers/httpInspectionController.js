import crypto from 'crypto';
import mongoose from 'mongoose';
import { validateHttpHeader, validateCookieString, HTTP_HEADER_RULES, COOKIE_RULES } from '../algorithms/headerRegexRules.js';
import { SessionCookieDFA, SESSION_STATES } from '../algorithms/sessionCookieDFA.js';
import { 
  HttpRequest, 
  HttpResponse, 
  HeaderValidation, 
  CookieRecord, 
  SessionState, 
  SecurityWarning 
} from '../models/HttpInspection.js';
import { inMemoryHttpData, addInMemory } from '../middleware/httpInspectorMiddleware.js';

// In-memory sessions map for active DFA lifecycle tracking
export const activeSessionsDFA = new Map();

/**
 * Helper to get or reconstitute a session DFA
 */
async function getSessionInstance(sessionId) {
  if (activeSessionsDFA.has(sessionId)) {
    return activeSessionsDFA.get(sessionId);
  }

  // Check MongoDB
  if (mongoose.connection.readyState === 1) {
    const doc = await SessionState.findOne({ sessionId });
    if (doc) {
      const dfa = new SessionCookieDFA(doc.sessionId, {
        expiresAt: doc.expiresAt,
        clientIp: doc.clientIp,
        userAgent: doc.userAgent,
        domain: doc.domain,
        path: doc.path
      });
      dfa.currentState = doc.currentState;
      dfa.createdAt = doc.createdAt;
      dfa.updatedAt = doc.updatedAt;
      dfa.transitionHistory = doc.transitionHistory || [];
      activeSessionsDFA.set(sessionId, dfa);
      return dfa;
    }
  }

  return null;
}

/**
 * Persist DFA state to DB or memory
 */
async function persistSessionState(dfa) {
  activeSessionsDFA.set(dfa.sessionId, dfa);

  if (mongoose.connection.readyState === 1) {
    await SessionState.findOneAndUpdate(
      { sessionId: dfa.sessionId },
      {
        sessionId: dfa.sessionId,
        currentState: dfa.currentState,
        createdAt: dfa.createdAt,
        updatedAt: dfa.updatedAt,
        expiresAt: dfa.expiresAt,
        clientIp: dfa.metadata.clientIp,
        userAgent: dfa.metadata.userAgent,
        domain: dfa.metadata.domain,
        path: dfa.metadata.path,
        transitionHistory: dfa.transitionHistory
      },
      { upsert: true, new: true }
    );
  }
}

// -------------------------------------------------------------
// MODULE 1 & 2: HTTP Request & Response Inspection Controllers
// -------------------------------------------------------------

export const inspectRequestHeaders = async (req, res) => {
  try {
    const { headers = {}, method = 'GET', url = '/' } = req.body;
    const headerKeys = Object.keys(headers);
    const validations = [];

    let validCount = 0;
    let invalidCount = 0;

    for (const key of headerKeys) {
      const val = String(headers[key]);
      const result = validateHttpHeader(key, val);
      validations.push(result);

      if (result.isValid) validCount++;
      else invalidCount++;

      // Log validation result
      const headerDoc = {
        headerName: key,
        headerValue: val,
        headerType: 'REQUEST',
        isValid: result.isValid,
        appliedRegex: (HTTP_HEADER_RULES[key]?.regex || HTTP_HEADER_RULES.headerName.regex).toString(),
        errors: result.errors,
        warnings: result.warnings,
        timestamp: new Date()
      };

      addInMemory(inMemoryHttpData.headerValidations, headerDoc);
      if (mongoose.connection.readyState === 1) {
        HeaderValidation.create(headerDoc).catch(() => {});
      }
    }

    // Required headers presence check
    const missingStandardHeaders = [];
    const recommended = ['Host', 'User-Agent', 'Accept'];
    const lowerKeys = headerKeys.map(k => k.toLowerCase());
    for (const rec of recommended) {
      if (!lowerKeys.includes(rec.toLowerCase())) {
        missingStandardHeaders.push(rec);
      }
    }

    res.json({
      success: true,
      data: {
        method,
        url,
        totalHeaders: headerKeys.length,
        validCount,
        invalidCount,
        missingStandardHeaders,
        validations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const inspectResponseHeaders = async (req, res) => {
  try {
    const { headers = {}, statusCode = 200 } = req.body;
    const headerKeys = Object.keys(headers);
    const validations = [];

    let validCount = 0;
    let invalidCount = 0;

    for (const key of headerKeys) {
      const val = String(headers[key]);
      const result = validateHttpHeader(key, val);
      validations.push(result);

      if (result.isValid) validCount++;
      else invalidCount++;
    }

    // Identify missing security headers
    const missingSecurityHeaders = [];
    const lowerKeys = headerKeys.map(k => k.toLowerCase());
    const requiredSecurity = [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Content-Security-Policy'
    ];

    for (const sec of requiredSecurity) {
      if (!lowerKeys.includes(sec.toLowerCase())) {
        missingSecurityHeaders.push({
          header: sec,
          risk: 'Response is missing recommended security hardening header.',
          recommendation: HTTP_HEADER_RULES[sec]?.suggestion || `Add "${sec}" header to backend responses.`
        });
      }
    }

    res.json({
      success: true,
      data: {
        statusCode,
        totalHeaders: headerKeys.length,
        validCount,
        invalidCount,
        missingSecurityHeaders,
        isSecure: missingSecurityHeaders.length === 0 && invalidCount === 0,
        validations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// -------------------------------------------------------------
// MODULE 3 & 4: Header & Cookie Regex Validation
// -------------------------------------------------------------

export const validateHeaderFormat = async (req, res) => {
  try {
    const { name, value } = req.body;
    if (!name || value === undefined) {
      return res.status(400).json({ success: false, error: 'Both header "name" and "value" are required.' });
    }

    const result = validateHttpHeader(String(name).trim(), String(value));
    const rule = HTTP_HEADER_RULES[name] || HTTP_HEADER_RULES.headerName;

    res.json({
      success: true,
      data: {
        ...result,
        appliedRegex: rule.regex.toString(),
        description: rule.description,
        suggestion: rule.suggestion
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const validateCookie = async (req, res) => {
  try {
    const { cookieString, isSetCookie = true } = req.body;
    if (!cookieString) {
      return res.status(400).json({ success: false, error: 'A cookieString parameter is required.' });
    }

    const result = validateCookieString(cookieString, isSetCookie);

    // Save record to DB / Memory
    const record = {
      cookieName: result.name,
      maskedValue: result.value,
      domain: result.attributes?.domain || null,
      path: result.attributes?.path || '/',
      secure: result.attributes?.secure || false,
      httpOnly: result.attributes?.httpOnly || false,
      sameSite: result.attributes?.sameSite || null,
      expires: result.attributes?.expires || null,
      maxAge: result.attributes?.maxAge || null,
      isSessionCookie: result.isSessionCookie,
      isValid: result.isValid,
      securityWarnings: result.warnings,
      timestamp: new Date()
    };

    addInMemory(inMemoryHttpData.cookies, record);
    if (mongoose.connection.readyState === 1) {
      CookieRecord.create(record).catch(() => {});
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// -------------------------------------------------------------
// MODULE 5: DFA Session Cookie State Machine Controllers
// -------------------------------------------------------------

export const createSession = async (req, res) => {
  try {
    const { 
      ttlSeconds = 3600, 
      domain = 'localhost', 
      path = '/', 
      userId = 'user_' + crypto.randomBytes(3).toString('hex') 
    } = req.body;

    const sessionId = 'sess_' + crypto.randomBytes(24).toString('hex');
    const dfa = new SessionCookieDFA(sessionId, {
      ttlSeconds,
      domain,
      path,
      userId,
      clientIp: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'ValidationEngineClient/1.0'
    });

    await persistSessionState(dfa);

    res.status(201).json({
      success: true,
      message: 'New session cookie issued in initial state ISSUED.',
      session: dfa.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const activateSession = async (req, res) => {
  try {
    const { sessionId, reason = 'Client verified through HTTP request with session cookie.' } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required.' });
    }

    const dfa = await getSessionInstance(sessionId);
    if (!dfa) {
      return res.status(404).json({ success: false, error: `Session ${sessionId} not found.` });
    }

    // Check time expiration first
    dfa.checkTimeExpiration();

    const transitionResult = dfa.transition('ACTIVATE', reason, req.body.actor || 'client');
    await persistSessionState(dfa);

    if (!transitionResult.success) {
      // Log illegal transition attempt as a Security Warning
      const warningRecord = {
        type: 'ILLEGAL_DFA_TRANSITION',
        severity: 'HIGH',
        target: `Session: ${sessionId}`,
        details: `Illegal transition attempt: from ${transitionResult.currentState} via ACTIVATE.`,
        suggestion: transitionResult.explanation,
        timestamp: new Date()
      };
      addInMemory(inMemoryHttpData.warnings, warningRecord);
      if (mongoose.connection.readyState === 1) {
        SecurityWarning.create(warningRecord).catch(() => {});
      }

      return res.status(409).json({
        success: false,
        error: transitionResult.error,
        explanation: transitionResult.explanation,
        session: dfa.toJSON()
      });
    }

    res.json({
      success: true,
      message: 'Session activated successfully. State is now ACTIVE.',
      session: dfa.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const expireSession = async (req, res) => {
  try {
    const { sessionId, reason = 'Session reached expiration threshold / TTL timeout.' } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required.' });
    }

    const dfa = await getSessionInstance(sessionId);
    if (!dfa) {
      return res.status(404).json({ success: false, error: `Session ${sessionId} not found.` });
    }

    const transitionResult = dfa.transition('EXPIRE', reason, req.body.actor || 'time-daemon');
    await persistSessionState(dfa);

    if (!transitionResult.success) {
      return res.status(409).json({
        success: false,
        error: transitionResult.error,
        explanation: transitionResult.explanation,
        session: dfa.toJSON()
      });
    }

    res.json({
      success: true,
      message: 'Session successfully transitioned to EXPIRED.',
      session: dfa.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { sessionId, reason = 'Administrator or user explicitly invalidated session.' } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required.' });
    }

    const dfa = await getSessionInstance(sessionId);
    if (!dfa) {
      return res.status(404).json({ success: false, error: `Session ${sessionId} not found.` });
    }

    const transitionResult = dfa.transition('REVOKE', reason, req.body.actor || 'admin');
    await persistSessionState(dfa);

    if (!transitionResult.success) {
      return res.status(409).json({
        success: false,
        error: transitionResult.error,
        explanation: transitionResult.explanation,
        session: dfa.toJSON()
      });
    }

    res.json({
      success: true,
      message: 'Session successfully transitioned to REVOKED.',
      session: dfa.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const dfa = await getSessionInstance(id);
    if (!dfa) {
      return res.status(404).json({ success: false, error: `Session ${id} not found.` });
    }

    // Check expiration dynamically
    dfa.checkTimeExpiration();
    await persistSessionState(dfa);

    res.json({
      success: true,
      session: dfa.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllSessions = async (req, res) => {
  try {
    let sessions = [];

    if (mongoose.connection.readyState === 1) {
      const docs = await SessionState.find().sort({ updatedAt: -1 }).limit(50);
      sessions = docs.map(d => ({
        sessionId: d.sessionId,
        currentState: d.currentState,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        expiresAt: d.expiresAt,
        domain: d.domain,
        clientIp: d.clientIp,
        transitionCount: d.transitionHistory?.length || 1,
        transitionHistory: d.transitionHistory || []
      }));
    } else {
      // From in-memory map
      sessions = Array.from(activeSessionsDFA.values()).map(d => d.toJSON());
    }

    res.json({
      success: true,
      total: sessions.length,
      sessions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDfaGraph = (req, res) => {
  res.json({
    success: true,
    graph: SessionCookieDFA.getDFAGraph()
  });
};

// -------------------------------------------------------------
// MODULE 6: Security Monitoring Dashboard Stats
// -------------------------------------------------------------

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Requests & Responses
    let totalRequests = inMemoryHttpData.requests.length;
    let totalResponses = inMemoryHttpData.responses.length;
    let validHeaders = 0;
    let invalidHeaders = 0;
    let totalCookies = inMemoryHttpData.cookies.length;
    let validCookies = 0;
    let invalidCookies = 0;

    for (const h of inMemoryHttpData.headerValidations) {
      if (h.isValid) validHeaders++;
      else invalidHeaders++;
    }

    for (const c of inMemoryHttpData.cookies) {
      if (c.isValid) validCookies++;
      else invalidCookies++;
    }

    // 2. DFA Session States counts
    let activeSessions = 0;
    let issuedSessions = 0;
    let expiredSessions = 0;
    let revokedSessions = 0;

    if (mongoose.connection.readyState === 1) {
      const [issued, active, expired, revoked] = await Promise.all([
        SessionState.countDocuments({ currentState: 'ISSUED' }),
        SessionState.countDocuments({ currentState: 'ACTIVE' }),
        SessionState.countDocuments({ currentState: 'EXPIRED' }),
        SessionState.countDocuments({ currentState: 'REVOKED' })
      ]);
      issuedSessions = issued;
      activeSessions = active;
      expiredSessions = expired;
      revokedSessions = revoked;
    } else {
      for (const sess of activeSessionsDFA.values()) {
        if (sess.currentState === 'ISSUED') issuedSessions++;
        else if (sess.currentState === 'ACTIVE') activeSessions++;
        else if (sess.currentState === 'EXPIRED') expiredSessions++;
        else if (sess.currentState === 'REVOKED') revokedSessions++;
      }
    }

    const totalSessions = issuedSessions + activeSessions + expiredSessions + revokedSessions;

    // 3. Security Warnings
    const warnings = inMemoryHttpData.warnings.slice(0, 20);

    res.json({
      success: true,
      data: {
        httpMetrics: {
          totalRequests,
          totalResponses,
          validHeaders,
          invalidHeaders,
          totalCookies,
          validCookies,
          invalidCookies,
          headerComplianceRate: (validHeaders + invalidHeaders) > 0 
            ? parseFloat(((validHeaders / (validHeaders + invalidHeaders)) * 100).toFixed(1)) 
            : 100.0,
          cookieComplianceRate: (validCookies + invalidCookies) > 0
            ? parseFloat(((validCookies / (validCookies + invalidCookies)) * 100).toFixed(1))
            : 100.0
        },
        sessionMetrics: {
          totalSessions,
          issuedSessions,
          activeSessions,
          expiredSessions,
          revokedSessions,
          stateDistribution: {
            ISSUED: issuedSessions,
            ACTIVE: activeSessions,
            EXPIRED: expiredSessions,
            REVOKED: revokedSessions
          }
        },
        recentActivity: {
          requests: inMemoryHttpData.requests.slice(0, 10),
          responses: inMemoryHttpData.responses.slice(0, 10),
          headerValidations: inMemoryHttpData.headerValidations.slice(0, 15),
          cookies: inMemoryHttpData.cookies.slice(0, 10),
          warnings
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSecurityWarnings = async (req, res) => {
  try {
    let warnings = [];
    if (mongoose.connection.readyState === 1) {
      warnings = await SecurityWarning.find().sort({ timestamp: -1 }).limit(50);
    } else {
      warnings = inMemoryHttpData.warnings.slice(0, 50);
    }

    res.json({
      success: true,
      count: warnings.length,
      warnings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
