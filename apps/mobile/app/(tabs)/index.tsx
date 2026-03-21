import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { fetchDecks, type DeckSummary } from "../../lib/deckApi"
import { clearSessionToken, isUnauthorizedError } from "../../lib/api"

export default function DecksScreen() {
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDecks()
      .then(setDecks)
      .catch(async (error: unknown) => {
        if (isUnauthorizedError(error)) {
          await clearSessionToken()
          router.replace("/login")
          return
        }

        setError(error instanceof Error ? error.message : "読み込みに失敗しました")
      })
      .finally(() => setLoading(false))
  }, [router])

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

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>あなたの単語帳</Text>
        <Pressable
          style={styles.logoutButton}
          onPress={async () => {
            await clearSessionToken()
            router.replace("/login")
          }}
        >
          <Text style={styles.logoutText}>ログアウト</Text>
        </Pressable>
      </View>

      <FlatList
        data={decks}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/decks/${item.id}/review`)}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {item.cardCount} 枚
              {item.questionLanguage ? `  ·  ${item.questionLanguage}` : ""}
            </Text>
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  logoutButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#888",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 14,
  },
})
