import { Stack } from "expo-router"

export default function DecksLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "単語帳" }} />
      <Stack.Screen name="[id]/index" options={{ title: "単語帳詳細", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="[id]/review" options={{ title: "復習", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="[id]/cards/index" options={{ title: "カード一覧", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="[id]/cards/new" options={{ title: "カードを追加", headerBackButtonDisplayMode: "minimal" }} />
      <Stack.Screen name="[id]/cards/[cardId]/edit" options={{ title: "カードを編集", headerBackButtonDisplayMode: "minimal" }} />
    </Stack>
  )
}
