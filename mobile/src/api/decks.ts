import type { DeckSummary } from "@memorizar/shared"
import { apiRequest, deleteRequest } from "./client"

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

export type DeckProgress = {
  reviewedCount: number
  todayCount: number
  lastReviewed: string | null
}

export async function fetchDeckProgress(id: number): Promise<DeckProgress> {
  return apiRequest<DeckProgress>(`/api/decks/${id}/progress`)
}

export type PublicDeckDetail = {
  id: number
  name: string
  questionLanguage: string | null
  answerLanguage: string | null
  cardCount: number
  cards: { id: number; question: string; answer: string; description: string | null }[]
  alreadyImported: boolean
  importedDeckId: number | null
}

export async function fetchPublicDeck(id: number): Promise<PublicDeckDetail> {
  return apiRequest<PublicDeckDetail>(`/api/decks/${id}/public`)
}

export async function importDeck(sourceDeckId: number): Promise<DeckSummary> {
  return apiRequest<DeckSummary>(`/api/decks/${sourceDeckId}/import`, {
    method: "POST",
  })
}

export async function deleteDeck(id: number): Promise<void> {
  return deleteRequest(`/api/decks/${id}`)
}
