import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="decks/[id]/review"
          options={{ title: "復習", headerBackTitle: "戻る" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}
