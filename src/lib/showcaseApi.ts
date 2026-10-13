import axios from "axios";

export const showcaseApi = axios.create({
  baseURL: import.meta.env.VITE_SHOWCASE_API_URL,
  withCredentials: true,
  timeout: 120000,
});

console.log("[Showcase API] Environment variable:", import.meta.env.VITE_SHOWCASE_API_URL);
console.log("[Showcase API] Axios base URL:", showcaseApi.defaults.baseURL);