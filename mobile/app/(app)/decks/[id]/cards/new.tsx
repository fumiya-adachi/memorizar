import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import CardFormScreen from "../../../../../src/components/CardFormScreen"
import { createCard } from "../../../../../src/api/cards"

export default function NewCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const deckId = Number(id)

  return (
    <>
      <Stack.Screen options={{ title: "カードを追加", headerBackButtonDisplayMode: "minimal" }} />
      <CardFormScreen
        onSubmit={async (values) => {
          await createCard(deckId, values)
          router.back()
        }}
      />
    </>
  )
}
