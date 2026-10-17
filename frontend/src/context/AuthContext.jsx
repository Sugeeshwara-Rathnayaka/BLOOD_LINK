import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Robust Lazy Initialization
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    // FIX: Protect against the "undefined" string bug
    if (storedUser && storedUser !== "undefined") {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        // Clean up corrupted storage immediately
        localStorage.removeItem("user");
        return null;
      }
    }
    return null;
  });

  // Derived state: A clean boolean you can use in your protected routes
  const isAuthenticated = !!user;

  // 2. Login function
  const login = (userData) => {
    // The backend already attached the secure cookie in the response headers.
    // We only need to save the user profile data.
    // Safety check before saving
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  };

  // 3. Logout function
  const logout = async () => {
    try {
      // 🔴 You MUST tell the backend to clear the secure cookie
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      window.location.href = "/";
    }
  };

  // 4. BACKGROUND SYNC: Silently verify the session with the backend.
  useEffect(() => {
    const verifySession = async () => {
      if (localStorage.getItem("user")) {
        try {
          // Axios will automatically include the secure cookie here
          const { data } = await api.get("/auth/me");
          if (data && data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
          }
        } catch (error) {
          console.error("Session invalid or expired.", error);
          localStorage.removeItem("user"); // Clear corrupted or expired session
          setUser(null); // Ensure the app knows the user is logged out
        }
      }
    };
    verifySession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Custom hook with the Vite Fast Refresh ignore flag
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
