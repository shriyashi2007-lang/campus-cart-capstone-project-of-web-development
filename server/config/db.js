import mongoose from 'mongoose';

function readMongoUri() {
  const value = process.env.MONGO_URI?.trim().replace(/^['"]|['"]$/g, '');
  if (!value) throw new Error('MONGO_URI is missing. Add it to server/.env.');
  if (!/^mongodb(?:\+srv)?:\/\//i.test(value)) throw new Error('MONGO_URI must start with mongodb:// or mongodb+srv://.');
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('MONGO_URI is not a valid MongoDB connection string.'); }
  if (!parsed.hostname || parsed.pathname.replace(/^\//, '').split('/')[0] === '') throw new Error('MONGO_URI must include a database name.');
  return { value, scheme: parsed.protocol.replace(':', ''), host: parsed.hostname };
}

export function databaseStatus() {
  return ({ 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' })[mongoose.connection.readyState] || 'error';
}

export async function connectDB() {
  const { value, scheme, host } = readMongoUri();
  console.log(`MongoDB connection starting (${scheme}, ${host}).`);
  try {
    await mongoose.connect(value, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected successfully.');
    return mongoose.connection;
  } catch (error) {
    const category = /ServerSelection/i.test(error?.name || '')
      ? 'Atlas server selection failed. Check that the cluster is active, the current IP is allowed, and DNS SRV is not blocked by VPN or antivirus.'
      : error?.name === 'MongoServerError'
        ? 'MongoDB authentication failed. Check the Atlas database username, password, and encoded special characters in the URI.'
        : 'MongoDB connection failed. Check the Atlas URI and network configuration.';
    console.error(category);
    throw error;
  }
}
