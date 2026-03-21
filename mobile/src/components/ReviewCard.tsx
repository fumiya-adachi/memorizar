import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import * as Speech from "expo-speech"
import type { ReviewCardData } from "@memorizar/shared"

type Props = {
  card: ReviewCardData
  onResult: (isCorrect: boolean) => Promise<void>
}

export default function ReviewCard({ card, onResult }: Props) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // カードが切り替わったら答えを隠す
  useEffect(() => {
    setShowAnswer(false)
  }, [card.id])

  function speak(text: string | null, language: string | null) {
    if (!text || !language) return
    Speech.stop()
    Speech.speak(text, { language, rate: 0.9, pitch: 0.9 })
  }

  async function submitResult(isCorrect: boolean) {
    setIsPending(true)
    try {
      await onResult(isCorrect)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* デッキ名バッジ */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{card.deckName}</Text>
      </View>

      {/* 問題 */}
      <View style={styles.questionBox}>
        <Text style={styles.sectionLabel}>Question</Text>
        <View style={styles.row}>
          <Text style={styles.questionText}>{card.question}</Text>
          {card.questionLanguage && (
            <TouchableOpacity
              style={styles.speakButton}
              onPress={() => speak(card.question, card.questionLanguage)}
            >
              <Text>🔊</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 答え (表示後) */}
      {showAnswer && (
        <>
          <View style={styles.answerBox}>
            <Text style={styles.sectionLabel}>Answer</Text>
            <View style={styles.row}>
              <Text style={styles.answerText}>{card.answer}</Text>
              {card.answerLanguage && (
                <TouchableOpacity
                  style={styles.speakButton}
                  onPress={() => speak(card.answer, card.answerLanguage)}
                >
                  <Text>🔊</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {card.description && (
            <View style={styles.descriptionBox}>
              <Text style={styles.sectionLabel}>Description</Text>
              <View style={styles.row}>
                <Text style={styles.descriptionText}>{card.description}</Text>
                {card.questionLanguage && (
                  <TouchableOpacity
                    style={styles.speakButton}
                    onPress={() => speak(card.description, card.questionLanguage)}
                  >
                    <Text>🔊</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </>
      )}

      {/* 答えを見るボタン */}
      {!showAnswer && (
        <TouchableOpacity
          style={styles.showAnswerButton}
          onPress={() => setShowAnswer(true)}
          disabled={isPending}
        >
          <Text style={styles.showAnswerText}>答えを見る</Text>
        </TouchableOpacity>
      )}

      {/* 正解 / 不正解ボタン */}
      {showAnswer && (
        <View style={styles.resultRow}>
          <TouchableOpacity
            style={[styles.resultButton, styles.wrongButton]}
            onPress={() => submitResult(false)}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#dc2626" />
            ) : (
              <Text style={styles.wrongText}>不正解</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resultButton, styles.correctButton]}
            onPress={() => submitResult(true)}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#16a34a" />
            ) : (
              <Text style={styles.correctText}>正解</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* 進捗表示 */}
      {card.progress && (
        <View style={styles.progressBox}>
          <Text style={styles.progressText}>
            正答率:{" "}
            {card.progress.reviewCount > 0
              ? Math.round((card.progress.correctCount / card.progress.reviewCount) * 100)
              : 0}
            % / 復習回数: {card.progress.reviewCount}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4b5563",
  },
  questionBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
  },
  answerBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  descriptionBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#9ca3af",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  questionText: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  answerText: {
    flex: 1,
    fontSize: 20,
    color: "#1f2937",
  },
  descriptionText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  speakButton: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
  showAnswerButton: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  showAnswerText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  resultRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  resultButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  wrongButton: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  correctButton: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  wrongText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 16,
  },
  correctText: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 16,
  },
  progressBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  progressText: {
    fontSize: 13,
    color: "#4b5563",
  },
})
