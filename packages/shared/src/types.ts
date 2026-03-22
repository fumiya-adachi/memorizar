export type DeckSummary = {
  id: number
  name: string
  questionLanguage: string | null
  answerLanguage: string | null
  cardCount: number
  sourceDeckId: number | null
  createdAt: string
}

export type ReviewCardData = {
  id: number
  question: string
  answer: string
  description: string | null
  deckName: string
  questionLanguage: string | null
  answerLanguage: string | null
  progress: {
    correctCount: number
    reviewCount: number
  } | null
}

export type CardData = {
  id: number
  question: string
  answer: string
  description: string | null
}

export type AccuracyFilter = "all" | "unlearned" | "low" | "mid" | "high"

export const ACCURACY_FILTER_OPTIONS: { value: AccuracyFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "unlearned", label: "未学習" },
  { value: "low", label: "0-49%" },
  { value: "mid", label: "50-79%" },
  { value: "high", label: "80-100%" },
]

export function getAccuracy(progress: { correctCount: number; reviewCount: number } | null) {
  if (!progress || progress.reviewCount === 0) return -1
  return progress.correctCount / progress.reviewCount
}

export function matchesAccuracyFilter(
  progress: { correctCount: number; reviewCount: number } | null,
  filter: AccuracyFilter
) {
  if (filter === "all") return true

  const accuracy = getAccuracy(progress)

  if (filter === "unlearned") return accuracy < 0
  if (accuracy < 0) return false
  if (filter === "low") return accuracy < 0.5
  if (filter === "mid") return accuracy >= 0.5 && accuracy < 0.8

  return accuracy >= 0.8
}
