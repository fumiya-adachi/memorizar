import { useState } from "react"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAuth } from "../../src/context/AuthContext"
import { mobileSignIn } from "../../src/api/auth"


export default function LoginScreen() {
  const { signIn } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState(__DEV__ ? "demo@example.com" : "")
  const [password, setPassword] = useState(__DEV__ ? "demo123456" : "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = await mobileSignIn(email.trim().toLowerCase(), password)
      await signIn(token)
      router.replace("/(app)/decks")
    } catch (e) {
      setError(e instanceof Error ? e.message : "ログインに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={styles.title}>memorizar</Text>
        <Text style={styles.subtitle}>ログイン</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="パスワード"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleSignIn}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>ログイン</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.consentText}>
          ログインすることで、
          <Text style={styles.consentLink} onPress={() => router.push("/(auth)/terms")}>利用規約</Text>
          {"および"}
          <Text style={styles.consentLink} onPress={() => router.push("/(auth)/privacy")}>プライバシーポリシー</Text>
          に同意したものとみなします。
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    color: "#111827",
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  consentText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
  },
  consentLink: {
    color: "#6b7280",
    textDecorationLine: "underline",
  },
})
