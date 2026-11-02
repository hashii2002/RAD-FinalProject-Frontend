import api from "./api";
import type {LoginRequest, LoginResponse, CurrentUserResponse,} from "../types/auth.types";

interface ApiResponse {
  success: boolean;
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Login API
export const loginUser = async (
  loginData: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    loginData
  );

  return response.data;
};

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await api.get<CurrentUserResponse>("/auth/me");

  return response.data;
};

export const registerUser = async (
  data: RegisterRequest
): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/register", data);

  return response.data;
};

export const requestPasswordReset = async (
  email: string
): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const resetUserPassword = async (
  token: string,
  newPassword: string
): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>(
    `/auth/reset-password/${encodeURIComponent(token)}`,
    { newPassword }
  );

  return response.data;
};