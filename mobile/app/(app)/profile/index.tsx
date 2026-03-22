import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useFocusEffect, useRouter } from "expo-router"
import { useAuth } from "../../../src/context/AuthContext"
import { fetchProfileSummary, type ProfileSummary } from "../../../src/api/profile"


// ─── Sub-components ───────────────────────────────────────────────────────────

function InitialAvatar({ name, email }: { name: string | null; email: string }) {
  const letter = (name ?? email).charAt(0).toUpperCase()
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{letter}</Text>
    </View>
  )
}

function UserCard({ summary }: { summary: ProfileSummary }) {
  return (
    <View style={styles.card}>
      <InitialAvatar name={summary.name} email={summary.email} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{summary.name ?? "ユーザー"}</Text>
        <Text style={styles.userEmail}>{summary.email}</Text>
      </View>
    </View>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  )
}

function SummaryCard({ summary }: { summary: ProfileSummary }) {
  const accuracy = summary.overallAccuracy !== null
    ? `${summary.overallAccuracy}%`
    : "—"

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>学習サマリー</Text>
      <View style={styles.summaryRow}>
        <SummaryItem label="総カード数" value={String(summary.totalCards)} />
        <View style={styles.summaryDivider} />
        <SummaryItem label="今日の復習" value={String(summary.todayReviews)} />
        <View style={styles.summaryDivider} />
        <SummaryItem label="全体正答率" value={accuracy} />
      </View>
    </View>
  )
}

function MenuItem({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Text style={styles.menuChevron}>›</Text>
    </TouchableOpacity>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { signOut } = useAuth()
  const router = useRouter()
  const [summary, setSummary] = useState<ProfileSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setSummary(await fetchProfileSummary())
    } catch {
      // サマリー取得失敗はサイレントに無視（ログアウトは機能させる）
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  function handleSignOut() {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "ログアウト", style: "destructive", onPress: signOut },
    ])
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>プロフィール</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#111827" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {summary && (
            <>
              <UserCard summary={summary} />
              <SummaryCard summary={summary} />
            </>
          )}

          <View style={styles.menuCard}>
            <MenuItem label="ログアウト" onPress={handleSignOut} danger />
          </View>

          <Text style={styles.sectionLabel}>法的情報</Text>
          <View style={styles.menuCard}>
            <MenuItem label="プライバシーポリシー" onPress={() => router.push("/(app)/profile/privacy")} />
            <View style={styles.menuDivider} />
            <MenuItem label="利用規約" onPress={() => router.push("/(app)/profile/terms")} />
          </View>

          <Text style={styles.version}>v{require("../../../package.json").version}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827" },
  loader: { flex: 1 },
  content: { padding: 16, gap: 12 },

  // カード共通
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ユーザーカード
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 22, fontWeight: "700", color: "#ffffff" },
  userInfo: { gap: 2 },
  userName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  userEmail: { fontSize: 14, color: "#6b7280" },

  // サマリー
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center", gap: 4 },
  summaryDivider: { width: 1, height: 36, backgroundColor: "#e5e7eb" },
  summaryValue: { fontSize: 22, fontWeight: "700", color: "#111827" },
  summaryLabel: { fontSize: 11, color: "#9ca3af", textAlign: "center" },

  // セクションラベル
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 6,
    marginLeft: 4,
  },

  // メニュー
  menuCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLabel: { fontSize: 15, color: "#111827", fontWeight: "500" },
  menuLabelDanger: { color: "#dc2626" },
  menuChevron: { fontSize: 20, color: "#d1d5db" },
  menuDivider: { height: 1, backgroundColor: "#f3f4f6", marginLeft: 16 },

  // バージョン
  version: {
    fontSize: 12,
    color: "#d1d5db",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
})
