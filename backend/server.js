import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import multer from 'multer';

// Import routes
import authRoutes from './routes/auth.js';
import formsRoutes from './routes/forms.js';
import aiRoutes from './routes/ai.js';
import nlpRoutes from './routes/nlp.js';
import dataRoutes from './routes/data.js';
import submitRoutes from './routes/submit.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration
app.use(session({
  secret: process.env.NEXTAUTH_SECRET || 'feedmind-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// File upload configuration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Make upload middleware available to routes
app.locals.upload = upload;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/nlp', nlpRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/submit', submitRoutes);
app.use('/api/user', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'operational',
    service: 'FeedMind Backend API',
    timestamp: new Date().toISOString()
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    mode: 'production',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════════╗`);
  console.log(`║         🧠 FEEDMIND BACKEND API SERVER                 ║`);
  console.log(`╚════════════════════════════════════════════════════════╝\n`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ API ready at http://localhost:${PORT}/api`);
  console.log(`✅ Health check at http://localhost:${PORT}/health`);
  console.log(`\n📡 Waiting for requests...\n`);
});

export default app;
