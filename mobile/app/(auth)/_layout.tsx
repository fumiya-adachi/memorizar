import { Stack } from "expo-router"

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="terms" options={{ headerShown: true, title: "利用規約", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="privacy" options={{ headerShown: true, title: "プライバシーポリシー", headerBackButtonDisplayMode: "minimal" }} />
    </Stack>
  )
}
