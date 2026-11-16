import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Regex Testing API (/api/regex/test) - Phase 3 Verification', () => {
  it('Valid Pattern Match: Accepts email pattern against valid email', async () => {
    const res = await request(app)
      .post('/api/regex/test')
      .send({
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        flags: '',
        testStrings: ['ada@lovelace.org', 'invalid-email']
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toHaveLength(2);
    expect(res.body.results[0].isMatch).toBe(true);
    expect(res.body.results[1].isMatch).toBe(false);
    expect(res.body.metadata).toHaveProperty('totalTimeMs');
  });

  it('Syntax Error: Rejects malformed regex with 400 and SYNTAX_ERROR category', async () => {
    const res = await request(app)
      .post('/api/regex/test')
      .send({
        pattern: '([a-z', // Unclosed parenthesis
        testStrings: ['test']
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCategory).toBe('SYNTAX_ERROR');
  });

  it('ReDoS Guard: Flags catastrophic nested quantifiers', async () => {
    const res = await request(app)
      .post('/api/regex/test')
      .send({
        pattern: '(a+)+$',
        testStrings: ['aaaaa']
      });

    expect(res.status).toBe(200);
    expect(res.body.hasReDoSRisk).toBe(true);
  });

  it('Length Safety: Rejects excessively long patterns (>500 chars)', async () => {
    const longPattern = 'a'.repeat(501);
    const res = await request(app)
      .post('/api/regex/test')
      .send({
        pattern: longPattern,
        testStrings: ['a']
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
