import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";

export type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const userId = localStorage.getItem("userId") ?? "2";
  const hasUserHeader =
    (config.headers as Record<string, string> | undefined)?.["X-USER-ID"] !==
    undefined;
  if (userId && !hasUserHeader) {
    config.headers = config.headers ?? {};
    config.headers["X-USER-ID"] = userId;
  }
  return config;
});

export type ApiRequestOptions = AxiosRequestConfig & {
  allowStatuses?: number[];
};

export async function apiRequest<T>(config: ApiRequestOptions) {
  try {
    const response = await client.request<T>(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorPayload>;
      const status = axiosError.response?.status;
      const allowStatuses = config.allowStatuses ?? [];
      if (status && allowStatuses.includes(status)) {
        return axiosError.response?.data as T;
      }

      const payload = axiosError.response?.data;
      const code = payload?.error?.code;
      const message =
        payload?.error?.message ?? "요청 처리 중 오류가 발생했어요.";
      throw new ApiError(message, code, status);
    }
    throw error;
  }
}
