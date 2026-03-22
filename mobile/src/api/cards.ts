import type { CardData } from "@memorizar/shared"
import { apiRequest } from "./client"
import * as SecureStore from "expo-secure-store"

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"
const TOKEN_KEY = "memorizar_auth_token"

export async function fetchCards(deckId: number): Promise<CardData[]> {
  return apiRequest<CardData[]>(`/api/decks/${deckId}/cards`)
}

export async function createCard(
  deckId: number,
  params: { question: string; answer: string }
): Promise<CardData> {
  return apiRequest<CardData>(`/api/decks/${deckId}/cards`, {
    method: "POST",
    body: JSON.stringify(params),
  })
}

export async function updateCard(
  cardId: number,
  params: { question: string; answer: string }
): Promise<CardData> {
  return apiRequest<CardData>(`/api/cards/${cardId}`, {
    method: "PUT",
    body: JSON.stringify(params),
  })
}

export async function deleteCard(cardId: number): Promise<void> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY)
  const res = await fetch(`${BASE_URL}/api/cards/${cardId}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
}
