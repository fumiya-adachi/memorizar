import { useCallback, useMemo, useState } from "react"
import { useFocusEffect } from "expo-router"
import {
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { Swipeable } from "react-native-gesture-handler"
import { useRouter } from "expo-router"
import {
  getLanguageLabel,
  getDaysFromFilter,
  QUESTION_LANGUAGE_OPTIONS,
  SORT_OPTIONS,
  CREATED_WITHIN_OPTIONS,
  type DeckSummary,
  type QuestionLanguageFilter,
  type SortFilter,
  type CreatedWithinFilter,
} from "@memorizar/shared"
import { fetchMyDecks, createDeck, deleteDeck } from "../../../src/api/decks"
import { useAuth } from "../../../src/context/AuthContext"

export default function DecksScreen() {
  const router = useRouter()
  const { signOut } = useAuth()

  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // filters
  const [langFilter, setLangFilter] = useState<QuestionLanguageFilter>("all")
  const [sortFilter, setSortFilter] = useState<SortFilter>("newest")
  const [withinFilter, setWithinFilter] = useState<CreatedWithinFilter>("all")

  // create modal
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newLang, setNewLang] = useState("en-US")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const loadDecks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setDecks(await fetchMyDecks())
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { loadDecks() }, [loadDecks]))

  const filteredDecks = useMemo(() => {
    let result = [...decks]

    if (langFilter !== "all") {
      result = result.filter((d) => d.questionLanguage === langFilter)
    }

    const days = getDaysFromFilter(withinFilter)
    if (days !== null) {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
      result = result.filter((d) => new Date(d.createdAt).getTime() >= cutoff)
    }

    result.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortFilter === "newest" ? -diff : diff
    })

    return result
  }, [decks, langFilter, sortFilter, withinFilter])

  const handleCreate = async () => {
    if (!newName.trim()) {
      setCreateError("名前は必須です")
      return
    }
    try {
      setCreating(true)
      setCreateError(null)
      const deck = await createDeck({ name: newName.trim(), questionLanguage: newLang })
      setDecks((prev) => [deck, ...prev])
      setShowCreate(false)
      setNewName("")
      setNewLang("en-US")
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "作成に失敗しました")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = (id: number, name: string) => {
    Alert.alert("単語帳を削除", `「${name}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDeck(id)
            setDecks((prev) => prev.filter((d) => d.id !== id))
          } catch (e) {
            Alert.alert("エラー", e instanceof Error ? e.message : "削除に失敗しました")
          }
        },
      },
    ])
  }

  const isFiltered = langFilter !== "all" || withinFilter !== "all" || sortFilter !== "newest"

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
        <TouchableOpacity style={styles.primaryBtn} onPress={loadDecks}>
          <Text style={styles.primaryBtnText}>再試行</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerActions}>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Language */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {QUESTION_LANGUAGE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, langFilter === opt.value && styles.chipActive]}
              onPress={() => setLangFilter(opt.value as QuestionLanguageFilter)}
            >
              <Text style={[styles.chipText, langFilter === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {filteredDecks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {isFiltered ? "条件に一致する単語帳がありません。" : "単語帳がありません。"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDecks}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => (
                <TouchableOpacity
                  style={styles.deleteAction}
                  onPress={() => handleDelete(item.id, item.name)}
                >
                  <Text style={styles.deleteActionText}>削除</Text>
                </TouchableOpacity>
              )}
            >
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
            </Swipeable>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>単語帳を作成</Text>
              <TouchableOpacity onPress={() => { setShowCreate(false); setCreateError(null); setNewName("") }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>単語帳名 *</Text>
            <TextInput
              style={styles.input}
              placeholder="例: TOEIC 頻出単語"
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />

            <Text style={styles.label}>学習言語</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {QUESTION_LANGUAGE_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, newLang === opt.value && styles.chipActive]}
                  onPress={() => setNewLang(opt.value)}
                >
                  <Text style={[styles.chipText, newLang === opt.value && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {createError && <Text style={styles.errorText}>{createError}</Text>}

            <TouchableOpacity
              style={[styles.primaryBtn, creating && styles.primaryBtnDisabled]}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>作成する</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  createBtn: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  createBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  logoutText: { fontSize: 14, color: "#6b7280" },
  filtersContainer: { paddingBottom: 8 },
  chipRow: { paddingHorizontal: 16, paddingVertical: 4 },
  filterRow: { marginTop: 2 },
  filterRowInner: { flexDirection: "row", paddingHorizontal: 16, gap: 8 },
  chip: {
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#111827" },
  chipText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  chipTextActive: { color: "#ffffff" },
  resetChip: {
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#fee2e2",
  },
  resetChipText: { fontSize: 13, color: "#dc2626", fontWeight: "500" },
  list: { padding: 16, gap: 12 },
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
  cardContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  cardInfo: { flex: 1 },
  deckName: { fontSize: 17, fontWeight: "600", color: "#111827" },
  deckMeta: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  cardCountBadge: { backgroundColor: "#f3f4f6", borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  cardCountText: { fontSize: 12, fontWeight: "500", color: "#374151" },
  emptyText: { fontSize: 15, color: "#6b7280" },
  errorText: { fontSize: 14, color: "#dc2626", textAlign: "center", marginBottom: 12 },
  primaryBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  modalClose: { fontSize: 18, color: "#6b7280", padding: 4 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: { fontSize: 28, color: "#ffffff", lineHeight: 32 },
  deleteAction: {
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 16,
    marginLeft: 8,
  },
  deleteActionText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
})
