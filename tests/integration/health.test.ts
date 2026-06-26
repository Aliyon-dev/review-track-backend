import request from 'supertest';
import app from '../../src/app';

describe('GET /api/health', () => {
  it('returns 200 with success message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
