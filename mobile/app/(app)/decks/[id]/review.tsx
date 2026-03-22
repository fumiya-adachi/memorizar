import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { matchesAccuracyFilter, type AccuracyFilter, type ReviewCardData } from "@memorizar/shared"
import { fetchReviewCards, markResult } from "../../../../src/api/review"

const SWIPE_THRESHOLD = 80
const SCREEN_WIDTH = Dimensions.get("window").width

// デッキごとの最後のインデックスをメモリに保持（アプリ起動中に続きから再開）
const lastIndexMap = new Map<number, number>()

// ─── ProgressBar ──────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const ratio = total > 0 ? current / total : 0
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>
        {current} / {total}
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(ratio * 100)}%` }]} />
      </View>
    </View>
  )
}

// ─── HintBar ──────────────────────────────────────────────────────────────────

function HintBar({
  onCorrect,
  onIncorrect,
}: {
  onCorrect: () => void
  onIncorrect: () => void
}) {
  return (
    <View style={styles.hintBar}>
      <TouchableOpacity style={styles.hintButton} onPress={onIncorrect}>
        <Text style={styles.hintIcon}>←</Text>
        <Text style={[styles.hintLabel, styles.hintLabelIncorrect]}>不正解</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.hintButton, styles.hintButtonRight]} onPress={onCorrect}>
        <Text style={[styles.hintLabel, styles.hintLabelCorrect]}>正解</Text>
        <Text style={styles.hintIcon}>→</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── SwipeableCard ────────────────────────────────────────────────────────────

function SwipeableCard({
  card,
  onCorrect,
  onIncorrect,
}: {
  card: ReviewCardData
  onCorrect: () => void
  onIncorrect: () => void
}) {
  const [answered, setAnswered] = useState(false)
  const translateX = useRef(new Animated.Value(0)).current

  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-8deg", "0deg", "8deg"],
    extrapolate: "clamp",
  })

  const correctOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  const incorrectOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  })

  useEffect(() => {
    setAnswered(false)
    translateX.setValue(0)
  }, [card.id])

  const flyOff = (direction: "left" | "right", callback: () => void) => {
    Animated.timing(translateX, {
      toValue: direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      translateX.setValue(0)
      callback()
    })
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: Animated.event([null, { dx: translateX }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > SWIPE_THRESHOLD) {
          flyOff("right", onCorrect)
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          flyOff("left", onIncorrect)
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 8,
          }).start()
        }
      },
    })
  ).current

  return (
    <View style={styles.cardArea}>
      {/* 正解ラベル（右スワイプ） */}
      <Animated.View style={[styles.badge, styles.badgeCorrect, { opacity: correctOpacity }]}>
        <Text style={styles.badgeText}>正解</Text>
      </Animated.View>
      {/* 不正解ラベル（左スワイプ） */}
      <Animated.View style={[styles.badge, styles.badgeIncorrect, { opacity: incorrectOpacity }]}>
        <Text style={styles.badgeText}>不正解</Text>
      </Animated.View>

      <Animated.View
        style={[styles.card, { transform: [{ translateX }, { rotate }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setAnswered(true)}
          style={styles.cardInner}
        >
          <Text style={styles.question}>{card.question}</Text>

          {answered ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.answer}>{card.answer}</Text>
              {card.description ? (
                <Text style={styles.description}>{card.description}</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.tapHint}>タップして回答を確認</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ReviewScreen() {
  const { id, filter } = useLocalSearchParams<{ id: string; filter?: string }>()
  const router = useRouter()
  const deckId = Number(id)
  const accuracyFilter = (filter ?? "all") as AccuracyFilter

  const [allCards, setAllCards] = useState<ReviewCardData[]>([])
  const cards = allCards.filter((c) => matchesAccuracyFilter(c.progress, accuracyFilter))
  const [currentIndex, setCurrentIndex] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ロード完了後のみ保存するためのフラグ
  const isLoadedRef = useRef(false)

  const loadCards = useCallback(async () => {
    try {
      isLoadedRef.current = false
      setIsLoading(true)
      setError(null)
      const data = await fetchReviewCards(deckId)
      setAllCards(data)
      // 保存済みインデックスを復元（範囲外なら0）
      const saved = lastIndexMap.get(deckId) ?? 0
      setCurrentIndex(saved < data.length ? saved : 0)
      isLoadedRef.current = true
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [deckId])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  // ロード完了後のインデックス変更のみ保存
  useEffect(() => {
    if (isLoadedRef.current) {
      lastIndexMap.set(deckId, currentIndex)
    }
  }, [deckId, currentIndex])

  const handleResult = useCallback(
    async (isCorrect: boolean) => {
      const card = cards[currentIndex]
      if (!card) return

      await markResult(card.id, isCorrect).catch(() => {})

      // card.progress をローカルで即時反映
      setAllCards((prev) =>
        prev.map((c) => {
          if (c.id !== card.id) return c
          const p = c.progress ?? { correctCount: 0, reviewCount: 0 }
          return {
            ...c,
            progress: {
              correctCount: p.correctCount + (isCorrect ? 1 : 0),
              reviewCount: p.reviewCount + 1,
            },
          }
        })
      )

      setCurrentIndex((i) => (i < cards.length - 1 ? i + 1 : 0))
    },
    [cards, currentIndex]
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom", "left", "right"]}>
        <ActivityIndicator size="large" color="#111827" />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom", "left", "right"]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadCards}>
          <Text style={styles.retryText}>再試行</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (cards.length === 0) {
    const isFiltered = accuracyFilter !== "all"
    return (
      <SafeAreaView style={styles.center} edges={["bottom", "left", "right"]}>
        <Text style={styles.emptyTitle}>
          {isFiltered ? "カードがありません" : "カードが登録されていません"}
        </Text>
        <Text style={styles.emptyText}>
          {isFiltered
            ? "この正答率範囲のカードはなくなりました"
            : "このデッキにはまだカードがありません"}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.retryBtn}>
          <Text style={styles.retryText}>戻る</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const card = cards[currentIndex]

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ title: cards[0]?.deckName ?? "復習" }} />
      <ProgressBar current={currentIndex + 1} total={cards.length} />

      <View style={styles.cardWrapper}>
        <SwipeableCard
          key={card.id}
          card={card}
          onCorrect={() => handleResult(true)}
          onIncorrect={() => handleResult(false)}
        />
        <Text style={styles.sessionStats}>
          {(() => {
            const p = card.progress
            const reviewCount = p?.reviewCount ?? 0
            const rate = reviewCount > 0 ? Math.round(((p?.correctCount ?? 0) / reviewCount) * 100) : 0
            return `正答率: ${rate}% / 復習回数: ${reviewCount}`
          })()}
        </Text>
      </View>

      <HintBar
        onCorrect={() => handleResult(true)}
        onIncorrect={() => handleResult(false)}
      />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f9fafb",
  },
  // Progress
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#111827",
    borderRadius: 99,
  },
  // Card area
  cardArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardInner: {
    padding: 32,
    alignItems: "center",
    minHeight: 240,
    justifyContent: "center",
    gap: 20,
  },
  question: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  divider: {
    width: "40%",
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  answer: {
    fontSize: 22,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  tapHint: {
    fontSize: 13,
    color: "#9ca3af",
  },
  // Swipe badges
  badge: {
    position: "absolute",
    top: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    zIndex: 10,
  },
  badgeCorrect: {
    right: 24,
    borderColor: "#16a34a",
    backgroundColor: "#f0fdf4",
  },
  badgeIncorrect: {
    left: 24,
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  // Hint bar
  hintBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  hintButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#fee2e2",
  },
  hintButtonRight: {
    backgroundColor: "#dcfce7",
  },
  hintIcon: {
    fontSize: 16,
    color: "#6b7280",
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  hintLabelIncorrect: {
    color: "#dc2626",
  },
  hintLabelCorrect: {
    color: "#16a34a",
  },
  statsBox: {
    flexDirection: "row",
    gap: 16,
  },
  statCorrect: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16a34a",
  },
  statIncorrect: {
    fontSize: 15,
    fontWeight: "700",
    color: "#dc2626",
  },
  // Misc
  errorText: {
    fontSize: 15,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  sessionStats: {
    textAlign: "center",
    fontSize: 13,
    color: "#9ca3af",
    paddingTop: 16,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: "center",
  },
})
