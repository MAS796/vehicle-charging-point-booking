/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

// Create Auth Context
export const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Manages authentication state globally
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const syncFromStorage = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Keep role in sync with current logged-in user to avoid stale admin view.
          const resolvedRole = (
            parsedUser?.role ||
            (parsedUser?.is_admin ? "admin" : "user")
          ).toLowerCase();
          localStorage.setItem("role", resolvedRole);
        } catch (e) {
          console.error("Error parsing stored user:", e);
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          localStorage.removeItem("email");
          setUser(null);
          setToken(null);
        }
      } else {
        // Clear related auth items if token is missing
        if (storedToken || storedUser) {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          localStorage.removeItem("email");
        }
        setUser(null);
        setToken(null);
      }
    };

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("authChanged", syncFromStorage);
    setLoading(false);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("authChanged", syncFromStorage);
    };
  }, []);

  // Login function
  const login = (authData) => {
    const { access_token, refresh_token, role, user: userData } = authData;
    
    localStorage.setItem("token", access_token);
    if (refresh_token) {
      localStorage.setItem("refresh_token", refresh_token);
    }
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("email", userData.email);
    localStorage.setItem("role", role || (userData.is_admin ? "admin" : "user"));
    
    setToken(access_token);
    setUser(userData);
  };

  // Logout function
  const logout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await api.post("/auth/logout", { refresh_token: refreshToken });
      } catch {
        // best effort logout
      }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    
    setToken(null);
    setUser(null);
  };

  const logoutAllDevices = async () => {
    try {
      await api.post("/auth/logout-all");
    } catch {
      // best effort logout-all
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      setToken(null);
      setUser(null);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.is_admin === true;
  };

  // Get user role
  const getRole = () => {
    if (user) {
      return (
        user.role ||
        (user.is_admin ? "admin" : "user")
      );
    }
    return localStorage.getItem("role") || "user";
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    logoutAllDevices,
    isAuthenticated,
    isAdmin,
    getRole,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
