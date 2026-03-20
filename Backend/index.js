import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./SocketIO/server.js";

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// CORS config:
// - Production (Render): ALLOWED_ORIGINS env variable set karo → strict allowlist
// - Agar ALLOWED_ORIGINS nahi set: all origins allow (development + quick deploy ke liye)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : null; // null = sab allow

app.use(
  cors({
    origin: function (origin, callback) {
      // No origin = same-origin / curl / mobile app — always allow
      if (!origin) return callback(null, true);
      // Agar allowlist set hai to check karo, warna sab allow
      if (!allowedOrigins || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const PORT = process.env.PORT || 3001;
const URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();

app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

server.listen(PORT, () => {
  console.log(`Server is Running on port ${PORT}`);
});