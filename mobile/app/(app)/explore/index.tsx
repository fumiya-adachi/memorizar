import { useCallback, useState } from "react"
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
import { useFocusEffect, useRouter } from "expo-router"
import type { DeckSummary } from "@memorizar/shared"
import { fetchPublicDecks } from "../../../src/api/decks"

function DeckRow({ deck, onPress }: { deck: DeckSummary; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowMain}>
        <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
        <Text style={styles.deckMeta}>{deck.cardCount} cards</Text>
      </View>
      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
  )
}

export default function ExploreScreen() {
  const router = useRouter()
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchPublicDecks()
      setDecks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const filtered = query.trim()
    ? decks.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
    : decks

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>探す</Text>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="単語帳を検索..."
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
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {query ? "該当する単語帳がありません" : "公開されている単語帳がありません"}
            </Text>
          }
          renderItem={({ item }) => (
            <DeckRow deck={item} onPress={() => router.push(`/(app)/explore/${item.id}`)} />
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827" },
  searchBar: { paddingHorizontal: 12, paddingVertical: 8 },
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
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingBottom: 24 },
  separator: { height: 1, backgroundColor: "#f3f4f6" },
  row: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowMain: { flex: 1, gap: 2 },
  rowChevron: { fontSize: 20, color: "#d1d5db", marginLeft: 8 },
  deckName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  deckMeta: { fontSize: 13, color: "#6b7280" },
  emptyText: { fontSize: 14, color: "#9ca3af" },
  errorText: { fontSize: 14, color: "#dc2626", marginBottom: 12, textAlign: "center" },
  retryBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: "#ffffff", fontWeight: "600" },
})
