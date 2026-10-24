import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null); // Create a context for authentication

export const AuthProvider = ({ children }) => {
  // 1. Authentication state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 2. Derived authentication status
  const isAuthenticated = Boolean(user);

  // 3. Restore or refresh the logged-in user's profile.
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");

      // backend returns: {data:{role, user}}
      const userData = data?.data?.user;

      if (!userData) {
        setUser(null);
        return null;
      }
      // Include the role returned separately by your backend.
      const normalizedUser = {
        ...userData,
        role: data.data.role ?? userData.role,
      };

      setUser(normalizedUser);

      return normalizedUser;
    } catch (error) {
      // A 401 means there is no valid authenticated session.
      if (error.response?.status === 401) {
        setUser(null);
      } else {
        // Keep the existing user on temporary network/server errors.
        console.error("Failed to refresh the user profile:", error);
      }

      return null;
    }
  }, []);

  // 4. Verify the cookie when the application starts
  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!active) return;
        const userData = data?.data?.user;
        if (!userData) {
          setUser(null);
          return;
        }

        setUser({
          ...userData,
          role: data.data.role ?? userData.role,
        });
      } catch (error) {
        if (!active) return;

        if (error.response?.status === 401) {
          setUser(null);
        } else {
          console.error("Authentication initialization failed:", error);
        }
      } finally {
        if (active) {
          setIsLoading(false);
          console.log("Auth initialization finished");
        }
      }
    };
    initializeAuth();

    return () => {
      active = false;
    };
  }, []);

  // 5. Call after the login endpoint succeeds and sets the cookie.
  const login = (userData) => {
    if (!userData) {
      throw new Error("User data is required to log in.");
    }
    setUser(userData);
  };

  // 6. Log out through the backend
  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // backend use GET /auth/logout.
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Always clear the local authentication state.
      setUser(null);
      window.location.replace("/");
    }
  };

  // 7. Share authentication state and methods
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isLoggingOut,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
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
