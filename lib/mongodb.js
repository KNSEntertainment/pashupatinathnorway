import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
	throw new Error("Please define the MONGODB_URI environment variable");
}
let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
	if (cached.conn) {
		// Check if connection is still alive
		if (mongoose.connection.readyState === 1) {
			return cached.conn;
		} else {
			// Connection is dead, reset and reconnect
			cached.conn = null;
			cached.promise = null;
		}
	}

	if (!cached.promise) {
		cached.promise = mongoose.connect(MONGODB_URI, {
			bufferCommands: false,
		});
	}
	
	try {
		cached.conn = await cached.promise;
		return cached.conn;
	} catch (error) {
		console.error("MongoDB connection error:", error);
		cached.promise = null;
		throw error;
	}
}

export default connectDB;
