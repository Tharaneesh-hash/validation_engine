import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { validateHttpHeader, validateCookieString } from '../algorithms/headerRegexRules.js';
import { SessionCookieDFA, SESSION_STATES } from '../algorithms/sessionCookieDFA.js';

describe('HTTP Header, Cookie & DFA Session Engine - Module 10 Verification', () => {

  // Scenario 1: Valid HTTP request headers
  it('Scenario 1: Accepts fully valid RFC 7230 HTTP request headers', () => {
    const validHost = validateHttpHeader('Host', 'validationengine.onrender.com:443');
    expect(validHost.isValid).toBe(true);
    expect(validHost.errors).toHaveLength(0);

    const validContentType = validateHttpHeader('Content-Type', 'application/json; charset=utf-8');
    expect(validContentType.isValid).toBe(true);

    const validAuth = validateHttpHeader('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    expect(validAuth.isValid).toBe(true);
  });

  // Scenario 2: Invalid HTTP request headers
  it('Scenario 2: Rejects malformed and CRLF-injected HTTP request headers', () => {
    const invalidHeaderName = validateHttpHeader('Invalid Header:Name', 'test');
    expect(invalidHeaderName.isValid).toBe(false);
    expect(invalidHeaderName.errors[0].field).toBe('headerName');

    const crlfInjection = validateHttpHeader('X-Custom', 'validValue\r\nInjected-Header: evil');
    expect(crlfInjection.isValid).toBe(false);
    expect(crlfInjection.errors.some(e => e.message.includes('CRLF'))).toBe(true);

    const invalidContentLength = validateHttpHeader('Content-Length', 'not-a-number');
    expect(invalidContentLength.isValid).toBe(false);
  });

  // Scenario 3: Valid HTTP response headers
  it('Scenario 3: Validates properly structured HTTP response headers', () => {
    const validNoSniff = validateHttpHeader('X-Content-Type-Options', 'nosniff');
    expect(validNoSniff.isValid).toBe(true);

    const validFrameOptions = validateHttpHeader('X-Frame-Options', 'SAMEORIGIN');
    expect(validFrameOptions.isValid).toBe(true);

    const validHSTS = validateHttpHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    expect(validHSTS.isValid).toBe(true);
  });

  // Scenario 4: Missing security headers detection
  it('Scenario 4: Detects missing security hardening headers via inspection API', async () => {
    const response = await request(app)
      .post('/api/http/inspect-response')
      .send({
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html'
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.isSecure).toBe(false);
    expect(response.body.data.missingSecurityHeaders.length).toBeGreaterThan(0);
    expect(response.body.data.missingSecurityHeaders.some(h => h.header === 'Strict-Transport-Security')).toBe(true);
  });

  // Scenario 5: Valid cookies
  it('Scenario 5: Accepts properly formed cookies with full security attributes', () => {
    const cookie = 'session_id=3a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d; Secure; HttpOnly; SameSite=Strict; Path=/; Domain=example.com';
    const result = validateCookieString(cookie, true);

    expect(result.isValid).toBe(true);
    expect(result.name).toBe('session_id');
    expect(result.attributes.secure).toBe(true);
    expect(result.attributes.httpOnly).toBe(true);
    expect(result.attributes.sameSite).toBe('Strict');
    expect(result.errors).toHaveLength(0);
  });

  // Scenario 6: Malformed cookies
  it('Scenario 6: Rejects malformed cookie names and values with illegal characters', () => {
    const malformed = 'bad@cookie;name=val;ue with spaces; Path=/';
    const result = validateCookieString(malformed, true);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  // Scenario 7: Cookie without HttpOnly or Secure
  it('Scenario 7: Generates high-severity security warnings for missing HttpOnly or Secure', () => {
    const insecureCookie = 'user_token=abcdef1234567890abcdef; Path=/';
    const result = validateCookieString(insecureCookie, true);

    expect(result.hasSecurityWarnings).toBe(true);
    const hasHttpOnlyWarning = result.warnings.some(w => w.message.includes('HttpOnly'));
    const hasSecureWarning = result.warnings.some(w => w.message.includes('Secure'));
    expect(hasHttpOnlyWarning).toBe(true);
    expect(hasSecureWarning).toBe(true);
  });

  // Scenario 8: Newly issued session
  it('Scenario 8: Creates session cookie starting in initial DFA state ISSUED', () => {
    const dfa = new SessionCookieDFA('sess_test_123', { ttlSeconds: 1800 });
    expect(dfa.currentState).toBe(SESSION_STATES.ISSUED);
    expect(dfa.transitionHistory).toHaveLength(1);
    expect(dfa.transitionHistory[0].toState).toBe(SESSION_STATES.ISSUED);
  });

  // Scenario 9: Active session
  it('Scenario 9: Transitions from ISSUED to ACTIVE upon verification', () => {
    const dfa = new SessionCookieDFA('sess_test_456');
    const result = dfa.transition('ACTIVATE', 'Initial authentication handshake complete.');

    expect(result.success).toBe(true);
    expect(result.fromState).toBe(SESSION_STATES.ISSUED);
    expect(result.toState).toBe(SESSION_STATES.ACTIVE);
    expect(dfa.currentState).toBe(SESSION_STATES.ACTIVE);
  });

  // Scenario 10: Expired session
  it('Scenario 10: Transitions to EXPIRED when TTL expires', () => {
    const dfa = new SessionCookieDFA('sess_test_789');
    dfa.transition('ACTIVATE');
    const expireResult = dfa.transition('EXPIRE', 'TTL exceeded');

    expect(expireResult.success).toBe(true);
    expect(expireResult.toState).toBe(SESSION_STATES.EXPIRED);
    expect(dfa.currentState).toBe(SESSION_STATES.EXPIRED);
  });

  // Scenario 11: Revoked session
  it('Scenario 11: Transitions to REVOKED when explicitly invalidated', () => {
    const dfa = new SessionCookieDFA('sess_test_revoke');
    dfa.transition('ACTIVATE');
    const revokeResult = dfa.transition('REVOKE', 'Admin security revocation');

    expect(revokeResult.success).toBe(true);
    expect(revokeResult.toState).toBe(SESSION_STATES.REVOKED);
    expect(dfa.currentState).toBe(SESSION_STATES.REVOKED);
  });

  // Scenario 12: Invalid DFA transition
  it('Scenario 12: Strictly rejects invalid and undefined DFA transitions', () => {
    const dfa = new SessionCookieDFA('sess_test_illegal');
    const invalidResult = dfa.transition('UNKNOWN_EVENT');

    expect(invalidResult.success).toBe(false);
    expect(dfa.currentState).toBe(SESSION_STATES.ISSUED);
  });

  // Scenario 13: Expired or revoked session attempting reuse
  it('Scenario 13: Prevents terminal state revival (EXPIRED -> ACTIVE or REVOKED -> ACTIVE)', () => {
    const dfaExpired = new SessionCookieDFA('sess_expired_revive');
    dfaExpired.transition('ACTIVATE');
    dfaExpired.transition('EXPIRE');

    // Attempt to revive expired session
    const reviveExpired = dfaExpired.transition('ACTIVATE', 'Re-login attempt with old cookie');
    expect(reviveExpired.success).toBe(false);
    expect(dfaExpired.currentState).toBe(SESSION_STATES.EXPIRED);

    const dfaRevoked = new SessionCookieDFA('sess_revoked_revive');
    dfaRevoked.transition('REVOKE');
    const reviveRevoked = dfaRevoked.transition('ACTIVATE', 'Compromised token replay attempt');
    expect(reviveRevoked.success).toBe(false);
    expect(dfaRevoked.currentState).toBe(SESSION_STATES.REVOKED);
  });

  // Scenario 14: Persistence via REST API
  it('Scenario 14: REST API persists sessions and records transition history', async () => {
    const createRes = await request(app)
      .post('/api/sessions/create')
      .send({ ttlSeconds: 3600 });

    expect(createRes.status).toBe(201);
    const sessionId = createRes.body.session.sessionId;
    expect(createRes.body.session.currentState).toBe('ISSUED');

    // Activate
    const activateRes = await request(app)
      .post('/api/sessions/activate')
      .send({ sessionId });

    expect(activateRes.status).toBe(200);
    expect(activateRes.body.session.currentState).toBe('ACTIVE');

    // Fetch history
    const getRes = await request(app).get(`/api/sessions/${sessionId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.session.transitionHistory.length).toBeGreaterThanOrEqual(2);
  });

  // Scenario 15: Production API connectivity & Dashboard stats
  it('Scenario 15: Returns unified dashboard metrics and security warnings', async () => {
    const statsRes = await request(app).get('/api/http/dashboard-stats');
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.success).toBe(true);
    expect(statsRes.body.data.httpMetrics).toBeDefined();
    expect(statsRes.body.data.sessionMetrics).toBeDefined();

    const dfaGraphRes = await request(app).get('/api/sessions/dfa-graph');
    expect(dfaGraphRes.status).toBe(200);
    expect(dfaGraphRes.body.graph.states).toHaveLength(4);
    expect(dfaGraphRes.body.graph.transitions).toHaveLength(5);
  });
});
