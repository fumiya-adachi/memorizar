import { useState } from "react"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { loginWithPassword } from "@/lib/authApi"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const submit = async () => {
    if (!email.trim() || !password) {
      setError("メールアドレスとパスワードを入力してください。")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await loginWithPassword(email.trim().toLowerCase(), password)
      router.replace("/(tabs)")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "ログインに失敗しました。")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", default: undefined })}
    >
      <View style={styles.card}>
        <Text style={styles.eyebrow}>memorizar mobile</Text>
        <Text style={styles.title}>ログイン</Text>
        <Text style={styles.subtitle}>Web版と同じアカウントで利用できます。</Text>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              style={styles.input}
            />
          </View>

          <View>
            <Text style={styles.label}>パスワード</Text>
            <TextInput
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              style={styles.input}
            />
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.submitButton} onPress={submit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>ログインする</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#64748b",
  },
  title: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  form: {
    marginTop: 24,
    gap: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#0f172a",
  },
  errorText: {
    marginTop: 16,
    color: "#dc2626",
    fontSize: 14,
  },
  submitButton: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#0f172a",
    paddingVertical: 16,
  },
  submitText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
})
