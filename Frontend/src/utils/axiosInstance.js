import axios from "axios";

// FIX: axiosInstance was using hardcoded production URL with empty string fallback for dev.
// Empty string baseURL causes issues — use env var consistently.
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default axiosInstance;
