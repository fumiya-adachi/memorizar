import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getApiUser } from "@/lib/apiAuth"
import type { DeckSummary } from "@memorizar/shared"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const sourceDeckId = Number(id)
  if (Number.isNaN(sourceDeckId)) {
    return NextResponse.json({ error: "Invalid deck id" }, { status: 400 })
  }

  const sourceDeck = await prisma.deck.findFirst({
    where: { id: sourceDeckId, isPublic: true, sourceDeckId: null },
    include: { flashcards: true },
  })
  if (!sourceDeck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 })
  }

  // 重複チェック
  const existing = await prisma.deck.findFirst({
    where: { userId: user.id, sourceDeckId },
  })
  if (existing) {
    return NextResponse.json({ error: "既に取り込み済みです" }, { status: 409 })
  }

  const newDeck = await prisma.deck.create({
    data: {
      userId: user.id,
      name: sourceDeck.name,
      questionLanguage: sourceDeck.questionLanguage,
      answerLanguage: sourceDeck.answerLanguage,
      sourceDeckId,
      flashcards: {
        create: sourceDeck.flashcards.map((card) => ({
          userId: user.id,
          question: card.question,
          answer: card.answer,
          description: card.description,
          sourceCardId: card.id,
        })),
      },
    },
  })

  const summary: DeckSummary = {
    id: newDeck.id,
    name: newDeck.name,
    questionLanguage: newDeck.questionLanguage,
    answerLanguage: newDeck.answerLanguage,
    cardCount: sourceDeck.flashcards.length,
    sourceDeckId: newDeck.sourceDeckId,
    createdAt: newDeck.createdAt.toISOString(),
  }

  return NextResponse.json(summary, { status: 201 })
}
