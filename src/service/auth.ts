import api from "./api";

import type {
  LoginRequest,
  LoginResponse,
  CurrentUserResponse,
  User,
} from "../types/auth.types";

interface ApiResponse {
  success: boolean;
  message: string;
}

interface UpdateProfileRequest {
  name: string;
  email: string;
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
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

// Get Current User
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await api.get<CurrentUserResponse>("/auth/me");

  return response.data;
};

// Update Current User Profile
export const updateCurrentUser = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const response = await api.patch<UpdateProfileResponse>(
    "/auth/me",
    data
  );

  return response.data;
};

// Change Password
export const changeCurrentPassword = async (
  data: ChangePasswordRequest
): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(
    "/auth/change-password",
    data
  );

  return response.data;
};

// Register API
export const registerUser = async (
  data: {
    name: string;
    email: string;
    password: string;
  }
): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/register", data);

  return response.data;
};

// Forgot Password
export const requestPasswordReset = async (
  email: string
): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/forgot-password", {
    email,
  });

  return response.data;
};

// Reset Password
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
