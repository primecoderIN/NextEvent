import axios from "axios";

const sleep = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

export const axiosHttpAgent = axios.create({
  baseURL: "https://localhost:5001/api",
});

axiosHttpAgent.interceptors.response.use(async (response) => {
  try {
    await sleep(1000);

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
});
