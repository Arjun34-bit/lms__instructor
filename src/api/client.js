import axios from "axios";
import {
  getAdminAccessToken,
  getUserAccessToken,
  removeAdminAccessToken,
  removeUserAccessToken,
} from "../utils/localStorageUtils";
import { envConstant } from "../constants";

const axiosClient = axios.create({
  baseURL: envConstant.BACKEND_BASE_URL,
  timeout: 10000, // Request timeout
});

axiosClient.interceptors.request.use(
  (config) => {
    // Determine the appropriate token based on the route
    const isAdminRoute = config.url?.startsWith("/api/admin");
    const token = isAdminRoute ? getAdminAccessToken() : getUserAccessToken();

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
      const isAdminRoute = config.url?.startsWith("/api/admin");
      if (isAdminRoute) {
        removeAdminAccessToken();
      } else {
        removeUserAccessToken();
      }

      // Redirect to the sign-in page
      window.location.href = "/sign-in";
    } else {
      console.error("API Error:", error.response || error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
