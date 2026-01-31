import axios from "axios";

// Get backend URL - use /api for production (nginx proxy) or localhost for dev
const getBackendURL = () => {
  // In production (Docker/EC2), use /api which nginx will proxy to backend
  if (process.env.NODE_ENV === "production") {
    return "/api";
  }
  // If REACT_APP_API_URL is set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // Development: use localhost backend
  return "http://127.0.0.1:8000";
};

const api = axios.create({
  baseURL: getBackendURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("email");
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;
