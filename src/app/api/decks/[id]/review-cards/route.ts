import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getApiUser } from "@/lib/apiAuth"
import type { ReviewCardData } from "@memorizar/shared"

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const deckId = Number(id)
  if (Number.isNaN(deckId)) {
    return NextResponse.json({ error: "Invalid deck id" }, { status: 400 })
  }

  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: user.id },
  })
  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 })
  }

  const progressInclude = {
    where: { userId: user.id },
    take: 1,
  } as const

  const resolvedDeck = deck
  const resolvedUser = user
  const isImportedDeck = resolvedDeck.sourceDeckId !== null

  async function loadCards() {
    if (isImportedDeck) {
      const localCards = await prisma.flashCard.findMany({
        where: { deckId: resolvedDeck.id, userId: resolvedUser.id },
        include: { deck: true, progress: progressInclude },
      })

      const overriddenSourceCardIds = localCards
        .map((c) => c.sourceCardId)
        .filter((id): id is number => id !== null)

      const sourceCards = await prisma.flashCard.findMany({
        where: {
          deckId: resolvedDeck.sourceDeckId!,
          ...(overriddenSourceCardIds.length > 0
            ? { id: { notIn: overriddenSourceCardIds } }
            : {}),
        },
        include: { deck: true, progress: progressInclude },
      })

      return [...localCards, ...sourceCards]
    }

    return prisma.flashCard.findMany({
      where: { deckId: resolvedDeck.id },
      include: { deck: true, progress: progressInclude },
    })
  }

  const rawCards = await loadCards()

  const cards: ReviewCardData[] = rawCards.map((card) => ({
    id: card.id,
    question: card.question,
    answer: card.answer,
    description: card.description,
    deckName: resolvedDeck.name,
    questionLanguage: resolvedDeck.questionLanguage ?? card.deck.questionLanguage,
    answerLanguage: resolvedDeck.answerLanguage ?? card.deck.answerLanguage,
    progress: card.progress[0]
      ? {
          correctCount: card.progress[0].correctCount,
          reviewCount: card.progress[0].reviewCount,
        }
      : null,
  }))

  return NextResponse.json(cards)
}
