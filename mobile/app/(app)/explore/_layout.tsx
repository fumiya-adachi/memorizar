import { Stack } from "expo-router"

export default function ExploreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "探す" }} />
      <Stack.Screen name="[id]/index" options={{ title: "単語帳の詳細", headerBackButtonDisplayMode: "minimal" }} />
    </Stack>
  )
}
