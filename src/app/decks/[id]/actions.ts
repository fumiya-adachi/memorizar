"use server"

import { revalidatePath } from "next/cache"
import { auth } from "../../../auth"
import { prisma } from "../../../lib/prisma"

export type FlashCardState = {
  error?: string
}

async function getAuthenticatedUser() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  return user
}

export async function createFlashCard(
  deckId: number,
  _prevState: FlashCardState,
  formData: FormData
): Promise<FlashCardState> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return { error: "ログインが必要です。" }
  }

  const question = formData.get("question")?.toString().trim() ?? ""
  const answer = formData.get("answer")?.toString().trim() ?? ""
  const description = formData.get("description") as string

  if (!question || !answer) {
    return { error: "問題と答えを入力してください。" }
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
      description,
    },
  })

  revalidatePath(`/decks/${deck.id}`)

  return {}
}

export async function updateFlashCard(
  deckId: number,
  cardId: number,
  _prevState: FlashCardState,
  formData: FormData
): Promise<FlashCardState> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return { error: "ログインが必要です。" }
  }

  const question = formData.get("question")?.toString().trim() ?? ""
  const answer = formData.get("answer")?.toString().trim() ?? ""
  const description = formData.get("description")?.toString().trim() ?? ""

  if (!question || !answer) {
    return { error: "問題と答えを入力してください。" }
  }

  const card = await prisma.flashCard.findFirst({
    where: {
      id: cardId,
      deckId,
      userId: user.id,
    },
  })

  if (!card) {
    return { error: "カードが見つかりません。" }
  }

  await prisma.flashCard.update({
    where: { id: card.id },
    data: {
      question,
      answer,
      description: description || null,
    },
  })

  revalidatePath(`/decks/${deckId}`)

  return {}
}

export async function deleteFlashCard(deckId: number, cardId: number) {
  const user = await getAuthenticatedUser()

  if (!user) {
    return
  }

  const card = await prisma.flashCard.findFirst({
    where: {
      id: cardId,
      deckId,
      userId: user.id,
    },
  })

  if (!card) {
    return
  }

  await prisma.flashCard.delete({
    where: { id: card.id },
  })

  revalidatePath(`/decks/${deckId}`)
}