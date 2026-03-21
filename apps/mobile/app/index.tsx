import { useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { fetchMe } from "@/lib/authApi"
import { clearSessionToken, loadSessionToken } from "@/lib/api"

export default function IndexScreen() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function bootstrap() {
      const token = await loadSessionToken()

      if (!token) {
        router.replace("/login")
        setLoading(false)
        return
      }

      try {
        await fetchMe()
        router.replace("/(tabs)")
      } catch {
        await clearSessionToken()
        router.replace("/login?reason=expired")
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [router])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
})
