import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import type { CardData } from "@memorizar/shared"
import { fetchCards, updateCard } from "../../../../../../src/api/cards"
import CardFormScreen from "../../../../../../src/components/CardFormScreen"

export default function EditCardScreen() {
  const { id, cardId } = useLocalSearchParams<{ id: string; cardId: string }>()
  const router = useRouter()
  const deckId = Number(id)
  const cardIdNum = Number(cardId)

  const [card, setCard] = useState<CardData | null>(null)

  useEffect(() => {
    fetchCards(deckId).then((cards) => {
      setCard(cards.find((c) => c.id === cardIdNum) ?? null)
    })
  }, [deckId, cardIdNum])

  if (!card) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }} edges={["bottom", "left", "right"]}>
        <Stack.Screen options={{ title: "カードを編集", headerBackButtonDisplayMode: "minimal" }} />
        <ActivityIndicator size="large" color="#111827" />
      </SafeAreaView>
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: "カードを編集", headerBackButtonDisplayMode: "minimal" }} />
      <CardFormScreen
        initialValues={{ question: card.question, answer: card.answer }}
        onSubmit={async (values) => {
          await updateCard(cardIdNum, values)
          router.back()
        }}
      />
    </>
  )
}
