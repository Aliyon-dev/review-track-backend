import 'dotenv/config';

const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`,
  dbUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  fromEmail: process.env.FROM_EMAIL || 'notifications@yourdomain.com',
} as const;

export default env;
