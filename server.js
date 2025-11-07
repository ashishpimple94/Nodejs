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
  // Skip connection check for health endpoint and root
  if (req.path === '/health' || req.path === '/') {
    return next();
  }

  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      return res.status(503).json({
        success: false,
        message: 'Database configuration error',
        message_mr: 'डेटाबेस कॉन्फ़िगरेशन त्रुटि',
        error: 'MONGODB_URI environment variable is not set',
        hint: 'Please set MONGODB_URI in Vercel environment variables'
      });
    }

    // Ensure MongoDB connection is ready
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 MongoDB not connected, attempting connection...');
      console.log('📍 Connection state:', mongoose.connection.readyState);
      console.log('🔗 MongoDB URI present:', !!process.env.MONGODB_URI);
      
      try {
        await connectDB();
        console.log('✅ MongoDB connected successfully');
      } catch (connError) {
        console.error('❌ MongoDB connection failed:', connError.message);
        console.error('📋 Error details:', {
          name: connError.name,
          code: connError.code,
          message: connError.message
        });
        throw connError;
      }
    } else {
      console.log('✅ MongoDB already connected');
    }
    next();
  } catch (error) {
    console.error('❌ MongoDB connection error in middleware:', error);
    console.error('📋 Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Provide helpful error messages
    let errorMessage = 'Database connection failed';
    let errorDetails = error.message || 'Unknown error';
    
    if (error.message && error.message.includes('authentication failed')) {
      errorMessage = 'Database authentication failed';
      errorDetails = 'Invalid username or password. Please check MONGODB_URI.';
    } else if (error.message && error.message.includes('ENOTFOUND')) {
      errorMessage = 'Database server not found';
      errorDetails = 'Cannot reach MongoDB server. Check your connection string.';
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'Connection timeout';
      errorDetails = 'Connection to database timed out. Check network access in MongoDB Atlas.';
    }
    
    return res.status(503).json({
      success: false,
      message: errorMessage,
      message_mr: 'डेटाबेस कनेक्शन विफल',
      error: errorDetails,
      hint: process.env.VERCEL ? 'Check Vercel environment variables and MongoDB Atlas network access' : 'Check your .env file'
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

// Health check endpoint with detailed MongoDB status
app.get('/health', async (req, res) => {
  const connectionState = mongoose.connection.readyState;
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  let mongodbStatus = {
    state: stateMap[connectionState] || 'unknown',
    readyState: connectionState,
    host: mongoose.connection.host || 'N/A',
    name: mongoose.connection.name || 'N/A',
    hasUri: !!process.env.MONGODB_URI
  };

  // Try to connect if not connected
  if (connectionState !== 1 && process.env.MONGODB_URI) {
    try {
      await connectDB();
      mongodbStatus.state = 'connected';
      mongodbStatus.readyState = mongoose.connection.readyState;
      mongodbStatus.host = mongoose.connection.host;
      mongodbStatus.name = mongoose.connection.name;
    } catch (error) {
      mongodbStatus.error = error.message;
      mongodbStatus.state = 'error';
    }
  }

  res.json({
    status: connectionState === 1 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'production' : 'development',
    mongodb: mongodbStatus
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

