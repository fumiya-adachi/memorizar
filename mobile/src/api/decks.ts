import type { DeckSummary } from "@memorizar/shared"
import { apiRequest } from "./client"

export async function fetchMyDecks(): Promise<DeckSummary[]> {
  return apiRequest<DeckSummary[]>("/api/decks")
}

export async function fetchPublicDecks(): Promise<DeckSummary[]> {
  return apiRequest<DeckSummary[]>("/api/decks/public")
}
