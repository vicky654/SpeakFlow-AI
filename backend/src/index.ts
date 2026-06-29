import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { seedInitialData } from './config/seed';

// Import routes
import authRouter from './routes/auth';
import vocabRouter from './routes/vocab';
import learningRouter from './routes/learning';
import gamificationRouter from './routes/gamification';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://speakflow-ai.vercel.app',
  /^https:\/\/speakflow.*\.vercel\.app$/,   // any Vercel preview deploy
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, Render health checks)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    // Also allow if FRONTEND_URL env is set (for custom Vercel domain)
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/vocab', vocabRouter);
app.use('/api/learning', learningRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
async function startServer() {
  // Connect to Database
  await connectDB();
  
  // Seed Database with initial mock content
  await seedInitialData();

  app.listen(PORT, () => {
    console.log(`🚀 SpeakFlow AI Server is running on http://localhost:${PORT}`);
  });
}

startServer();
