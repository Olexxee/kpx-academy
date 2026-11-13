import axios from "axios";

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

