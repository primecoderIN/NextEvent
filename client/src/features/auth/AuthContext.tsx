import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserDTO, LoginFormValues, RegisterFormValues } from "./types";
import { axiosHttpAgent } from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: UserDTO | null;
  loading: boolean;
  login: (data: LoginFormValues) => Promise<void>;
  register: (data: RegisterFormValues) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    try {
      // Attempt to get user via refresh-token cookie
      // If we don't have a cookie, this will fail and we just set loading to false.
      const response = await axiosHttpAgent.post("/account/refresh-token");
      const data = response.data;
      localStorage.setItem("token", data.token);
      setUser(data);
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const setToken = (token: string) => {
    localStorage.setItem("token", token);
  };

  const login = async (data: LoginFormValues) => {
    const response = await axiosHttpAgent.post("/account/login", data);
    const user = response.data;
    setToken(user.token);
    setUser(user);
  };

  const register = async (data: RegisterFormValues) => {
    // We expect the backend to want Name/UserName. The form has 'name'. 
    // We map 'name' to 'displayName' and 'userName' just in case.
    const payload = {
      displayName: data.name,
      userName: data.name.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random() * 1000),
      email: data.email,
      password: data.password
    };
    const response = await axiosHttpAgent.post("/account/register", payload);
    const user = response.data;
    setToken(user.token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await axiosHttpAgent.post("/account/logout");
    } catch(err) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/");
      toast.success("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
