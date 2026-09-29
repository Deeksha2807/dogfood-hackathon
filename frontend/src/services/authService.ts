import { apiClient } from "./apiClient";
import { User } from "../types";

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleAuthInput {
  credential?: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export interface GoogleAuthResponse extends AuthResponse {
  role?: "ADMIN" | "ORGANIZER" | "JUDGE" | "PARTICIPANT";
  token?: string;
}

export const authService = {
  async register(data: RegisterInput): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/api/auth/register", data);
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/api/auth/login", data);
    return res;
  },

  async loginWithGoogle(data: GoogleAuthInput): Promise<GoogleAuthResponse> {
    const res = await apiClient.post<GoogleAuthResponse>("/api/auth/google", data);
    if (res.token) {
      apiClient.setToken(res.token);
    }
    return res;
  },

  async logout(): Promise<{ message: string }> {
    try {
      const res = await apiClient.post<{ message: string }>("/api/auth/logout");
      apiClient.setToken(null);
      return res;
    } catch (e) {
      apiClient.setToken(null);
      return { message: "Logged out" };
    }
  },

  async getMe(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>("/api/auth/me");
  },
};
