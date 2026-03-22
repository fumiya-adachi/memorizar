import type { CardData } from "@memorizar/shared"
import { apiRequest, deleteRequest } from "./client"

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
  return deleteRequest(`/api/cards/${cardId}`)
}
