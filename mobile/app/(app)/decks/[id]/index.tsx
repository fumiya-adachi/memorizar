import { useCallback, useEffect, useState } from "react"
import { useFocusEffect } from "expo-router"
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import {
  getLanguageLabel,
  matchesAccuracyFilter,
  type AccuracyFilter,
  type DeckSummary,
  type ReviewCardData,
} from "@memorizar/shared"
import { fetchMyDecks, fetchDeckProgress, type DeckProgress } from "../../../../src/api/decks"
import { fetchReviewCards } from "../../../../src/api/review"

// ─── Types & Constants ────────────────────────────────────────────────────────

type FilterOption = {
  filter: AccuracyFilter
  label: string
}

const FILTER_OPTIONS: FilterOption[] = [
  { filter: "all",  label: "すべて" },
  { filter: "low",  label: "0〜50%" },
  { filter: "mid",  label: "51〜80%" },
  { filter: "high", label: "81〜100%" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLastStudied(isoDate: string | null): string {
  if (!isoDate) return "未学習"
  const diff = Date.now() - new Date(isoDate).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "今日"
  if (days === 1) return "昨日"
  return `${days}日前`
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

function ProgressSection({ deck, progress }: { deck: DeckSummary; progress: DeckProgress }) {
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

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>今日の復習</Text>
        <Text style={styles.infoValue}>{progress.todayCount} cards</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>最終学習日</Text>
        <Text style={styles.infoValue}>{formatLastStudied(progress.lastReviewed)}</Text>
      </View>
    </View>
  )
}

function ActionSection({
  cards,
  loadingCards,
  selectedFilter,
  onSelectFilter,
  onReview,
  onEdit,
}: {
  cards: ReviewCardData[]
  loadingCards: boolean
  selectedFilter: AccuracyFilter
  onSelectFilter: (f: AccuracyFilter) => void
  onReview: () => void
  onEdit: () => void
}) {
  const count = cards.filter((c) => matchesAccuracyFilter(c.progress, selectedFilter)).length

  return (
    <View style={styles.actionSection}>
      {/* 復習範囲 */}
      <View style={styles.rangeSection}>
        <Text style={styles.rangeTitle}>復習範囲</Text>
        {loadingCards ? (
          <ActivityIndicator size="small" color="#111827" style={{ marginTop: 8 }} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {FILTER_OPTIONS.map((opt) => {
              const optCount = cards.filter((c) => matchesAccuracyFilter(c.progress, opt.filter)).length
              const isSelected = selectedFilter === opt.filter
              const disabled = optCount === 0 && opt.filter !== "all"
              return (
                <TouchableOpacity
                  key={opt.filter}
                  style={[styles.chip, isSelected && styles.chipSelected, disabled && styles.chipDisabled]}
                  onPress={() => !disabled && onSelectFilter(opt.filter)}
                  disabled={disabled}
                >
                  <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected, disabled && styles.chipLabelDisabled]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.chipCount, isSelected && styles.chipCountSelected, disabled && styles.chipLabelDisabled]}>
                    {optCount}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, count === 0 && styles.primaryButtonDisabled]}
        onPress={onReview}
        disabled={count === 0}
      >
        <Text style={styles.primaryButtonText}>
          復習する（{count} cards）
        </Text>
      </TouchableOpacity>

      <View style={styles.subActions}>
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
  const [progress, setProgress] = useState<DeckProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [reviewCards, setReviewCards] = useState<ReviewCardData[]>([])
  const [loadingCards, setLoadingCards] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<AccuracyFilter>("all")

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [decks, prog] = await Promise.all([
        fetchMyDecks(),
        fetchDeckProgress(deckId),
      ])
      setDeck(decks.find((d) => d.id === deckId) ?? null)
      setProgress(prog)
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [deckId])

  const loadCards = useCallback(async () => {
    setLoadingCards(true)
    try {
      const data = await fetchReviewCards(deckId)
      setReviewCards(data)
    } catch {
      // ignore
    } finally {
      setLoadingCards(false)
    }
  }, [deckId])

  useEffect(() => {
    load()
  }, [load])

  useFocusEffect(useCallback(() => { loadCards() }, [loadCards]))

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom", "left", "right"]}>
        <ActivityIndicator size="large" color="#111827" />
      </SafeAreaView>
    )
  }

  if (error || !deck || !progress) {
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
        <ProgressSection deck={deck} progress={progress} />
      </View>

      <ActionSection
        cards={reviewCards}
        loadingCards={loadingCards}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        onReview={() => router.push(`/(app)/decks/${deck.id}/review?filter=${selectedFilter}`)}
        onEdit={() => {}}
      />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" },
  content: { flex: 1, padding: 16, gap: 12 },
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
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: 14, color: "#6b7280" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  divider: { height: 1, backgroundColor: "#f3f4f6" },
  progressBarTrack: { height: 8, backgroundColor: "#f3f4f6", borderRadius: 99, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#111827", borderRadius: 99 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between" },
  progressCount: { fontSize: 13, color: "#6b7280" },
  progressPercent: { fontSize: 13, fontWeight: "600", color: "#111827" },
  // Action area
  actionSection: { padding: 16, gap: 12 },
  rangeSection: { gap: 8 },
  rangeTitle: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  chipRow: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  chipSelected: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  chipDisabled: {
    opacity: 0.35,
  },
  chipLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
  chipLabelSelected: { color: "#ffffff" },
  chipLabelDisabled: { color: "#9ca3af" },
  chipCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 99,
    overflow: "hidden",
  },
  chipCountSelected: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#ffffff",
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  primaryButtonText: { color: "#ffffff", fontSize: 17, fontWeight: "700" },
  subActions: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  subButton: { flex: 1, paddingVertical: 14, alignItems: "center" },
  subButtonText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  errorText: { fontSize: 15, color: "#dc2626", textAlign: "center" },
})
