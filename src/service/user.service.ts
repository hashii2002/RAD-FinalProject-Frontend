import api from "./api";
import type { User, UserRole } from "../types/user.types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>("/users");
  return response.data.data;
};

export const getUserById = async (
  userId: string
): Promise<User> => {
  const response = await api.get<ApiResponse<User>>(
    `/users/${encodeURIComponent(userId)}`
  );

  return response.data.data;
};

export const createUser = async (
  userData: CreateUserRequest
): Promise<User> => {
  const response = await api.post<ApiResponse<User>>(
    "/users",
    userData
  );

  return response.data.data;
};

export const updateUser = async (
  userId: string,
  userData: UpdateUserRequest
): Promise<User> => {
  const response = await api.put<ApiResponse<User>>(
    `/users/${encodeURIComponent(userId)}`,
    userData
  );

  return response.data.data;
};
