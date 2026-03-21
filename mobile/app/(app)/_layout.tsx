import { Redirect, Stack } from "expo-router"
import { useAuth } from "../../src/context/AuthContext"

export default function AppLayout() {
  const { token } = useAuth()

  if (!token) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <Stack>
      <Stack.Screen name="decks/index" options={{ title: "単語帳一覧" }} />
      <Stack.Screen name="decks/[id]/index" options={{ title: "単語帳詳細" }} />
      <Stack.Screen name="decks/[id]/review" options={{ title: "復習", headerShown: false }} />
    </Stack>
  )
}
