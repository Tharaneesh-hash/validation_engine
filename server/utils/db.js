import mongoose from 'mongoose';
import dns from 'dns';

// Ensure public DNS resolver for MongoDB Atlas SRV lookups across all environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where custom DNS servers are restricted
}

let lastConnectionError = null;

/**
 * Constructs and sanitizes the MongoDB connection URI, ensuring
 * proper URL encoding for credentials with special characters.
 */
export const getCleanMongoURI = () => {
  let uri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;

  if (username && password && uri) {
    const encodedUser = encodeURIComponent(username.trim());
    const encodedPass = encodeURIComponent(password.trim());

    if (uri.includes('<username>') || uri.includes('<password>')) {
      uri = uri.replace('<username>', encodedUser).replace('<password>', encodedPass);
    }
  }

  // Fallback to local MongoDB for development
  return uri || 'mongodb://127.0.0.1:27017/validation_engine';
};

export const connectDB = async () => {
  const uri = getCleanMongoURI();

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast if unreachable (5s)
      autoIndex: true,
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
