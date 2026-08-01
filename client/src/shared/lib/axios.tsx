import axios from "axios";
import type { ApiResponse } from "@/types/ApiResponse";
import type { UserDTO } from "@/features/auth/types";

const sleep = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

export const axiosHttpAgent = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosHttpAgent.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosHttpAgent.interceptors.response.use(
  async (response) => {
    // Add artificial delay for dev
    await sleep(1000);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/account/refresh-token") ||
      requestUrl.includes("/account/login") ||
      requestUrl.includes("/account/register");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        // refresh-token now returns ApiResponse<UserDTO> — payload is in .data.data
        const response = await axios.post<ApiResponse<UserDTO>>(
          `${import.meta.env.VITE_API_URL}/account/refresh-token`,
          {},
          { withCredentials: true }
        );
        const user = response.data.data!;
        localStorage.setItem("token", user.token);
        originalRequest.headers.Authorization = `Bearer ${user.token}`;
        return axiosHttpAgent(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
