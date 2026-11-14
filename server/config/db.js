import mongoose from 'mongoose';

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI not set; starting without a database connection.');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');
  } catch (error) {
    console.warn(`MongoDB unavailable; continuing without it: ${error.message}`);
  }
}
