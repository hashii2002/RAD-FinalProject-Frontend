export type UserRole = "ADMIN" | "TRAINER" | "CUSTOMER";

export interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}