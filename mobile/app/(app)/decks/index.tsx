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
import { useRouter } from "expo-router"
import { getLanguageLabel, type DeckSummary } from "@memorizar/shared"
import { fetchMyDecks } from "../../../src/api/decks"
import { useAuth } from "../../../src/context/AuthContext"

export default function DecksScreen() {
  const router = useRouter()
  const { signOut } = useAuth()

  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDecks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchMyDecks()
      setDecks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDecks()
  }, [loadDecks])

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
        <TouchableOpacity style={styles.retryButton} onPress={loadDecks}>
          <Text style={styles.retryText}>再試行</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>単語帳一覧</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      {decks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>単語帳がありません。</Text>
        </View>
      ) : (
        <FlatList
          data={decks}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(app)/decks/${item.id}`)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={styles.deckName}>{item.name}</Text>
                  <Text style={styles.deckMeta}>
                    学習言語: {getLanguageLabel(item.questionLanguage)}
                  </Text>
                </View>
                <View style={styles.cardCountBadge}>
                  <Text style={styles.cardCountText}>{item.cardCount} cards</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
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
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  logoutText: {
    fontSize: 14,
    color: "#6b7280",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  deckName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  deckMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  cardCountBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardCountText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
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
  },
})
