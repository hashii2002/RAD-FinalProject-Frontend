import {createContext, useState, useEffect, useCallback,} from "react";
import type { ReactNode } from "react";
import api from "../service/api";
import type{ User, AuthContextType,} from "../types/auth.types";
import {loginUser, getCurrentUser,} from "../service/auth";

const TOKEN_KEY = "pawpath_token";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);

      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        if (response.success) {
          setUser(response.data);
          setToken(savedToken);
        }
      } catch (error) {
        console.error("User verification failed:", error);

        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const response = await loginUser({
        email,
        password,
      });

      if (!response.success || !response.data.token) {
        throw new Error(response.message || "Login failed");
      }

      const receivedToken = response.data.token;
      const loggedInUser = response.data.user;

      localStorage.setItem(TOKEN_KEY, receivedToken);

      api.defaults.headers.common.Authorization = `Bearer ${receivedToken}`;

      setToken(receivedToken);
      setUser(loggedInUser);

      return loggedInUser;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);

    delete api.defaults.headers.common.Authorization;

    setToken(null);
    setUser(null);
  }, []);

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};