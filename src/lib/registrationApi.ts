import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

export const registrationApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 120000,
});

console.log(
  "[Registration API] Environment variable:",
  import.meta.env.VITE_API_URL,
);
console.log(
  "[Registration API] Axios base URL:",
  registrationApi.defaults.baseURL,
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.code === "ECONNABORTED") {
          return false;
        }

        return failureCount < 2;
      },

      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),

      staleTime: 1000 * 60 * 5,

      gcTime: 1000 * 60 * 10,
    },

    mutations: {
      retry: 1,
    },
  },
});
