"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { ROUTES } from "@/constants/routes"
import { getCurrentUser } from "@/lib/currentUser"

function calculateNextReviewDate(isCorrect: boolean) {
  const now = new Date()

  if (!isCorrect) {
    now.setDate(now.getDate() + 1)
    return now
  }

  now.setDate(now.getDate() + 3)
  return now
}

export async function markFlashCardResult(cardId: number, isCorrect: boolean) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const card = await prisma.flashCard.findUnique({
    where: {
      id: cardId,
    },
    select: {
      id: true,
      deckId: true,
    },
  })

  if (!card) {
    throw new Error("Card not found")
  }

  // ユーザーが所有するデッキ、または取り込み元デッキとして参照しているデッキを探す
  const userDeck = await prisma.deck.findFirst({
    where: {
      userId: user.id,
      OR: [
        { id: card.deckId },           // 自分のデッキ
        { sourceDeckId: card.deckId }, // 取り込み先デッキ
      ],
    },
    select: {
      id: true,
    },
  })

  if (!userDeck) {
    throw new Error("Unauthorized card access")
  }

  const existingProgress = await prisma.flashCardProgress.findUnique({
    where: {
      userId_cardId: {
        userId: user.id,
        cardId: card.id,
      },
    },
  })

  const nextReview = calculateNextReviewDate(isCorrect)

  if (!existingProgress) {
    await prisma.flashCardProgress.create({
      data: {
        userId: user.id,
        cardId: card.id,
        correctCount: isCorrect ? 1 : 0,
        wrongCount: isCorrect ? 0 : 1,
        reviewCount: 1,
        lastReviewed: new Date(),
        nextReview,
      },
    })
  } else {
    await prisma.flashCardProgress.update({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId: card.id,
        },
      },
      data: {
        correctCount: isCorrect
          ? existingProgress.correctCount + 1
          : existingProgress.correctCount,
        wrongCount: !isCorrect
          ? existingProgress.wrongCount + 1
          : existingProgress.wrongCount,
        reviewCount: existingProgress.reviewCount + 1,
        lastReviewed: new Date(),
        nextReview,
      },
    })
  }

  revalidatePath(ROUTES.deckReview(userDeck.id))
}