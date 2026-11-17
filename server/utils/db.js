import mongoose from 'mongoose';
import dns from 'dns';

// Ensure standard public DNS resolver for MongoDB Atlas SRV lookups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setServers is restricted
}

let lastConnectionError = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/validation_engine';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
    });
    lastConnectionError = null;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    lastConnectionError = error.message;
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
    dbName: mongoose.connection.name || null,
    lastError: mongoose.connection.readyState === 1 ? null : lastConnectionError
  };
};
