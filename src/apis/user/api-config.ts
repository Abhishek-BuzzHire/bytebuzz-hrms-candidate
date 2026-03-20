// src/apis/user/api-config.ts
import axios from "axios";

export const API_BASE_URL = "http://172.20.10.2:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;