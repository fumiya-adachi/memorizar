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

type FormValues = { question: string; answer: string }

type Props = {
  initialValues?: FormValues
  onSubmit: (values: FormValues) => Promise<void>
}

export default function CardFormScreen({ initialValues, onSubmit }: Props) {
  const [question, setQuestion] = useState(initialValues?.question ?? "")
  const [answer, setAnswer] = useState(initialValues?.answer ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = question.trim().length > 0 && answer.trim().length > 0

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ question: question.trim(), answer: answer.trim() })
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={88}
      >
        <View style={styles.content}>
          <View style={styles.field}>
            <Text style={styles.label}>問題</Text>
            <TextInput
              style={styles.input}
              value={question}
              onChangeText={setQuestion}
              placeholder="例: apple"
              placeholderTextColor="#9ca3af"
              autoFocus
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>答え</Text>
            <TextInput
              style={styles.input}
              value={answer}
              onChangeText={setAnswer}
              placeholder="例: りんご"
              placeholderTextColor="#9ca3af"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave || saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>保存する</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  flex: { flex: 1 },
  content: { flex: 1, padding: 16, gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  errorText: { fontSize: 13, color: "#dc2626" },
  footer: { padding: 16 },
  saveButton: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: { backgroundColor: "#d1d5db" },
  saveButtonText: { color: "#ffffff", fontSize: 17, fontWeight: "700" },
})
