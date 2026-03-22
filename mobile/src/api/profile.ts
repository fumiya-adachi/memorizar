import * as SecureStore from "expo-secure-store"
import { apiRequest } from "./client"

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"
const TOKEN_KEY = "memorizar_auth_token"

export type ProfileSummary = {
  name: string | null
  email: string
  totalCards: number
  todayReviews: number
  overallAccuracy: number | null
}

export async function fetchProfileSummary(): Promise<ProfileSummary> {
  return apiRequest<ProfileSummary>("/api/profile/summary")
}

export async function updateProfile(params: { name?: string; email?: string }): Promise<{ name: string | null; email: string }> {
  return apiRequest("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
}

export async function deleteAccount(): Promise<void> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY)
  const res = await fetch(`${BASE_URL}/api/profile`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
}
