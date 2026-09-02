import { apiV1 } from "./client";

/* -------------------- TYPES -------------------- */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "borrower" | "lender" | "admin";
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

/* -------------------- AUTH APIs -------------------- */

// Register
export const registerUser = (data: RegisterPayload) => {
  return apiV1.post<AuthResponse>("/auth/register", data);
};

// Login
export const loginUser = (data: LoginPayload) => {
  return apiV1.post<AuthResponse>("/auth/login", data);
};

// Get current user
export const getCurrentUser = () => {
  return apiV1.get("/auth/me");
};
