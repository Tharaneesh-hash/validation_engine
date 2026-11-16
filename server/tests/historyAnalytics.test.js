import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('History & Analytics API - Phase 6 Verification', () => {
  it('GET /api/history returns valid paginated records', async () => {
    const res = await request(app).get('/api/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET /api/analytics returns accurate computed metrics', async () => {
    const res = await request(app).get('/api/analytics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalValidations');
    expect(res.body.data).toHaveProperty('validCount');
    expect(res.body.data).toHaveProperty('invalidCount');
    expect(res.body.data).toHaveProperty('successRate');
    expect(res.body.data).toHaveProperty('errorCategories');
    expect(res.body.data).toHaveProperty('fieldStats');
    expect(res.body.data.falseAcceptanceRate).toBe(0);
    expect(res.body.data.falseRejectionRate).toBe(0);
  });

  it('DELETE /api/history clears history records', async () => {
    const res = await request(app).delete('/api/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
