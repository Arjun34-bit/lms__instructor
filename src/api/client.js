import axios from "axios";
import { envConstant } from "../constants";
import { getAccessToken } from "../utils/localStorageUtils";

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
    if (error.response && error.response.status === 401) {
      localStorage.clear();

      // Redirect to the login page
      window.location.href = "/login";
    } else {
      console.error("API Error:", error.response || error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
