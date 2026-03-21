import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/apiAuth"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const result = await requireApiUser(req)
  if (result instanceof NextResponse) return result
  const { user } = result

  const { id } = await params
  const deckId = Number(id)

  if (Number.isNaN(deckId)) {
    return NextResponse.json({ error: "Invalid deck id" }, { status: 400 })
  }

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
      questionLanguage: true,
      answerLanguage: true,
      sourceDeckId: true,
    },
  })

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 })
  }

  const progressInclude = {
    where: { userId: user.id },
    select: {
      correctCount: true,
      wrongCount: true,
      reviewCount: true,
      nextReview: true,
      lastReviewed: true,
    },
    take: 1,
  } as const

  async function loadCards() {
    if (!deck) return []
    if (deck.sourceDeckId !== null) {
      const localCards = await prisma.flashCard.findMany({
        where: { deckId: deck.id, userId: user.id },
        include: { progress: progressInclude },
      })

      const overriddenSourceCardIds = localCards
        .map((c) => c.sourceCardId)
        .filter((v): v is number => v !== null)

      const sourceCards = await prisma.flashCard.findMany({
        where: {
          deckId: deck.sourceDeckId!,
          ...(overriddenSourceCardIds.length > 0
            ? { id: { notIn: overriddenSourceCardIds } }
            : {}),
        },
        include: { progress: progressInclude },
      })

      return [...localCards, ...sourceCards]
    }

    return prisma.flashCard.findMany({
      where: { deckId: deck.id },
      include: { progress: progressInclude },
    })
  }

  const cards = await loadCards()

  const data = cards.map((card) => {
    const p = card.progress[0] ?? null
    return {
      id: card.id,
      question: card.question,
      answer: card.answer,
      description: card.description,
      questionLanguage: deck.questionLanguage,
      answerLanguage: deck.answerLanguage,
      progress: p
        ? {
            correctCount: p.correctCount,
            wrongCount: p.wrongCount,
            reviewCount: p.reviewCount,
            nextReview: p.nextReview?.toISOString() ?? null,
            lastReviewed: p.lastReviewed?.toISOString() ?? null,
          }
        : null,
    }
  })

  return NextResponse.json({ deckId, deckName: deck.name, cards: data })
}
