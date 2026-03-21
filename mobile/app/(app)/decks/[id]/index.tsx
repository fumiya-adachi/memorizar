import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { getLanguageLabel, type DeckSummary } from "@memorizar/shared"
import { fetchMyDecks } from "../../../../src/api/decks"

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
      const found = decks.find((d) => d.id === deckId) ?? null
      setDeck(found)
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
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#111827" />
      </SafeAreaView>
    )
  }

  if (error || !deck) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error ?? "単語帳が見つかりません"}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← 一覧へ戻る</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deckCard}>
        <Text style={styles.deckName}>{deck.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            学習言語: {getLanguageLabel(deck.questionLanguage)}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{deck.cardCount} cards</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.reviewButton}
        onPress={() => router.push(`/(app)/decks/${deck.id}/review`)}
      >
        <Text style={styles.reviewButtonText}>復習を開始する</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  deckCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  deckName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: {
    fontSize: 14,
    color: "#6b7280",
  },
  badge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  reviewButton: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 17,
  },
  errorText: {
    fontSize: 15,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
})
