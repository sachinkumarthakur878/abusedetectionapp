import express from "express";
import {
  signup,
  login,
  logout,
  allUsers,
  sendOtp,
  verifyOtpAndSignup,
  resendOtp,
} from "../controller/user.controller.js";
import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();

// Tumhare original routes — nahi badle
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/allusers", secureRoute, allUsers);

// Naye OTP routes — sirf yeh add kiye
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndSignup);
router.post("/resend-otp", resendOtp);

export default router;