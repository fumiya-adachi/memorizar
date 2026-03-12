"use server"

import { revalidatePath } from "next/cache"
import { auth } from "../../../../auth"
import { prisma } from "../../../../lib/prisma"

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
  const session = await auth()

  if (!session?.user?.email) {
    return
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return
  }

  const card = await prisma.flashCard.findFirst({
    where: {
      id: cardId,
      userId: user.id,
      deckId: deckId,
    },
  })

  if (!card) {
    return
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

  revalidatePath("/review")
}