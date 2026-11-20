import mongoose from 'mongoose';

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured. Add it to server/.env.');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('MongoDB connected successfully.');
    return mongoose.connection;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.name}: ${error.message}`);
    throw error;
  }
}
