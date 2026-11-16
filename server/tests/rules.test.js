import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Validation Rules API (/api/rules)', () => {
  it('GET /api/rules returns list of active validation rules', async () => {
    const res = await request(app).get('/api/rules');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(9);
    expect(Array.isArray(res.body.data)).toBe(true);

    const emailRule = res.body.data.find(r => r.fieldId === 'email');
    expect(emailRule).toBeDefined();
    expect(emailRule).toHaveProperty('pattern');
    expect(emailRule).toHaveProperty('label', 'Email Address');
  });

  it('POST /api/rules rejects rule with missing required fields with 400', async () => {
    const res = await request(app)
      .post('/api/rules')
      .send({ fieldId: 'incompleteRule' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
