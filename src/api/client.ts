import { useAuth } from "../providers/AuthProvider";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:8080";

type ApiOptions = RequestInit & { token?: string | null };

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...rest } = options;
  const headers = new Headers(rest.headers || {});
  headers.set("Accept", "application/json");
  if (!(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      (data as { message?: string })?.message || "Request failed",
      response.status,
      data,
    );
  }

  return data as T;
}

export function useApiClient() {
  const { token } = useAuth();
  return {
    get: <T,>(path: string) => apiRequest<T>(path, { method: "GET", token }),
    post: <T,>(path: string, body: unknown) =>
      apiRequest<T>(path, { method: "POST", body: JSON.stringify(body), token }),
    patch: <T,>(path: string, body: unknown) =>
      apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body), token }),
    put: <T,>(path: string, body: unknown) =>
      apiRequest<T>(path, { method: "PUT", body: JSON.stringify(body), token }),
    delete: <T,>(path: string) => apiRequest<T>(path, { method: "DELETE", token }),
  };
}
