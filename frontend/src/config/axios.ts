import axios from "axios";
import type ApiResponse from "../common/types/ApiResponse";
import type AuthResponse from "../auth/types/response/AuthResponse";
import type TokenRefreshRequest from "../auth/types/request/TokenRefreshRequest";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 and Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request has not been retried yet
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Send request to refresh token endpoint
          const payload: TokenRefreshRequest = { refreshToken };
          const response = await axios.post<ApiResponse<AuthResponse>>(
            `${baseURL}/auth/refresh`,
            payload,
          );

          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken: newRefreshToken } =
              response.data.data;

            // Store new tokens
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            // Update header and retry the original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error(
            "Session expired or refresh token invalid:",
            refreshError,
          );

          // Clear credentials and force redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("currentUser");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
