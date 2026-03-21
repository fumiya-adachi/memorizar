import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/apiAuth"
import { calculateNextReviewDate } from "@memorizar/shared/features/review/srs"

type Params = { params: Promise<{ id: string; cardId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const result = await requireApiUser(req)
  if (result instanceof NextResponse) return result
  const { user } = result

  const { id, cardId: cardIdStr } = await params
  const deckId = Number(id)
  const cardId = Number(cardIdStr)

  if (Number.isNaN(deckId) || Number.isNaN(cardId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).isCorrect !== "boolean"
  ) {
    return NextResponse.json({ error: "isCorrect (boolean) is required" }, { status: 400 })
  }

  const { isCorrect } = body as { isCorrect: boolean }

  // カードがユーザーのアクセス範囲内にあるか確認
  const card = await prisma.flashCard.findUnique({
    where: { id: cardId },
    select: { id: true, deckId: true },
  })

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 })
  }

  const userDeck = await prisma.deck.findFirst({
    where: {
      userId: user.id,
      OR: [
        { id: card.deckId },
        { sourceDeckId: card.deckId },
      ],
    },
    select: { id: true },
  })

  if (!userDeck) {
    return NextResponse.json({ error: "Unauthorized card access" }, { status: 403 })
  }

  const nextReview = calculateNextReviewDate(isCorrect)

  const existing = await prisma.flashCardProgress.findUnique({
    where: { userId_cardId: { userId: user.id, cardId } },
  })

  if (!existing) {
    await prisma.flashCardProgress.create({
      data: {
        userId: user.id,
        cardId,
        correctCount: isCorrect ? 1 : 0,
        wrongCount: isCorrect ? 0 : 1,
        reviewCount: 1,
        lastReviewed: new Date(),
        nextReview,
      },
    })
  } else {
    await prisma.flashCardProgress.update({
      where: { userId_cardId: { userId: user.id, cardId } },
      data: {
        correctCount: isCorrect ? existing.correctCount + 1 : existing.correctCount,
        wrongCount: !isCorrect ? existing.wrongCount + 1 : existing.wrongCount,
        reviewCount: existing.reviewCount + 1,
        lastReviewed: new Date(),
        nextReview,
      },
    })
  }

  return NextResponse.json({ ok: true, nextReview: nextReview.toISOString() })
}
