import axios from "axios";

// Dynamically set baseURL based on environment
const isDevelopment = process.env.NODE_ENV !== "production";
const baseURL = process.env.REACT_APP_API_URL || (isDevelopment ? "http://localhost:5000/api" : "https://worklance.onrender.com/api");

const instance = axios.create({
  baseURL,
  timeout: 15000, // Added 15s timeout for API calls
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Console logs for debugging
  console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.baseURL || ""}${config.url}`);
  return config;
}, (error) => {
  console.error("[Axios Request Error]", error);
  return Promise.reject(error);
});

instance.interceptors.response.use(
  (response) => {
    console.log(`[Axios Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    // Proper error handling for 404, network, timeout
    if (error.response) {
      console.error(`[Axios Response Error] ${error.response.status} from ${error.config?.url}:`, error.response.data);
      
      if (error.response.status === 404) {
        console.error("The requested endpoint was not found (404). Please check the URL.");
      } else if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
      } else if (error.response.status === 403 && error.response.data?.requiresPasswordSet) {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (window.location.pathname !== "/set-password") {
          window.location.href = `/set-password?token=${token}&role=${role}`;
        }
      }
    } else if (error.request) {
      console.error("[Axios Network Error] No response received from server. Check your network connection or server status.");
      if (error.code === 'ECONNABORTED') {
        console.error("The request timed out. The server might be slow or down.");
      }
    } else {
      console.error("[Axios Configuration Error]", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default instance;
