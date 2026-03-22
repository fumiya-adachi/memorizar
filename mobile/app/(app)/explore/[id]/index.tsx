import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router"
import { getLanguageLabel } from "@memorizar/shared"
import { fetchPublicDeck, importDeck, type PublicDeckDetail } from "../../../../src/api/decks"

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

function CardPreviewItem({ question, answer }: { question: string; answer: string }) {
  return (
    <View style={styles.cardItem}>
      <Text style={styles.cardQuestion} numberOfLines={2}>{question}</Text>
      <Text style={styles.cardAnswer} numberOfLines={2}>{answer}</Text>
    </View>
  )
}

// ─── Import Modal ─────────────────────────────────────────────────────────────

type ImportModalProps = {
  visible: boolean
  deckName: string
  cardCount: number
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ImportModal({ visible, deckName, cardCount, isLoading, onConfirm, onCancel }: ImportModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>単語帳を取り込む</Text>
          <Text style={styles.modalBody}>
            「{deckName}」（{cardCount} cards）を自分の単語帳に追加します。
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnCancel]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.modalBtnCancelText}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnConfirm, isLoading && styles.btnDisabled]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.modalBtnConfirmText}>取り込む</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PublicDeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const [deck, setDeck] = useState<PublicDeckDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchPublicDeck(Number(id))
      setDeck(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useFocusEffect(useCallback(() => { load() }, [load]))

  async function handleImport() {
    if (!deck) return
    setIsImporting(true)
    try {
      const newDeck = await importDeck(deck.id)
      setShowModal(false)
      router.replace(`/(app)/decks/${newDeck.id}`)
    } catch (e) {
      setShowModal(false)
      Alert.alert("エラー", e instanceof Error ? e.message : "取り込みに失敗しました")
    } finally {
      setIsImporting(false)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom", "left", "right"]}>
        <ActivityIndicator size="large" color="#111827" />
      </SafeAreaView>
    )
  }

  if (error || !deck) {
    return (
      <SafeAreaView style={styles.center} edges={["bottom", "left", "right"]}>
        <Text style={styles.errorText}>{error ?? "読み込みに失敗しました"}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>再試行</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <FlatList
        data={deck.cards}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* デッキ情報 */}
            <View style={styles.section}>
              <Text style={styles.deckName}>{deck.name}</Text>

              <View style={styles.infoBlock}>
                {deck.questionLanguage && (
                  <InfoRow label="学習言語" value={getLanguageLabel(deck.questionLanguage)} />
                )}
                {deck.questionLanguage && deck.answerLanguage && <View style={styles.divider} />}
                {/* {deck.answerLanguage && (
                  <InfoRow label="母国語" value={getLanguageLabel(deck.answerLanguage)} />
                )} */}
                {(deck.questionLanguage || deck.answerLanguage) && <View style={styles.divider} />}
                <InfoRow label="カード数" value={`${deck.cardCount} cards`} />
              </View>
            </View>

            {/* 取り込みボタン */}
            <View style={styles.ctaSection}>
              {deck.alreadyImported ? (
                <TouchableOpacity
                  style={[styles.primaryBtn, styles.primaryBtnAlready]}
                  onPress={() => router.replace(`/(app)/decks/${deck.importedDeckId}`)}
                >
                  <Text style={styles.primaryBtnAlreadyText}>取り込み済み — 単語帳を開く</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => setShowModal(true)}
                >
                  <Text style={styles.primaryBtnText}>取り込む（{deck.cardCount} cards）</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* カードプレビュータイトル */}
            <Text style={styles.previewTitle}>カード一覧</Text>
          </>
        }
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>カードがありません</Text>
        }
        renderItem={({ item }) => (
          <CardPreviewItem question={item.question} answer={item.answer} />
        )}
      />

      <ImportModal
        visible={showModal}
        deckName={deck.name}
        cardCount={deck.cardCount}
        isLoading={isImporting}
        onConfirm={handleImport}
        onCancel={() => setShowModal(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" },
  listContent: { paddingBottom: 40 },

  // デッキ情報
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  deckName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  infoBlock: { gap: 0 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  infoLabel: { fontSize: 14, color: "#6b7280" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  divider: { height: 1, backgroundColor: "#f3f4f6" },

  // CTA
  ctaSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  primaryBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnAlready: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  primaryBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 16 },
  primaryBtnAlreadyText: { color: "#6b7280", fontWeight: "600", fontSize: 15 },

  // カードプレビュー
  previewTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  cardItem: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cardSeparator: { height: 6 },
  cardQuestion: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 4 },
  cardAnswer: { fontSize: 14, color: "#6b7280" },
  emptyText: { textAlign: "center", color: "#9ca3af", fontSize: 14, marginTop: 24 },

  // エラー
  errorText: { fontSize: 14, color: "#dc2626", marginBottom: 12, textAlign: "center" },
  retryBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: "#ffffff", fontWeight: "600" },

  // モーダル
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: "#f3f4f6",
  },
  modalBtnConfirm: {
    backgroundColor: "#111827",
  },
  btnDisabled: { opacity: 0.5 },
  modalBtnCancelText: { color: "#374151", fontWeight: "600", fontSize: 15 },
  modalBtnConfirmText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },
})
