import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../utils/axiosInstance";
import bg from "../assets/chat.jpg";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Signup() {
  const [authUser, setAuthUser] = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password", "");

  // OTP screen state
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (step !== "otp") return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Resend cooldown
  useEffect(() => {
    if (step !== "otp") return;
    setCanResend(false);
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // STEP 1: Form submit → send OTP
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/user/send-otp", {
        fullname: data.fullname,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success(res.data.message);
      setEmail(data.email);
      setStep("otp");
      setTimer(600);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // take last digit only
    setOtp(newOtp);
    // Move to next box
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    if (timer === 0) {
      toast.error("OTP has expired. Please request a new one.");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/user/verify-otp", {
        email,
        otp: otpCode,
      });
      toast.success(res.data.message);
      localStorage.setItem("ChatApp", JSON.stringify(res.data));
      setAuthUser(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "OTP verification failed");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/user/resend-otp", { email });
      toast.success(res.data.message);
      setTimer(600);
      setOtp(["", "", "", "", "", ""]);
      setCanResend(false);
      setResendCooldown(30);
      otpRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ─── SIGNUP FORM ───
  if (step === "form") {
    return (
      <div className="flex h-screen items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}>
        <form onSubmit={handleSubmit(onSubmit)}
          className="border border-white bg-black/80 px-6 py-5 rounded-md space-y-3 w-96">

          <h1 className="text-2xl text-center text-white">
            True<span className="text-teal-400 font-semibold">Chat</span>
          </h1>
          <h2 className="text-xl text-teal-400 font-bold">Create Account</h2>

          {/* Fullname */}
          <label className="input input-bordered flex items-center gap-2 bg-black/80 border text-teal-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
            </svg>
            <input type="text" className="grow bg-transparent outline-none text-white placeholder:text-gray-400"
              placeholder="Full Name"
              {...register("fullname", { required: "Full name is required" })} />
          </label>
          {errors.fullname && <p className="text-red-400 text-xs">{errors.fullname.message}</p>}

          {/* Email */}
          <label className="input input-bordered flex items-center gap-2 bg-black/80 border text-teal-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
              <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
              <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
            </svg>
            <input type="email" className="grow bg-transparent outline-none text-white placeholder:text-gray-400"
              placeholder="Email"
              {...register("email", { required: "Email is required" })} />
          </label>
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}

          {/* Password */}
          <label className="input input-bordered flex items-center gap-2 bg-black/80 border text-teal-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
              <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
            </svg>
            <input type="password" className="grow bg-transparent outline-none text-white placeholder:text-gray-400"
              placeholder="Password (min 6 chars)"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })} />
          </label>
          {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}

          {/* Confirm Password */}
          <label className="input input-bordered flex items-center gap-2 bg-black/80 border text-teal-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
              <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
            </svg>
            <input type="password" className="grow bg-transparent outline-none text-white placeholder:text-gray-400"
              placeholder="Confirm Password"
              {...register("confirmPassword", {
                required: "Please confirm password",
                validate: (v) => v === password || "Passwords do not match"
              })} />
          </label>
          {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}

          <div className="flex justify-between items-center text-white pt-1">
            <p className="text-sm">Have an account?{" "}
              <Link to="/login" className="text-teal-400 underline">Login</Link>
            </p>
            <button type="submit" disabled={loading}
              className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              {loading ? (
                <><span className="loading loading-spinner loading-xs"></span> Sending OTP...</>
              ) : (
                <><span>📧</span> Send OTP</>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─── OTP VERIFICATION SCREEN ───
  return (
    <div className="flex h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}>
      <div className="border border-white bg-black/85 px-6 py-6 rounded-md space-y-4 w-96">

        {/* Header */}
        <h1 className="text-2xl text-center text-white">
          True<span className="text-teal-400 font-semibold">Chat</span>
        </h1>

        {/* Email icon */}
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-500/20 border-2 border-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-xl text-white font-bold">Verify Your Email</h2>
          <p className="text-gray-400 text-sm mt-1">
            We sent a 6-digit OTP to
          </p>
          <p className="text-teal-400 text-sm font-semibold mt-1 break-all">{email}</p>
        </div>

        {/* OTP Boxes */}
        <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (otpRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className={`w-11 h-12 text-center text-xl font-bold rounded-lg border-2 bg-black/60 text-white outline-none transition-all
                ${digit ? "border-teal-400 bg-teal-900/20" : "border-gray-600"}
                focus:border-teal-400 focus:bg-teal-900/10`}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center">
          {timer > 0 ? (
            <p className={`text-sm font-medium ${timer < 60 ? "text-red-400" : "text-gray-400"}`}>
              ⏱️ OTP expires in{" "}
              <span className={`font-bold ${timer < 60 ? "text-red-400" : "text-teal-400"}`}>
                {formatTime(timer)}
              </span>
            </p>
          ) : (
            <p className="text-red-400 text-sm font-medium">⚠️ OTP has expired</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyOtp}
          disabled={loading || otp.join("").length !== 6 || timer === 0}
          className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
          {loading ? (
            <><span className="loading loading-spinner loading-sm"></span> Verifying...</>
          ) : (
            <><span>✅</span> Verify & Create Account</>
          )}
        </button>

        {/* Resend */}
        <div className="text-center">
          {canResend ? (
            <button onClick={handleResend} disabled={loading}
              className="text-teal-400 hover:text-teal-300 text-sm underline disabled:opacity-50 transition-colors">
              🔄 Resend OTP
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Resend OTP in <span className="text-gray-300 font-medium">{resendCooldown}s</span>
            </p>
          )}
        </div>

        {/* Back button */}
        <div className="text-center">
          <button onClick={() => { setStep("form"); setOtp(["", "", "", "", "", ""]); }}
            className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
            ← Back to signup form
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;