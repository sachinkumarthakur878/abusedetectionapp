import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./SocketIO/server.js";

// ✅ Debug (optional)
console.log("EMAIL_USER:", process.env.EMAIL_USER);

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ FIXED CORS (IMPORTANT)
app.use(
  cors({
    origin: true, // ✅ allow all origins (Vercel + local)
    credentials: true,
  })
);

// ✅ MongoDB connection
const PORT = process.env.PORT || 3001;
const URI = process.env.MONGODB_URI;

try {
  mongoose.connect(URI);
  console.log("Connected to MongoDB");
} catch (error) {
  console.log(error);
}

// ✅ Routes
app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);

// ✅ Server start
server.listen(PORT, () => {
  console.log(`Server is Running on port ${PORT}`);
});