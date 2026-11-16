import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Health Check API - Phase 1 Verification', () => {
  it('GET /api/health should respond with 200 OK and valid health metrics', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('status', 'healthy');
    expect(res.body.data).toHaveProperty('server');
    expect(res.body.data.server).toHaveProperty('runtime', 'Node.js');
    expect(res.body.data).toHaveProperty('database');
    expect(res.body.data).toHaveProperty('network');
  });

  it('GET / non-existent route should return 404 with structured JSON', async () => {
    const res = await request(app).get('/api/non-existent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });
});
