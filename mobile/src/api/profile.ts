import { apiRequest } from "./client"

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
