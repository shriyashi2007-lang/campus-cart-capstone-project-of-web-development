import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(serverDir, '.env') });

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.error('MongoDB check failed: MONGODB_URI/MONGO_URI is missing.');
  process.exit(1);
}

let host = 'unknown';
try { host = new URL(uri).hostname; } catch { console.error('MongoDB check failed: URI format is invalid.'); process.exit(1); }

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const databaseName = mongoose.connection.name;
  const productCount = await mongoose.connection.db.collection('products').countDocuments();
  console.log(`MongoDB connection succeeded: ${host}`);
  console.log(`Database=${databaseName} Collection=products Documents=${productCount}`);
  await mongoose.disconnect();
} catch (error) {
  console.error(`MongoDB connection failed: ${error.name}; host=${host}`);
  process.exitCode = 1;
}
