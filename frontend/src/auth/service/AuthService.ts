import axios from "axios";
import api from "../../config/axios";
import type ApiResponse from "../../common/types/response/ApiResponse";
import type LoginRequest from "../types/request/LoginRequest";
import type RegisterRequest from "../types/request/RegisterRequest";
import type AuthResponse from "../types/response/AuthResponse";

// Helper function to extract error messages from Axios errors
function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

// Login function
export async function login(req: LoginRequest) {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      req,
    );
    if (response.data.success && response.data.data) {
      return { success: true as const, data: response.data.data };
    }
    return {
      success: false as const,
      error: response.data.message || "Login failed.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Login failed."),
    };
  }
}

// Register function
export async function register(req: RegisterRequest) {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      req,
    );
    if (response.data.success && response.data.data) {
      return { success: true as const, data: response.data.data };
    }
    return {
      success: false as const,
      error: response.data.message || "Registration failed.",
    };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Registration failed."),
    };
  }
}

// Logout function
export async function logout(refreshToken: string) {
  try {
    await api.post("/auth/logout", { refreshToken });
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: extractError(error, "Logout failed."),
    };
  }
}

const AuthService = {
  login,
  register,
  logout,
};

export default AuthService;
