import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/validation_engine';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB] Connection warning: ${error.message}`);
    console.warn('[MongoDB] Running with in-memory / offline mock fallback mode if DB is unreachable.');
    return false;
  }
};

export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host || null,
    dbName: mongoose.connection.name || null
  };
};
