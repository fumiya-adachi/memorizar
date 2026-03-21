"use client"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as Speech from "expo-speech"
import { clearSessionToken, isUnauthorizedError } from "@/lib/api"
import { fetchReviewCards, postCardResult, type ReviewCard } from "@/lib/deckApi"

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const deckId = Number(id)
  const router = useRouter()

  const [cards, setCards] = useState<ReviewCard[]>([])
  const [deckName, setDeckName] = useState("")
  const [index, setIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (Number.isNaN(deckId)) {
      setError("不正なデッキIDです")
      setLoading(false)
      return
    }

    fetchReviewCards(deckId)
      .then((data) => {
        setCards(data.cards)
        setDeckName(data.deckName)
      })
      .catch(async (error: unknown) => {
        if (isUnauthorizedError(error)) {
          await clearSessionToken()
          router.replace("/login")
          return
        }

        setError(error instanceof Error ? error.message : "読み込みに失敗しました")
      })
      .finally(() => setLoading(false))
  }, [deckId, router])

  // カードが変わったら回答を隠す
  useEffect(() => {
    setShowAnswer(false)
  }, [index])

  const speak = (text: string | null, language: string | null) => {
    if (!text || !language) return
    Speech.stop()
    Speech.speak(text, { language, rate: 0.9, pitch: 0.9 })
  }

  const submitResult = async (isCorrect: boolean) => {
    if (submitting) return
    const card = cards[index]
    if (!card) return

    setSubmitting(true)
    try {
      await postCardResult(deckId, card.id, isCorrect)
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await clearSessionToken()
        router.replace("/login")
        return
      }

      // 通信エラーでも次のカードに進む（オフライン対応は今後）
    } finally {
      setSubmitting(false)
    }

    const nextIndex = index + 1
    if (nextIndex >= cards.length) {
      router.back()
    } else {
      setIndex(nextIndex)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  if (cards.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>このデッキにはカードがありません</Text>
      </View>
    )
  }

  const card = cards[index]
  const progress = `${index + 1} / ${cards.length}`

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.deckName}>{deckName}</Text>
        <Text style={styles.progress}>{progress}</Text>
      </View>

      {/* 問題 */}
      <View style={styles.questionCard}>
        <Text style={styles.label}>Question</Text>
        <View style={styles.row}>
          <Text style={styles.questionText}>{card.question}</Text>
          {card.questionLanguage && (
            <Pressable
              style={styles.speakButton}
              onPress={() => speak(card.question, card.questionLanguage)}
            >
              <Text style={styles.speakIcon}>🔊</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* 回答表示 */}
      {!showAnswer ? (
        <Pressable style={styles.showAnswerButton} onPress={() => setShowAnswer(true)}>
          <Text style={styles.showAnswerText}>回答を見る</Text>
        </Pressable>
      ) : (
        <>
          <View style={styles.answerCard}>
            <Text style={styles.label}>Answer</Text>
            <View style={styles.row}>
              <Text style={styles.answerText}>{card.answer}</Text>
              {card.answerLanguage && (
                <Pressable
                  style={styles.speakButton}
                  onPress={() => speak(card.answer, card.answerLanguage)}
                >
                  <Text style={styles.speakIcon}>🔊</Text>
                </Pressable>
              )}
            </View>
            {card.description && (
              <Text style={styles.description}>{card.description}</Text>
            )}
          </View>

          {/* 正誤ボタン */}
          <View style={styles.resultRow}>
            <Pressable
              style={[styles.resultButton, styles.incorrectButton]}
              onPress={() => submitResult(false)}
              disabled={submitting}
            >
              <Text style={styles.incorrectText}>✗ もう一度</Text>
            </Pressable>
            <Pressable
              style={[styles.resultButton, styles.correctButton]}
              onPress={() => submitResult(true)}
              disabled={submitting}
            >
              <Text style={styles.correctText}>✓ 覚えた</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 20,
    gap: 16,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  deckName: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  progress: {
    fontSize: 13,
    color: "#999",
  },
  questionCard: {
    backgroundColor: "#f5f5f7",
    borderRadius: 20,
    padding: 24,
  },
  answerCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#aaa",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
  },
  answerText: {
    flex: 1,
    fontSize: 20,
    color: "#222",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  speakButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  speakIcon: {
    fontSize: 16,
  },
  showAnswerButton: {
    backgroundColor: "#111",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  showAnswerText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  resultRow: {
    flexDirection: "row",
    gap: 12,
  },
  resultButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  incorrectButton: {
    backgroundColor: "#fee2e2",
  },
  correctButton: {
    backgroundColor: "#dcfce7",
  },
  incorrectText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 16,
  },
  correctText: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 14,
  },
})
