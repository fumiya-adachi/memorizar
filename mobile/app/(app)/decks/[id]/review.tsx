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
import { useLocalSearchParams, useRouter } from "expo-router"
import { type ReviewCardData } from "@memorizar/shared"
import { fetchReviewCards, markResult } from "../../../../src/api/review"

const SWIPE_THRESHOLD = 80
const SCREEN_WIDTH = Dimensions.get("window").width

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

function HintBar({ correct, incorrect }: { correct: number; incorrect: number }) {
  return (
    <View style={styles.hintBar}>
      <View style={styles.hintSide}>
        <Text style={styles.hintIcon}>←</Text>
        <Text style={styles.hintLabel}>不正解</Text>
      </View>
      <View style={styles.statsBox}>
        <Text style={styles.statIncorrect}>✗ {incorrect}</Text>
        <Text style={styles.statCorrect}>✓ {correct}</Text>
      </View>
      <View style={[styles.hintSide, styles.hintSideRight]}>
        <Text style={styles.hintLabel}>正解</Text>
        <Text style={styles.hintIcon}>→</Text>
      </View>
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
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const deckId = Number(id)

  const [cards, setCards] = useState<ReviewCardData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setCards(await fetchReviewCards(deckId))
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [deckId])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  const handleResult = useCallback(
    async (isCorrect: boolean) => {
      const card = cards[currentIndex]
      if (!card) return

      await markResult(card.id, isCorrect).catch(() => {})

      if (isCorrect) setCorrectCount((n) => n + 1)
      else setIncorrectCount((n) => n + 1)

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
    return (
      <SafeAreaView style={styles.center} edges={["bottom", "left", "right"]}>
        <Text style={styles.emptyText}>このデッキにはまだカードがありません。</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.retryBtn}>
          <Text style={styles.retryText}>戻る</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const card = cards[currentIndex]

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <ProgressBar current={currentIndex + 1} total={cards.length} />

      <SwipeableCard
        key={card.id}
        card={card}
        onCorrect={() => handleResult(true)}
        onIncorrect={() => handleResult(false)}
      />

      <HintBar correct={correctCount} incorrect={incorrectCount} />
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
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  hintSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hintSideRight: {
    flexDirection: "row-reverse",
  },
  hintIcon: {
    fontSize: 18,
    color: "#6b7280",
  },
  hintLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
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
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
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
})
