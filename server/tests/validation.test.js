import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Form Validation API (/api/validate) - Phase 2 Verification', () => {
  const validUser = {
    fullName: 'Alan Turing',
    email: 'alan.turing@automata.edu',
    mobile: '9876543210',
    username: 'turing_1912',
    password: 'Password@123',
    confirmPassword: 'Password@123',
    pincode: '560001',
    website: 'https://automata.edu',
    dob: '1995-06-23'
  };

  it('Positive Test: Accepts fully compliant valid form input with 200 OK', async () => {
    const res = await request(app)
      .post('/api/validate')
      .send(validUser);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isValid).toBe(true);
    expect(Object.keys(res.body.errors).length).toBe(0);
    expect(res.body.metadata).toHaveProperty('executionTimeMs');
  });

  it('Negative Test: Rejects form when required fields are missing with 422', async () => {
    const res = await request(app)
      .post('/api/validate')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.isValid).toBe(false);
    expect(res.body.errors).toHaveProperty('fullName');
    expect(res.body.errors).toHaveProperty('email');
    expect(res.body.errors).toHaveProperty('password');
  });

  it('Grammar Check: Rejects invalid email structure with 422', async () => {
    const res = await request(app)
      .post('/api/validate')
      .send({ ...validUser, email: 'turing-at-automata.edu' });

    expect(res.status).toBe(422);
    expect(res.body.isValid).toBe(false);
    expect(res.body.errors).toHaveProperty('email');
  });

  it('Boundary Check: Rejects mobile numbers not starting with 6, 7, 8, or 9', async () => {
    const res = await request(app)
      .post('/api/validate')
      .send({ ...validUser, mobile: '1234567890' });

    expect(res.status).toBe(422);
    expect(res.body.isValid).toBe(false);
    expect(res.body.errors).toHaveProperty('mobile');
  });

  it('Entropy Check: Rejects weak password lacking special characters', async () => {
    const res = await request(app)
      .post('/api/validate')
      .send({ ...validUser, password: 'Password123', confirmPassword: 'Password123' });

    expect(res.status).toBe(422);
    expect(res.body.isValid).toBe(false);
    expect(res.body.errors).toHaveProperty('password');
  });

  it('Equality Check: Rejects password mismatch between password and confirmPassword', async () => {
    const res = await request(app)
      .post('/api/validate')
      .send({ ...validUser, confirmPassword: 'DifferentPassword@123' });

    expect(res.status).toBe(422);
    expect(res.body.isValid).toBe(false);
    expect(res.body.errors).toHaveProperty('confirmPassword');
  });

  it('Postal Boundary: Rejects Indian PIN code starting with digit 0', async () => {
    const res = await request(app)
      .post('/api/validate')
      .send({ ...validUser, pincode: '012345' });

    expect(res.status).toBe(422);
    expect(res.body.isValid).toBe(false);
    expect(res.body.errors).toHaveProperty('pincode');
  });
});
