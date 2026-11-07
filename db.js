
import mongoose from "mongoose";

let connectionPromise = null;

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in environment variables");
    }

    // Already connected
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // Reuse pending connection
    if (!connectionPromise) {
      connectionPromise = mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 5,
        minPoolSize: 0,
      });
    }

    const conn = await connectionPromise;

    console.log(
      `Connected to MongoDB database: ${conn.connection.host}`
    );

    return conn.connection;

  } catch (error) {
    connectionPromise = null;

    console.error("MongoDB Connection Error:", error.message);

    throw error;
  }
};

export default connectDB;
