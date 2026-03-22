import * as SecureStore from "expo-secure-store"

// 開発時は localhost:3000、本番はenv変数で上書き
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"
export const TOKEN_KEY = "memorizar_auth_token"

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY)

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
    throw new ApiError(body.error ?? `HTTP ${response.status}`, response.status)
  }

  return response.json() as Promise<T>
}

export async function deleteRequest(path: string): Promise<void> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY)
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new ApiError(body.error ?? `HTTP ${res.status}`, res.status)
  }
}
