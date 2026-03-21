import type { DeckSummary } from "@memorizar/shared"
import { apiRequest } from "./client"

export async function fetchMyDecks(): Promise<DeckSummary[]> {
  return apiRequest<DeckSummary[]>("/api/decks")
}

export async function fetchPublicDecks(): Promise<DeckSummary[]> {
  return apiRequest<DeckSummary[]>("/api/decks/public")
}

export async function createDeck(params: {
  name: string
  questionLanguage?: string
  answerLanguage?: string
}): Promise<DeckSummary> {
  return apiRequest<DeckSummary>("/api/decks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
}
