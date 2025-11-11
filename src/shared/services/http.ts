// src/shared/services/http.ts
import axios from "axios";
import { handleAPIError, showErrorToast } from "@/shared/utils/errors";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// ✅ Handle errors globally through your central error handler
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const appError = handleAPIError(error);
    showErrorToast(appError);
    return Promise.reject(appError);
  }
);

export default http;
