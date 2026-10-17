import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  // 🔴 CRITICAL: This tells Axios to automatically send your secure cookies with every request
  withCredentials: true,
});

// NOTE: The request interceptor has been completely removed!
// The browser's native cookie management handles it automatically now.

// Intercept incoming responses to catch expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is 401 AND the request was NOT going to the login route
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes("/login")
    ) {
      // We no longer remove the token, just the user
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
