import 'dotenv/config';

const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`,
  dbUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  resendApiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'notifications@yourdomain.com',
} as const;

export default env;
