import AsyncStorage from "@react-native-async-storage/async-storage"

const SESSION_KEY = "session_token"

/**
 * Next.js の NextAuth セッションクッキーを再現するのではなく、
 * アプリはメール/パスワードで /api/auth/signin に POST して
 * レスポンスのセッションクッキーを AsyncStorage に保存する。
 *
 * 開発時は __BASE_URL__ に Next.js のローカルURL（例: http://localhost:3000）を設定する。
 */
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"

async function getHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem(SESSION_KEY)
  return {
    "Content-Type": "application/json",
    ...(token ? { Cookie: token } : {}),
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: await getHeaders(),
    credentials: "include",
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, (body as { error?: string }).error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: await getHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, (body as { error?: string }).error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}
