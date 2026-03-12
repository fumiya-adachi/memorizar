"use server"

import { revalidatePath } from "next/cache"
import { auth } from "../../../auth"
import { prisma } from "../../../lib/prisma"

export type FlashCardState = {
  error?: string
}

export async function createFlashCard(
  deckId: number,
  _prevState: FlashCardState,
  formData: FormData
): Promise<FlashCardState> {
  const session = await auth()

  if (!session?.user?.email) {
    return { error: "ログインが必要です。" }
  }

  const question = formData.get("question")?.toString().trim() ?? ""
  const answer = formData.get("answer")?.toString().trim() ?? ""

  if (!question || !answer) {
    return { error: "問題と答えを入力してください。" }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return { error: "ユーザーが見つかりません。" }
  }

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId: user.id,
    },
  })

  if (!deck) {
    return { error: "Deckが見つかりません。" }
  }

  await prisma.flashCard.create({
    data: {
      userId: user.id,
      deckId: deck.id,
      question,
      answer,
    },
  })

  revalidatePath(`/decks/${deck.id}`)

  return {}
}