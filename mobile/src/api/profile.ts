import { apiRequest, deleteRequest } from "./client"

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
  return deleteRequest("/api/profile")
}
