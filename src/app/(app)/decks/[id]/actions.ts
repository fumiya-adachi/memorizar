"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { ROUTES } from "@/constants/routes"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/currentUser"

export type FlashCardState = {
  error?: string
}

export type DeckNameState = {
  error?: string
}

export type DeckVisibilityState = {
  error?: string
}

export async function createFlashCard(
  deckId: number,
  _prevState: FlashCardState,
  formData: FormData
): Promise<FlashCardState> {
  const user = await getCurrentUser()

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
    select: {
      id: true,
      sourceDeckId: true,
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
  const user = await getCurrentUser()

  if (!user) {
    return { error: "ログインが必要です。" }
  }

  const question = formData.get("question")?.toString().trim() ?? ""
  const answer = formData.get("answer")?.toString().trim() ?? ""
  const description = formData.get("description")?.toString().trim() ?? ""

  if (!question || !answer) {
    return { error: "問題と答えを入力してください。" }
  }

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId: user.id,
    },
    select: {
      id: true,
      sourceDeckId: true,
    },
  })

  if (!deck) {
    return { error: "Deckが見つかりません。" }
  }

  const localCard = await prisma.flashCard.findFirst({
    where: {
      id: cardId,
      deckId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  })

  if (localCard) {
    await prisma.flashCard.update({
      where: { id: localCard.id },
      data: {
        question,
        answer,
        description: description || null,
      },
    })

    revalidatePath(ROUTES.deckDetail(deckId))
    revalidatePath(ROUTES.deckReview(deckId))

    return {}
  }

  if (!deck.sourceDeckId) {
    return { error: "カードが見つかりません。" }
  }

  const sourceCard = await prisma.flashCard.findFirst({
    where: {
      id: cardId,
      deckId: deck.sourceDeckId,
    },
    select: {
      id: true,
    },
  })

  if (!sourceCard) {
    return { error: "カードが見つかりません。" }
  }

  await prisma.$transaction(async (tx) => {
    const existingOverride = await tx.flashCard.findFirst({
      where: {
        deckId: deck.id,
        userId: user.id,
        sourceCardId: sourceCard.id,
      },
      select: {
        id: true,
      },
    })

    const overrideCard = existingOverride
      ? await tx.flashCard.update({
          where: {
            id: existingOverride.id,
          },
          data: {
            question,
            answer,
            description: description || null,
          },
          select: {
            id: true,
          },
        })
      : await tx.flashCard.create({
          data: {
            userId: user.id,
            deckId: deck.id,
            sourceCardId: sourceCard.id,
            question,
            answer,
            description: description || null,
          },
          select: {
            id: true,
          },
        })

    const progress = await tx.flashCardProgress.findUnique({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId: sourceCard.id,
        },
      },
    })

    if (progress) {
      await tx.flashCardProgress.delete({
        where: {
          userId_cardId: {
            userId: user.id,
            cardId: sourceCard.id,
          },
        },
      })

      await tx.flashCardProgress.create({
        data: {
          userId: progress.userId,
          cardId: overrideCard.id,
          correctCount: progress.correctCount,
          wrongCount: progress.wrongCount,
          reviewCount: progress.reviewCount,
          nextReview: progress.nextReview,
          lastReviewed: progress.lastReviewed,
        },
      })
    }

    await tx.reviewHistory.updateMany({
      where: {
        userId: user.id,
        cardId: sourceCard.id,
      },
      data: {
        cardId: overrideCard.id,
      },
    })
  })

  revalidatePath(ROUTES.deckDetail(deckId))
  revalidatePath(ROUTES.deckReview(deckId))

  return {}
}

export async function deleteFlashCard(deckId: number, cardId: number) {
  const user = await getCurrentUser()

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
      sourceDeckId: true,
    },
  })

  if (!deck) {
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

  // 他ユーザーの学習記録も含めて削除（FK制約違反を防ぐ）
  await prisma.$transaction(async (tx) => {
    await tx.reviewHistory.deleteMany({ where: { cardId: card.id } })
    await tx.flashCardProgress.deleteMany({ where: { cardId: card.id } })
    await tx.flashCard.delete({ where: { id: card.id } })
  })

  revalidatePath(ROUTES.deckDetail(deckId))
}

export async function deleteDeck(deckId: number) {
  const user = await getCurrentUser()

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
      // 他ユーザーの学習記録も含めて削除（FK制約違反を防ぐ）
      await tx.reviewHistory.deleteMany({
        where: { cardId: { in: cardIds } },
      })

      await tx.flashCardProgress.deleteMany({
        where: { cardId: { in: cardIds } },
      })

      await tx.flashCard.deleteMany({
        where: {
          id: { in: cardIds },
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
  const user = await getCurrentUser()

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

export async function updateDeckVisibility(
  deckId: number,
  _prevState: DeckVisibilityState,
  formData: FormData
): Promise<DeckVisibilityState> {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "ログインが必要です。" }
  }

  const isPublic = formData.get("isPublic") === "on"

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId: user.id,
    },
    select: {
      id: true,
      sourceDeckId: true,
    },
  })

  if (!deck) {
    return { error: "Deckが見つかりません。" }
  }

  if (deck.sourceDeckId) {
    return { error: "取り込み単語帳は公開設定を変更できません。" }
  }

  await prisma.deck.update({
    where: { id: deckId },
    data: {
      isPublic,
    },
  })

  revalidatePath(ROUTES.deckDetail(deckId))
  revalidatePath(ROUTES.decks)
  revalidatePath(ROUTES.publicDecks)

  return {}
}