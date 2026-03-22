import { Stack } from "expo-router"

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ title: "利用規約", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="privacy" options={{ title: "プライバシーポリシー", headerBackButtonDisplayMode: "minimal" }} />
    </Stack>
  )
}
