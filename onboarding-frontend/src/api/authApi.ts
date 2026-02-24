import { startAutoLogoutTimer } from "../utils/tokenService";
import axios from "axios";
import {
  type LoginRequest,
  type LoginResponse,
  type ActivateAccountRequest,
  type TokenInfo,
  type CreateEmployeeRequest,
  type User,
} from "../types/auth";

const API_BASE = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});


// ✅ 1. REQUEST INTERCEPTOR (ajouter token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// ✅ 2. RESPONSE INTERCEPTOR (detecter token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (
      error.response &&
      error.response.data &&
      error.response.data.message &&
      error.response.data.message.includes("JWT expired")
    ) {

      console.log("❌ Token expiré → déconnexion automatique");

      // Supprimer token
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_id");

      // Rediriger vers login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


// ─── AUTH ─────────────────────────────

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", data);

  const token = response.data.token;

  localStorage.setItem("jwt_token", token);

  startAutoLogoutTimer(token);

  return response.data;
};

export const activateAccountApi = async (
  data: ActivateAccountRequest
): Promise<string> => {
  const response = await api.post<string>("/auth/activate", data);
  return response.data;
};

export const getTokenInfoApi = async (token: string): Promise<TokenInfo> => {
  const response = await api.get<TokenInfo>(`/auth/token-info?token=${token}`);
  return response.data;
};

export const createEmployeeApi = async (
  data: CreateEmployeeRequest
): Promise<string> => {
  const response = await api.post<string>("/auth/create-employee", data);
  return response.data;
};


// ─── PROTECTED ─────────────────────────

export const getCurrentUserApi = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const getAllUsersApi = async (): Promise<User[]> => {
  const res = await api.get<User[]>("/users");
  return res.data;
};