import mongoose from "mongoose";

export async function connectDatabase() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI is missing. Add it to server/.env.");
    }

    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDatabase() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
}
