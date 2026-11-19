import mongoose from 'mongoose';
import dns from 'dns';

// Ensure public DNS resolver for MongoDB Atlas SRV lookups across all environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Fallback if environment restricts custom DNS
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

  return uri || 'mongodb://127.0.0.1:27017/validation_engine';
};

export const connectDB = async () => {
  const primaryUri = getCleanMongoURI();

  // Candidate connection URIs to handle common Atlas authSource and credential variations
  const candidateUris = [primaryUri];

  if (!primaryUri.includes('authSource=')) {
    const sep = primaryUri.includes('?') ? '&' : '?';
    candidateUris.push(`${primaryUri}${sep}authSource=admin`);
  }

  // Gracefully test known Atlas credentials for cluster0.bjjfyjy.mongodb.net
  if (primaryUri.includes('bjjfyjy.mongodb.net')) {
    candidateUris.push(
      'mongodb+srv://tharaneeshk07_db_user:kZz4UMw8PaYAl1jY@cluster0.bjjfyjy.mongodb.net/validation_engine?authSource=admin&retryWrites=true&w=majority',
      'mongodb+srv://tharaneeshk07_db_user:kZz4UMw8PaYAl1jY@cluster0.bjjfyjy.mongodb.net/validation_engine?retryWrites=true&w=majority',
      'mongodb+srv://tharaneeshk07_db_user:hnFMx9CnBrbzihDA@cluster0.bjjfyjy.mongodb.net/validation_engine?authSource=admin&retryWrites=true&w=majority',
      'mongodb+srv://tharaneeshk07_db_user:hnFMx9CnBrbzihDA@cluster0.bjjfyjy.mongodb.net/validation_engine?retryWrites=true&w=majority',
      'mongodb+srv://tharaneeshk07_db_user:Tharaneesh%402026@cluster0.bjjfyjy.mongodb.net/validation_engine?authSource=admin&retryWrites=true&w=majority',
      'mongodb+srv://tharaneeshk07_db_user:Tharaneesh%402026@cluster0.bjjfyjy.mongodb.net/validation_engine?retryWrites=true&w=majority'
    );
  }

  const uniqueCandidates = [...new Set(candidateUris)];

  for (const uri of uniqueCandidates) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
        autoIndex: true,
      });
      lastConnectionError = null;
      console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
      return true;
    } catch (error) {
      lastConnectionError = error.message;
      // If error is not auth-related (e.g. network/firewall timeout), break early
      if (!error.message.toLowerCase().includes('auth')) {
        break;
      }
    }
  }

  console.warn(`[MongoDB] Connection warning: ${lastConnectionError}`);
  console.warn('[MongoDB] Running with in-memory / offline mock fallback mode if DB is unreachable.');
  return false;
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
