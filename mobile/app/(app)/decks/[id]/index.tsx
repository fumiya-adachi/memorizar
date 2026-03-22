import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { getLanguageLabel, type DeckSummary } from "@memorizar/shared"
import { fetchMyDecks } from "../../../../src/api/decks"

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgressInfo = {
  todayCount: number
  reviewedCount: number
  lastStudied: string
}

// ─── Hardcoded progress (replace with API later) ──────────────────────────────
// TODO: APIから取得した進捗情報を表示するように実装する
const MOCK_PROGRESS: ProgressInfo = {
  todayCount: 18,
  reviewedCount: 72,
  lastStudied: "昨日",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoSection({ deck }: { deck: DeckSummary }) {
  return (
    <View style={styles.section}>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>学習言語</Text>
        <Text style={styles.infoValue}>{getLanguageLabel(deck.questionLanguage)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>カード数</Text>
        <Text style={styles.infoValue}>{deck.cardCount} cards</Text>
      </View>
    </View>
  )
}

function ProgressSection({ deck, progress }: { deck: DeckSummary; progress: ProgressInfo }) {
  const ratio = deck.cardCount > 0 ? progress.reviewedCount / deck.cardCount : 0
  const percent = Math.round(ratio * 100)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>進捗</Text>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
      </View>

      <View style={styles.progressMeta}>
        <Text style={styles.progressCount}>
          {progress.reviewedCount} / {deck.cardCount}
        </Text>
        <Text style={styles.progressPercent}>{percent}%</Text>
      </View>

      <View style={styles.infoRow} >
        <Text style={styles.infoLabel}>今日の復習</Text>
        <Text style={styles.infoValue}>{progress.todayCount} cards</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>最終学習日</Text>
        <Text style={styles.infoValue}>{progress.lastStudied}</Text>
      </View>
    </View>
  )
}

function ActionSection({
  onReview,
  onWordList,
  onEdit,
}: {
  onReview: () => void
  onWordList: () => void
  onEdit: () => void
}) {
  return (
    <View style={styles.actionSection}>
      <TouchableOpacity style={styles.primaryButton} onPress={onReview}>
        <Text style={styles.primaryButtonText}>復習する</Text>
      </TouchableOpacity>

      <View style={styles.subActions}>
        <View style={styles.subDivider} />
        <TouchableOpacity style={styles.subButton} onPress={onEdit}>
          <Text style={styles.subButtonText}>編集する</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const deckId = Number(id)

  const [deck, setDeck] = useState<DeckSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDeck = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const decks = await fetchMyDecks()
      setDeck(decks.find((d) => d.id === deckId) ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [deckId])

  useEffect(() => {
    loadDeck()
  }, [loadDeck])

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom", "left", "right"]}>
        <ActivityIndicator size="large" color="#111827" />
      </SafeAreaView>
    )
  }

  if (error || !deck) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom", "left", "right"]}>
        <Text style={styles.errorText}>{error ?? "単語帳が見つかりません"}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ title: deck.name, headerBackButtonDisplayMode: "minimal" }} />

      <View style={styles.content}>
        <InfoSection deck={deck} />
        <ProgressSection deck={deck} progress={MOCK_PROGRESS} />
      </View>

      <ActionSection
        onReview={() => router.push(`/(app)/decks/${deck.id}/review`)}
        onWordList={() => {}}
        onEdit={() => {}}
      />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#111827",
    borderRadius: 99,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressCount: {
    fontSize: 13,
    color: "#6b7280",
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  actionSection: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  subActions: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  subButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  subButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  subDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
  },
  errorText: {
    fontSize: 15,
    color: "#dc2626",
    textAlign: "center",
  },
})
