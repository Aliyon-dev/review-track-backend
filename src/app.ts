import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { notFound, errorHandler } from './middleware/errorMiddleware';
import healthRouter from './routes/healthRoutes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
