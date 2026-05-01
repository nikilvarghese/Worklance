import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    } else if (error.response?.status === 403 && error.response?.data?.requiresPasswordSet) {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (window.location.pathname !== "/set-password") {
        window.location.href = `/set-password?token=${token}&role=${role}`;
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
