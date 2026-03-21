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

export default function DecksScreen() {
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDecks()
      .then(setDecks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

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
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
