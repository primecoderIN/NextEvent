import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserDTOWithRoles, LoginFormValues, RegisterFormValues } from "./types";
import type { ApiResponse } from "@/Types/ApiResponse";
import { axiosHttpAgent } from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: UserDTOWithRoles | null;
  loading: boolean;
  login: (data: LoginFormValues) => Promise<void>;
  register: (data: RegisterFormValues) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTOWithRoles | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    try {
      // Attempt to get user via refresh-token cookie.
      // Response is now ApiResponse<UserDTO> — payload lives in .data.data
      const response = await axiosHttpAgent.post<ApiResponse<UserDTOWithRoles>>("/account/refresh-token");
      const user = response.data.data!;
      localStorage.setItem("token", user.token);
      setUser(user);
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
    // Response is now ApiResponse<UserDTO> — payload lives in .data.data
    const response = await axiosHttpAgent.post<ApiResponse<UserDTOWithRoles>>("/account/login", data);
    const user = response.data.data!;
    setToken(user.token);
    setUser(user);
  };

  const register = async (data: RegisterFormValues) => {
    const payload = {
      displayName: data.name,
      userName: data.name.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random() * 1000),
      email: data.email,
      password: data.password
    };
    // Response is now ApiResponse<UserDTO> — payload lives in .data.data
    const response = await axiosHttpAgent.post<ApiResponse<UserDTOWithRoles>>("/account/register", payload);
    const user = response.data.data!;
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
