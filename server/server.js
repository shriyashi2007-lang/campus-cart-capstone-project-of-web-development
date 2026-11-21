import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB, databaseStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env');
dotenv.config({ path: envPath });

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use((req, res, next) => {
  if (req.path === '/api/health' || databaseStatus() === 'connected') return next();
  return res.status(503).json({ success: false, message: 'Database is not ready.' });
});

app.get('/api/health', (_req, res) => {
  const database = databaseStatus();
  res.status(database === 'connected' ? 200 : 503).json({ status: database === 'connected' ? 'ok' : 'error', service: 'campus-cart-api', database });
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
