import mongoose from "mongoose";
import User from "@/models/User";

// Reuse one connection across requests (and across hot reloads in dev).
// Without this every request re-ran the handshake, which showed up as a slow
// first paint on server-rendered pages.
let cached = global._ncMongoose;
if (!cached) {
  cached = global._ncMongoose = { conn: null, promise: null };
}

const connectMongo = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((e) => {
        // Let the next call retry instead of caching a dead connection.
        cached.promise = null;
        console.error("Mongoose Client Error: " + e.message);
      });
  }

  return cached.promise;
};

export default connectMongo;
