import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import createTokenAndSaveCookie from "../jwt/generateToken.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";

// ─────────────────────────────────────────
// TUMHARA ORIGINAL CODE — BILKUL NAHI BADLA
// ─────────────────────────────────────────

export const signup = async (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already registered" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await new User({ fullname, email, password: hashPassword });
    await newUser.save();
    if (newUser) {
      const token = createTokenAndSaveCookie(newUser._id, res);
      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          _id: newUser._id,
          fullname: newUser.fullname,
          email: newUser.email,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user || !isMatch) {
      return res.status(400).json({ error: "Invalid user credential" });
    }
    const token = createTokenAndSaveCookie(user._id, res);
    res.status(201).json({
      message: "User logged in successfully",
      token,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(201).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const allUsers = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select("-password");
    res.status(201).json(filteredUsers);
  } catch (error) {
    console.log("Error in allUsers Controller: " + error);
  }
};

// ─────────────────────────────────────────
// NAYE OTP FUNCTIONS — SIRF YEH ADD KIE
// ─────────────────────────────────────────

const otpStore = new Map();

export const sendOtp = async (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;
  try {
    if (!fullname || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered. Please login." });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;
    const hashPassword = await bcrypt.hash(password, 10);
    otpStore.set(email, {
      otp,
      expiry,
      userData: { fullname, email, password: hashPassword },
      attempts: 0,
    });
    await sendOtpEmail(email, otp, fullname);
    console.log(`OTP sent to ${email}: ${otp}`);
    return res.status(200).json({ message: "OTP sent successfully! Please check your email." });
  } catch (error) {
    console.log("Error in sendOtp:", error);
    return res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

export const verifyOtpAndSignup = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
    const stored = otpStore.get(email);
    if (!stored) {
      return res.status(400).json({ error: "OTP expired or not found. Please signup again." });
    }
    if (Date.now() > stored.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP has expired. Please signup again." });
    }
    if (stored.attempts >= 5) {
      otpStore.delete(email);
      return res.status(400).json({ error: "Too many wrong attempts. Please signup again." });
    }
    if (stored.otp !== otp.toString().trim()) {
      stored.attempts += 1;
      otpStore.set(email, stored);
      const remaining = 5 - stored.attempts;
      return res.status(400).json({
        error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      });
    }
    const { fullname, password } = stored.userData;
    otpStore.delete(email);
    const newUser = new User({ fullname, email, password });
    await newUser.save();
    const token = createTokenAndSaveCookie(newUser._id, res);
    return res.status(201).json({
      message: "Account created successfully! Welcome to TrueChat",
      token,
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log("Error in verifyOtpAndSignup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const stored = otpStore.get(email);
    if (!stored) {
      return res.status(400).json({ error: "Session expired. Please fill the signup form again." });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, { ...stored, otp, expiry, attempts: 0 });
    await sendOtpEmail(email, otp, stored.userData.fullname);
    console.log(`OTP resent to ${email}: ${otp}`);
    return res.status(200).json({ message: "New OTP sent! Please check your email." });
  } catch (error) {
    console.log("Error in resendOtp:", error);
    return res.status(500).json({ error: "Failed to resend OTP. Please try again." });
  }
};