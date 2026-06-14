import axios from "axios";

const sleep = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

export const axiosHttpAgent = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosHttpAgent.interceptors.response.use(async (response) => {
  try {
    await sleep(1000);

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
});
