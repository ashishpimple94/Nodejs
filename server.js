import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import multer from 'multer';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import voterRoutes from './routes/voterRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to ensure MongoDB connection before handling requests
app.use(async (req, res, next) => {
  // Skip connection check for health endpoint
  if (req.path === '/health' || req.path === '/') {
    return next();
  }

  try {
    // Ensure MongoDB connection is ready
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, attempting connection...');
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('MongoDB connection error in middleware:', error);
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
      message_mr: 'डेटाबेस कनेक्शन विफल',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable',
    });
  }
});

// Create uploads directory if it doesn't exist (only for local dev, not needed for Vercel)
if (process.env.VERCEL !== '1' && !fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Excel Upload API',
    status: 'running',
    environment: process.env.VERCEL ? 'production' : 'development',
    endpoints: {
      uploadExcel: 'POST /api/voters/upload',
      getAllVoters: 'GET /api/voters',
      getVoterById: 'GET /api/voters/:id',
      searchVoters: 'GET /api/voters/search?query=...',
      deleteAllVoters: 'DELETE /api/voters',
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/voters', voterRoutes);

// Multer-specific error handler (e.g., file too large, wrong type)
app.use((err, req, res, next) => {
  if (err && (err instanceof multer.MulterError || err.name === 'MulterError')) {
    let message = 'फ़ाइल अपलोड त्रुटि';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `फाइल बहुत बड़ी है। अधिकतम ${(process.env.MAX_FILE_SIZE_MB || 25)}MB अनुमति है`;
    }
    return res.status(400).json({ success: false, message });
  }
  return next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
});

// Export app for Vercel serverless functions
// For local development, start the server
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   🚀 Server running on port ${PORT}        ║
║   📁 Excel Upload API is ready!           ║
║   🔗 http://localhost:${PORT}              ║
╚════════════════════════════════════════════╝
    `);
  });
}

// Export for Vercel
export default app;

