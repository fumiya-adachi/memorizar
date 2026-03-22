import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../../../src/context/AuthContext"

export default function ProfileScreen() {
  const { signOut } = useAuth()

  const handleSignOut = () => {
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

      <View style={styles.content}>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={handleSignOut}>
            <Text style={styles.rowLabelDanger}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827" },
  content: { flex: 1, padding: 16, gap: 16 },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabelDanger: { fontSize: 15, color: "#dc2626", fontWeight: "500" },
})
