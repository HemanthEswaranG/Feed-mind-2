import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database Configuration (Prisma)
  databaseUrl: process.env.DATABASE_URL,

  // Authentication Configuration
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    sessionMaxAge: 24 * 60 * 60 * 1000, // 24 hours
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  // AI Configuration
  ai: {
    groqApiKey: process.env.GROQ_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
    defaultModel: 'llama-3.1-70b-versatile',
  },

  // NLP Model Configuration
  nlp: {
    apiUrl: process.env.NLP_API_URL || 'http://localhost:8000',
    enabled: process.env.NLP_ENABLED === 'true',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['text/csv', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },

  // Email Configuration
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.EMAIL_FROM || 'noreply@feedmind.com',
  },
};

export default CONFIG;
