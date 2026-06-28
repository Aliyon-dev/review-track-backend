/// <reference types="jest" />
import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import app from '@/app';
import prisma from '@/lib/prisma';
import { Role, ApplicationStatus } from '@/models/models';

const JWT_SECRET = 'changeme';

const token = (role: Role, id = 'user-1') =>
  `Bearer ${jwt.sign({ id, email: 'test@example.com', role }, JWT_SECRET, { expiresIn: '1h' })}`;

const draftApp = {
  id: 'app-1',
  title: 'My Application',
  description: 'A description',
  status: ApplicationStatus.DRAFT,
  applicantId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCreate = () => prisma.application.create as jest.Mock;
const mockFindMany = () => prisma.application.findMany as jest.Mock;
const mockFindUnique = () => prisma.application.findUnique as jest.Mock;
const mockUpdate = () => prisma.application.update as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  (prisma.$transaction as jest.Mock).mockImplementation((fn) => fn(prisma));
});

describe('POST /api/applications', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/applications').send({ title: 'T', description: 'D' });
    expect(res.status).toBe(401);
  });

  it('returns 403 for REVIEWER', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', token(Role.REVIEWER))
      .send({ title: 'T', description: 'D' });
    expect(res.status).toBe(403);
  });

  it('returns 403 for ADMIN', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', token(Role.ADMIN))
      .send({ title: 'T', description: 'D' });
    expect(res.status).toBe(403);
  });

  it('creates an application for APPLICANT', async () => {
    mockCreate().mockResolvedValue(draftApp);
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', token(Role.APPLICANT))
      .send({ title: 'My Application', description: 'A description' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('My Application');
    expect(res.body.data.status).toBe(ApplicationStatus.DRAFT);
  });
});

describe('GET /api/applications', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/applications');
    expect(res.status).toBe(401);
  });

  it('returns 403 for APPLICANT', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', token(Role.APPLICANT));
    expect(res.status).toBe(403);
  });

  it('returns all applications for REVIEWER', async () => {
    mockFindMany().mockResolvedValue([draftApp]);
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', token(Role.REVIEWER));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns all applications for ADMIN', async () => {
    mockFindMany().mockResolvedValue([draftApp]);
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', token(Role.ADMIN));
    expect(res.status).toBe(200);
  });
});

describe('GET /api/applications/my', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/applications/my');
    expect(res.status).toBe(401);
  });

  it('returns 403 for REVIEWER', async () => {
    const res = await request(app)
      .get('/api/applications/my')
      .set('Authorization', token(Role.REVIEWER));
    expect(res.status).toBe(403);
  });

  it('returns own applications for APPLICANT', async () => {
    mockFindMany().mockResolvedValue([draftApp]);
    const res = await request(app)
      .get('/api/applications/my')
      .set('Authorization', token(Role.APPLICANT, 'user-1'));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(prisma.application.findMany).toHaveBeenCalledWith({ where: { applicantId: 'user-1' } });
  });
});

describe('GET /api/applications/:id', () => {
  it('returns 403 for APPLICANT', async () => {
    const res = await request(app)
      .get('/api/applications/app-1')
      .set('Authorization', token(Role.APPLICANT));
    expect(res.status).toBe(403);
  });

  it('returns 404 when not found', async () => {
    mockFindUnique().mockResolvedValue(null);
    const res = await request(app)
      .get('/api/applications/missing')
      .set('Authorization', token(Role.REVIEWER));
    expect(res.status).toBe(404);
  });

  it('returns application for REVIEWER', async () => {
    mockFindUnique().mockResolvedValue(draftApp);
    const res = await request(app)
      .get('/api/applications/app-1')
      .set('Authorization', token(Role.REVIEWER));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('app-1');
  });
});

describe('PATCH /api/applications/:id/status', () => {
  it('returns 403 for APPLICANT', async () => {
    const res = await request(app)
      .patch('/api/applications/app-1/status')
      .set('Authorization', token(Role.APPLICANT))
      .send({ status: ApplicationStatus.SUBMITTED });
    expect(res.status).toBe(403);
  });

  it('returns 404 when not found', async () => {
    mockFindUnique().mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/applications/missing/status')
      .set('Authorization', token(Role.REVIEWER))
      .send({ status: ApplicationStatus.SUBMITTED });
    expect(res.status).toBe(404);
  });

  it('returns 422 for an invalid transition', async () => {
    mockFindUnique().mockResolvedValue(draftApp); // DRAFT
    const res = await request(app)
      .patch('/api/applications/app-1/status')
      .set('Authorization', token(Role.REVIEWER))
      .send({ status: ApplicationStatus.APPROVED }); // DRAFT → APPROVED is invalid
    expect(res.status).toBe(422);
  });

  it('updates status for a valid transition', async () => {
    const submitted = { ...draftApp, status: ApplicationStatus.SUBMITTED };
    mockFindUnique().mockResolvedValue(draftApp); // DRAFT
    mockUpdate().mockResolvedValue(submitted);
    const res = await request(app)
      .patch('/api/applications/app-1/status')
      .set('Authorization', token(Role.REVIEWER))
      .send({ status: ApplicationStatus.SUBMITTED }); // DRAFT → SUBMITTED is valid
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(ApplicationStatus.SUBMITTED);
  });
});
