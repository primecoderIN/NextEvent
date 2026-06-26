import axios from "axios";

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/account/refresh-token`,
          {},
          { withCredentials: true }
        );
        const data = response.data;
        localStorage.setItem("token", data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return axiosHttpAgent(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        // We could redirect to login here if needed
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
