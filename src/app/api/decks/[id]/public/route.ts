import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getApiUser } from "@/lib/apiAuth"
import type { CardData } from "@memorizar/shared"

type Params = { params: Promise<{ id: string }> }

export type PublicDeckDetail = {
  id: number
  name: string
  questionLanguage: string | null
  answerLanguage: string | null
  cardCount: number
  cards: CardData[]
  alreadyImported: boolean
  importedDeckId: number | null
}

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
    where: { id: deckId, isPublic: true, sourceDeckId: null },
    include: {
      flashcards: {
        orderBy: { createdAt: "asc" },
        select: { id: true, question: true, answer: true, description: true },
      },
    },
  })
  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 })
  }

  const imported = await prisma.deck.findFirst({
    where: { userId: user.id, sourceDeckId: deckId },
    select: { id: true },
  })

  const result: PublicDeckDetail = {
    id: deck.id,
    name: deck.name,
    questionLanguage: deck.questionLanguage,
    answerLanguage: deck.answerLanguage,
    cardCount: deck.flashcards.length,
    cards: deck.flashcards,
    alreadyImported: imported !== null,
    importedDeckId: imported?.id ?? null,
  }

  return NextResponse.json(result)
}
