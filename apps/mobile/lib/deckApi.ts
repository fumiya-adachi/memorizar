import { apiGet, apiPost } from "./api"

export type DeckSummary = {
  id: number
  name: string
  questionLanguage: string | null
  answerLanguage: string | null
  cardCount: number
  createdAt: string
}

export type ReviewCard = {
  id: number
  question: string
  answer: string
  description: string | null
  questionLanguage: string | null
  answerLanguage: string | null
  progress: {
    correctCount: number
    wrongCount: number
    reviewCount: number
    nextReview: string | null
    lastReviewed: string | null
  } | null
}

export async function fetchDecks(): Promise<DeckSummary[]> {
  const data = await apiGet<{ decks: DeckSummary[] }>("/api/v1/decks")
  return data.decks
}

export async function fetchReviewCards(
  deckId: number,
): Promise<{ deckId: number; deckName: string; cards: ReviewCard[] }> {
  return apiGet(`/api/v1/decks/${deckId}/review-cards`)
}

export async function postCardResult(
  deckId: number,
  cardId: number,
  isCorrect: boolean,
): Promise<{ ok: boolean; nextReview: string }> {
  return apiPost(`/api/v1/decks/${deckId}/review-cards/${cardId}/result`, { isCorrect })
}
