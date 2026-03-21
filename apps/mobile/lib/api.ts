import AsyncStorage from "@react-native-async-storage/async-storage"

const SESSION_KEY = "session_token"

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"

async function getHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem(SESSION_KEY)
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function saveSessionToken(token: string) {
  await AsyncStorage.setItem(SESSION_KEY, token)
}

export async function loadSessionToken() {
  return AsyncStorage.getItem(SESSION_KEY)
}

export async function clearSessionToken() {
  await AsyncStorage.removeItem(SESSION_KEY)
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: await getHeaders(),
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

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401
}
