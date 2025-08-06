import axios from "axios";
import { envConstant } from "../constants";
import { getAccessToken } from "../utils/localStorageUtils";
import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const handleUnauthorized = (message) => {
  localStorage.clear();
  toast.error(message || "Please login again.");

  // Emit an event that React can listen to
  window.dispatchEvent(new CustomEvent("unauthorized"));
};

console.log(envConstant.BACKEND_BASE_URL);

const axiosClient = axios.create({
  baseURL: envConstant.BACKEND_BASE_URL,
  timeout: 10000, // Request timeout
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      handleUnauthorized(error?.response?.data?.message || error?.message);
    } else {
      toast.error(error?.response?.data?.message || error?.message);
    }
    return Promise.reject(error);
  }
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // Retry failed requests once
    },
  },
});

export default axiosClient;
