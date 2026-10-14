import { registrationApi } from "../../lib/registrationApi";

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

export interface LoginResponse {
  success: boolean;
  data: {
    admin: Admin;
    accessToken: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: Admin;
}

export const loginRequest = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await registrationApi.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const meRequest = async (): Promise<Admin> => {
  const response = await registrationApi.get<MeResponse>("/auth/me");

  return response.data.data;
};

export const logoutRequest = async () => {
  await registrationApi.post("/auth/logout");
};

export const refreshRequest = async () => {
  const response = await registrationApi.post("/auth/refresh");

  return response.data;
};
