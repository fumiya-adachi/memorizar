import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { updateProfile, deleteAccount } from "../../../src/api/profile"
import { useAuth } from "../../../src/context/AuthContext"

export default function ProfileEditScreen() {
  const router = useRouter()
  const { signOut } = useAuth()

  // 前画面から初期値を受け取る
  const params = useLocalSearchParams<{ name?: string; email?: string }>()

  const [name, setName] = useState(params.name ?? "")
  const [email, setEmail] = useState(params.email ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim()) {
      setError("ユーザー名を入力してください")
      return
    }
    if (!email.trim()) {
      setError("メールアドレスは必須です")
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      await updateProfile({ name: name.trim(), email: email.trim() })
      router.back()
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      "アカウントを削除",
      "アカウントを削除すると、すべてのデータが完全に失われます。この操作は取り消せません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除する",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount()
              await signOut()
            } catch (e) {
              Alert.alert("エラー", e instanceof Error ? e.message : "削除に失敗しました")
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>ユーザー名</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="名前を入力"
              placeholderTextColor="#9ca3af"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="メールアドレスを入力"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveBtnText}>保存する</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dangerSection}>
            {/* <Text style={styles.dangerLabel}>危険な操作</Text> */}
            <View style={styles.dangerCard}>
              <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteAccount}>
                <View style={styles.dangerRowMain}>
                  <Text style={styles.dangerTitle}>アカウントを削除</Text>
                  <Text style={styles.dangerDesc}>すべてのデータが完全に削除されます</Text>
                </View>
                <Text style={styles.dangerChevron}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  flex: { flex: 1 },
  content: { padding: 16, gap: 16 },

  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 12,
  },
  errorText: { color: "#dc2626", fontSize: 14 },

  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginLeft: 2 },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },

  saveBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 16 },

  dangerSection: { marginTop: 16, gap: 8 },
  dangerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  dangerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    overflow: "hidden",
  },
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dangerRowMain: { flex: 1, gap: 2 },
  dangerTitle: { fontSize: 15, fontWeight: "600", color: "#dc2626" },
  dangerDesc: { fontSize: 12, color: "#9ca3af" },
  dangerChevron: { fontSize: 20, color: "#fca5a5" },
})
