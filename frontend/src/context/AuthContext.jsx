import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api, { setUnauthorizedHandler } from "../services/api";
import { fetchCurrentUser } from "../services/authService";

const AuthContext = createContext(null); // Create a context for authentication

export const AuthProvider = ({ children }) => {
  // 1. Authentication state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutInFlight = useRef(false);

  // 2. Derived authentication status
  const isAuthenticated = Boolean(user);

  // 3. Restore or refresh the logged-in user's profile.
  // Returns the user, or null if the session is gone (401).
  // Throws on network/server errors so callers can tell the difference.
  const refreshUser = useCallback(async () => {
    try {
      const current = await fetchCurrentUser();
      setUser(current);
      return current;
    } catch (error) {
      // A 401 means there is no valid authenticated session.
      if (error.response?.status === 401) {
        setUser(null);
        return null;
      }
      throw error; // Keep the existing user on temporary network/server errors.
    }
  }, []);

  // 4. Verify the cookie when the application starts
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const current = await fetchCurrentUser();
        if (active) setUser(current);
      } catch (error) {
        if (!active) return;
        if (error.response?.status === 401) setUser(null);
        else console.error("Authentication initialization failed:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Let the axios interceptor log the user out of the UI on a mid-session 401
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  // 5. Call after the login endpoint succeeds and sets the cookie.
  // The user shape always comes from /auth/me, so role is merged consistently.
  const login = useCallback(() => refreshUser(), [refreshUser]);

  // 6. Log out through the backend
  const logout = useCallback(async () => {
    if (logoutInFlight.current) return;
    logoutInFlight.current = true;
    setIsLoggingOut(true);
    try {
      // backend use GET /auth/logout.
      await api.get("/auth/logout");
    } catch (error) {
      // 401 means the session was already gone, which is fine.
      // Anything else: the cookie may still be valid, so stay logged in and let the caller show an error.
      if (error.response?.status !== 401) {
        logoutInFlight.current = false;
        setIsLoggingOut(false);
        throw error;
      }
    }
    setUser(null);
    window.location.replace("/"); // full reload clears all in-memory state
  }, []);

  // 7. Share authentication state and methods
  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      isLoggingOut,
      login,
      logout,
      refreshUser,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      isLoggingOut,
      login,
      logout,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 8. Custom hook for accessing authentication state.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }
  return context;
};
