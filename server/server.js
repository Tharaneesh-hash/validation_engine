import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './utils/db.js';
import { networkTrackerMiddleware } from './middleware/networkTracker.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import validationRoutes from './routes/validationRoutes.js';
import regexRoutes from './routes/regexRoutes.js';
import automataRoutes from './routes/automataRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Core Middlewares
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 2. Logging and Computer Networks Monitoring Middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(networkTrackerMiddleware);

// 3. Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/validate', validationRoutes);
app.use('/api/regex', regexRoutes);
app.use('/api/automata', automataRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/rules', ruleRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Web Form Input Validation Engine (Regex & DFA) API',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'online'
  });
});

// Serve static frontend assets in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 4. Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// 5. Server Initialization
if (process.env.NODE_ENV !== 'test') {
  // Connect to Database
  connectDB();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Validation Engine Server running on port: ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Client Origin: ${CLIENT_URL}`);
    console.log(`====================================================`);
  });
}

export default app;
