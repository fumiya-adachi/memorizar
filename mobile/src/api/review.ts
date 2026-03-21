import type { ReviewCardData } from "@memorizar/shared"
import { apiRequest } from "./client"

export async function fetchReviewCards(deckId: number): Promise<ReviewCardData[]> {
  return apiRequest<ReviewCardData[]>(`/api/decks/${deckId}/review-cards`)
}

export async function markResult(cardId: number, isCorrect: boolean): Promise<void> {
  await apiRequest<void>("/api/review/result", {
    method: "POST",
    body: JSON.stringify({ cardId, isCorrect }),
  })
}
