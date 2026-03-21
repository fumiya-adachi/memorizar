import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getApiUser } from "@/lib/apiAuth"

const RequestSchema = z.object({
  cardId: z.number().int(),
  isCorrect: z.boolean(),
})

function calculateNextReviewDate(isCorrect: boolean) {
  const now = new Date()
  now.setDate(now.getDate() + (isCorrect ? 3 : 1))
  return now
}

export async function POST(request: Request) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { cardId, isCorrect } = parsed.data

  const card = await prisma.flashCard.findUnique({
    where: { id: cardId },
    select: { id: true, deckId: true },
  })
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 })
  }

  // ユーザーが所有するデッキ、または取り込み元デッキを参照しているデッキを確認
  const userDeck = await prisma.deck.findFirst({
    where: {
      userId: user.id,
      OR: [{ id: card.deckId }, { sourceDeckId: card.deckId }],
    },
  })
  if (!userDeck) {
    return NextResponse.json({ error: "Unauthorized card access" }, { status: 403 })
  }

  const nextReview = calculateNextReviewDate(isCorrect)
  const existing = await prisma.flashCardProgress.findUnique({
    where: { userId_cardId: { userId: user.id, cardId: card.id } },
  })

  if (!existing) {
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
      where: { userId_cardId: { userId: user.id, cardId: card.id } },
      data: {
        correctCount: isCorrect ? existing.correctCount + 1 : existing.correctCount,
        wrongCount: !isCorrect ? existing.wrongCount + 1 : existing.wrongCount,
        reviewCount: existing.reviewCount + 1,
        lastReviewed: new Date(),
        nextReview,
      },
    })
  }

  return NextResponse.json({ ok: true })
}
