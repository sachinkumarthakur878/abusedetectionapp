import axios from "axios";

const BASE_URL = import.meta.env.MODE === "production"
  ? "https://abusedetectionapp.onrender.com"
  : "";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default axiosInstance;