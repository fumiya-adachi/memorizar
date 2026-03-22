import { useState, useCallback } from "react"
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router"
import type { CardData } from "@memorizar/shared"
import { fetchCards } from "../../../../../src/api/cards"

export default function CardListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const deckId = Number(id)

  const [cards, setCards] = useState<CardData[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchCards(deckId)
      setCards(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [deckId])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const filtered = query.trim()
    ? cards.filter(
        (c) =>
          c.question.toLowerCase().includes(query.toLowerCase()) ||
          c.answer.toLowerCase().includes(query.toLowerCase())
      )
    : cards

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ title: "カード一覧", headerBackButtonDisplayMode: "minimal" }} />

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="カードを検索..."
          placeholderTextColor="#9ca3af"
          clearButtonMode="while-editing"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#111827" />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>再試行</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={filtered.length === 0 ? styles.center : styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {query ? "該当するカードがありません" : "カードがありません"}
            </Text>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push(`/(app)/decks/${deckId}/cards/${item.id}/edit`)}
            >
              <Text style={styles.question} numberOfLines={1}>{item.question}</Text>
              <Text style={styles.answer} numberOfLines={1}>{item.answer}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/(app)/decks/${deckId}/cards/new`)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  searchBar: { padding: 12, paddingBottom: 8 },
  searchInput: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },
  loader: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingBottom: 88 },
  separator: { height: 1, backgroundColor: "#f3f4f6", marginLeft: 16 },
  row: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  question: { fontSize: 15, fontWeight: "600", color: "#111827" },
  answer: { fontSize: 13, color: "#6b7280" },
  emptyText: { fontSize: 14, color: "#9ca3af" },
  errorText: { fontSize: 14, color: "#dc2626", marginBottom: 12 },
  retryBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: "#ffffff", fontWeight: "600" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: "#ffffff", fontSize: 28, lineHeight: 32 },
})
