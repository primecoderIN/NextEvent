import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserDTOWithRoles, LoginFormValues, RegisterFormValues } from "../types";
import type { ApiResponse } from "@/types/ApiResponse";
import { axiosHttpAgent } from "@/shared/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: UserDTOWithRoles | null;
  loading: boolean;
  login: (data: LoginFormValues) => Promise<UserDTOWithRoles>;
  register: (data: RegisterFormValues) => Promise<UserDTOWithRoles>;
  switchProfile: (profile: "Member" | "Organizer") => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTOWithRoles | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUser();
  }, [loadUser]);

  const setToken = (token: string) => {
    localStorage.setItem("token", token);
  };

  const login = async (data: LoginFormValues): Promise<UserDTOWithRoles> => {
    // Response is now ApiResponse<UserDTO> — payload lives in .data.data
    const response = await axiosHttpAgent.post<ApiResponse<UserDTOWithRoles>>("/account/login", data);
    const user = response.data.data!;
    setToken(user.token);
    setUser(user);
    return user;
  };

  const register = async (data: RegisterFormValues): Promise<UserDTOWithRoles> => {
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
    return user;
  };

  const switchProfile = async (profile: "Member" | "Organizer") => {
    const response = await axiosHttpAgent.post<ApiResponse<UserDTOWithRoles>>("/account/switch-profile", { profile });
    const updatedUser = response.data.data!;
    setToken(updatedUser.token);
    setUser(updatedUser);
    queryClient.clear();
  };

  const logout = async () => {
    try {
      await axiosHttpAgent.post("/account/logout");
    } catch(err) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      queryClient.clear();
      navigate("/");
      toast.success("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, switchProfile, logout, setToken }}>
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
