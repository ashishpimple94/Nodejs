import mongoose from 'mongoose';

// Cache the connection to reuse in serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  // Log connection attempt (without exposing password)
  const uriParts = process.env.MONGODB_URI.split('@');
  const sanitizedUri = uriParts.length > 1 ? `mongodb+srv://***@${uriParts[1]}` : 'mongodb+srv://***';
  console.log('🔄 Attempting MongoDB connection to:', sanitizedUri);

  // If connection already exists and is ready, return it
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Buffer commands until connection is ready (important for serverless)
      serverSelectionTimeoutMS: 20000, // Increased for serverless (20 seconds)
      socketTimeoutMS: 45000, // How long to wait for socket timeout
      connectTimeoutMS: 20000, // Increased for serverless (20 seconds)
      maxPoolSize: 1, // For serverless, use 1 connection to avoid connection pool issues
      minPoolSize: 0, // Allow 0 connections when idle (serverless friendly)
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      retryWrites: true,
      w: 'majority',
    };

    console.log('📋 Connection options:', {
      serverSelectionTimeoutMS: opts.serverSelectionTimeoutMS,
      connectTimeoutMS: opts.connectTimeoutMS,
      maxPoolSize: opts.maxPoolSize
    });

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected successfully to:', mongoose.connection.host);
      console.log('📊 Database:', mongoose.connection.name);
      console.log('🔌 Ready state:', mongoose.connection.readyState);
      cached.conn = mongoose;
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB Connection Error:', error.name);
      console.error('📋 Error message:', error.message);
      console.error('🔢 Error code:', error.code);
      if (error.reason) {
        console.error('📋 Error reason:', error.reason);
      }
      cached.promise = null;
      cached.conn = null;
      throw error;
    });
  }

  try {
    const conn = await cached.promise;
    // Wait for connection to be ready
    if (conn.connection.readyState !== 1) {
      console.log('⏳ Waiting for connection to be ready...');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout: Database did not become ready within 15 seconds'));
        }, 15000);
        
        conn.connection.once('connected', () => {
          clearTimeout(timeout);
          console.log('✅ Connection ready');
          resolve();
        });
        
        conn.connection.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
    }
    return conn;
  } catch (e) {
    console.error('❌ Connection promise failed:', e.message);
    cached.promise = null;
    cached.conn = null;
    throw e;
  }
};

export default connectDB;

