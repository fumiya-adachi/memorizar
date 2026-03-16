"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ROUTES } from "@/constants/routes"
import { redirect } from "next/navigation"

export type FlashCardState = {
  error?: string
}

export type DeckNameState = {
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

  revalidatePath(ROUTES.deckDetail(deck.id))

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

  revalidatePath(ROUTES.deckDetail(deckId))

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

  revalidatePath(ROUTES.deckDetail(deckId))
}

export async function deleteDeck(deckId: number) {
  const user = await getAuthenticatedUser()

  if (!user) {
    return
  }

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId: user.id,
    },
    select: {
      id: true,
      flashcards: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!deck) {
    return
  }

  const cardIds = deck.flashcards.map((card) => card.id)

  await prisma.$transaction(async (tx) => {
    if (cardIds.length > 0) {
      await tx.reviewHistory.deleteMany({
        where: {
          userId: user.id,
          cardId: {
            in: cardIds,
          },
        },
      })

      await tx.flashCardProgress.deleteMany({
        where: {
          userId: user.id,
          cardId: {
            in: cardIds,
          },
        },
      })

      await tx.flashCard.deleteMany({
        where: {
          id: {
            in: cardIds,
          },
          userId: user.id,
        },
      })
    }

    await tx.deck.delete({
      where: {
        id: deck.id,
      },
    })
  })

  revalidatePath(ROUTES.decks)
  redirect(ROUTES.decks)
}

export async function updateDeckName(
  deckId: number,
  _prevState: DeckNameState,
  formData: FormData
): Promise<DeckNameState> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return { error: "ログインが必要です。" }
  }

  const name = formData.get("name")?.toString().trim() ?? ""

  if (!name) {
    return { error: "単語帳名を入力してください。" }
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

  const existingDeck = await prisma.deck.findFirst({
    where: {
      userId: user.id,
      name,
      NOT: {
        id: deckId,
      },
    },
  })

  if (existingDeck) {
    return { error: "同じ名前の単語帳名が既に存在します。" }
  }

  await prisma.deck.update({
    where: { id: deckId },
    data: { name },
  })

  revalidatePath(ROUTES.deckDetail(deckId))
  revalidatePath(ROUTES.decks)

  return {}
}