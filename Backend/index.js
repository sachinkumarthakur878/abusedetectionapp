import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./SocketIO/server.js";

// FIX: Remove debug console.log of sensitive env vars in production
if (process.env.NODE_ENV !== "production") {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
}

app.use(express.json({ limit: "10mb" })); // FIX: Added size limit to prevent payload attacks
app.use(cookieParser());

// FIX: Replace `origin: true` (allows ALL origins) with explicit allowlist or env-based config
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.) and allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
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

// FIX: MongoDB connection should use async/await with proper error handling and exit on failure
const connectDB = async () => {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // FIX: Exit process on DB failure instead of silently continuing
  }
};

connectDB();

app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);

// FIX: Added global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

server.listen(PORT, () => {
  console.log(`Server is Running on port ${PORT}`);
});
