import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import {
  ACCURACY_FILTER_OPTIONS,
  matchesAccuracyFilter,
  type AccuracyFilter,
  type ReviewCardData,
} from "@memorizar/shared"
import ReviewCard from "../../../../src/components/ReviewCard"
import { fetchReviewCards, markResult } from "../../../../src/api/review"

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const deckId = Number(id)

  const [cards, setCards] = useState<ReviewCardData[]>([])
  const [accuracyFilter, setAccuracyFilter] = useState<AccuracyFilter>("all")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchReviewCards(deckId)
      setCards(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [deckId])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  // フィルタ切り替え時はインデックスをリセット
  useEffect(() => {
    setCurrentIndex(0)
  }, [accuracyFilter])

  const filteredCards = cards.filter((c) => matchesAccuracyFilter(c.progress, accuracyFilter))

  async function handleResult(isCorrect: boolean) {
    const card = filteredCards[currentIndex]
    if (!card) return

    await markResult(card.id, isCorrect)

    // 進捗をローカルで即時反映
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== card.id) return c
        const prev_ = c.progress ?? { correctCount: 0, reviewCount: 0 }
        return {
          ...c,
          progress: {
            correctCount: prev_.correctCount + (isCorrect ? 1 : 0),
            reviewCount: prev_.reviewCount + 1,
          },
        }
      })
    )

    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#111827" />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCards}>
          <Text style={styles.retryText}>再試行</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (cards.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyText}>このデッキにはまだカードがありません。</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>
          {filteredCards.length > 0 ? `${currentIndex + 1} / ${filteredCards.length}` : "0 / 0"}
        </Text>
      </View>

      {/* 精度フィルタ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {ACCURACY_FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterChip, accuracyFilter === opt.value && styles.filterChipActive]}
            onPress={() => setAccuracyFilter(opt.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                accuracyFilter === opt.value && styles.filterChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredCards.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>この条件に一致するカードがありません。</Text>
        </View>
      ) : (
        <ScrollView>
          <ReviewCard card={filteredCards[currentIndex]} onResult={handleResult} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  progress: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
  filterChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  filterChipText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  errorText: {
    fontSize: 15,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
})
