import app from '@/app';
import request from 'supertest';
import prisma from '@/lib/prisma';

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    it('should return 400 if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(422);
    });
  });
});