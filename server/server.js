import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env');
dotenv.config({ path: envPath });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'campus-cart-api' });
});

const port = process.env.PORT || 5000;

try {
  const server = await new Promise((resolve, reject) => {
    const httpServer = app.listen(port, () => resolve(httpServer));
    httpServer.once('error', reject);
  });

  try {
    await connectDB();
  } catch (error) {
    await new Promise(resolve => server.close(resolve));
    console.error(`Backend startup aborted because MongoDB could not be connected: ${error.name}.`);
    process.exit(1);
  }

  console.log(`Campus Cart API listening on ${port}`);
  const shutdown = signal => {
    console.log(`Received ${signal}; shutting down Campus Cart API.`);
    server.close(async () => {
      await mongoose.connection.close().catch(() => undefined);
      process.exit(0);
    });
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
} catch (error) {
  if (error?.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the existing Campus Cart backend before starting another instance.`);
  } else {
    console.error(`Backend startup failed: ${error.message}`);
  }
  process.exitCode = 1;
}
