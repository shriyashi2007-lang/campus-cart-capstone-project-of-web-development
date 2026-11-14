import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes.js';
import { connectDB } from './config/db.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());
app.use('/api/health', healthRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB().finally(() => app.listen(port, () => console.log(`Campus Cart API listening on ${port}`)));
