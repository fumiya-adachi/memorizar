import type { DeckSummary } from "@memorizar/shared"
import { apiRequest } from "./client"
import * as SecureStore from "expo-secure-store"

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"
const TOKEN_KEY = "memorizar_auth_token"

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

export async function deleteDeck(id: number): Promise<void> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY)
  const res = await fetch(`${BASE_URL}/api/decks/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
}
