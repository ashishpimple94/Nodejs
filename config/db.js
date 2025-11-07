import mongoose from 'mongoose';

// Cache the connection to reuse in serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment variables');
    throw new Error('MONGODB_URI is not set');
  }

  // If connection already exists and is ready, return it
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Buffer commands until connection is ready (important for serverless)
      serverSelectionTimeoutMS: 10000, // How long to try selecting a server (increased for serverless)
      socketTimeoutMS: 45000, // How long to wait for socket timeout
      connectTimeoutMS: 15000, // How long to wait for initial connection (increased for serverless)
      maxPoolSize: 1, // For serverless, use 1 connection to avoid connection pool issues
      minPoolSize: 0, // Allow 0 connections when idle (serverless friendly)
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      retryWrites: true,
      w: 'majority',
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB Connected:', mongoose.connection.host);
      cached.conn = mongoose;
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB Connection Error:', error.message);
      cached.promise = null;
      cached.conn = null;
      throw error;
    });
  }

  try {
    const conn = await cached.promise;
    // Wait for connection to be ready
    if (conn.connection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        conn.connection.once('connected', resolve);
        conn.connection.once('error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 10000);
      });
    }
    return conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }
};

export default connectDB;

