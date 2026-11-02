import api from "./api";
import type {
  LoginRequest,
  LoginResponse,
  CurrentUserResponse,
} from "../types/auth.types";

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