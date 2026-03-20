import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true, // FIX: Added trim to prevent whitespace-only names
      minlength: [2, "Full name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // FIX: Normalize emails to lowercase for consistent lookups
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
    },
    // FIX: Removed confirmPassword field — should never be stored in DB (even hashed)
    // confirmPassword was in the schema but serves no purpose post-validation
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
