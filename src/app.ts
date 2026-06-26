import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiReference } from '@scalar/express-api-reference';

import { notFound, errorHandler } from '@/middleware/errorMiddleware';
import healthRouter from '@/routes/healthRoutes';
import authRouter from '@/routes/authRoutes';
import openApiSpec from '@/docs/openapi';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev', {
  skip: (req) => !req.path.startsWith('/api'),
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

app.get('/api/docs/openapi.json', (_req, res) => res.json(openApiSpec));
// Scalar injects an inline script — override helmet's CSP for this route only
app.get('/api/docs', (_req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src * data:; connect-src *",
  );
  next();
}, apiReference({ url: '/api/docs/openapi.json' }));

app.use(notFound);
app.use(errorHandler);

export default app;
