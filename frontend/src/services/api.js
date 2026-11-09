import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  // 🔴 CRITICAL: This tells Axios to automatically send your secure cookies with every request
  withCredentials: true,
});
// Auth endpoints that handle their own 401s
const AUTH_URLS = ["/auth/login", "/auth/me", "/auth/logout"];

let unauthorizedHandler = null;
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// NOTE: The request interceptor has been completely removed!
// The browser's native cookie management handles it automatically now.

// Intercept incoming responses to catch expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const isAuthCall = AUTH_URLS.some((path) => url.includes(path));
    // Check if the error is 401 AND the request was NOT going to the login route
    if (error.response?.status === 401 && !isAuthCall) {
      unauthorizedHandler?.(); // AuthProvider clears the user
    }
    return Promise.reject(error);
  },
);

export default api;
