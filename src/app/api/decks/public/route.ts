import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getApiUser } from "@/lib/apiAuth"
import type { DeckSummary } from "@memorizar/shared"

export async function GET(request: Request) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const publicDecks = await prisma.deck.findMany({
    where: { isPublic: true, sourceDeckId: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { flashcards: true } },
    },
  })

  const result: DeckSummary[] = publicDecks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    questionLanguage: deck.questionLanguage,
    answerLanguage: deck.answerLanguage,
    cardCount: deck._count.flashcards,
    sourceDeckId: deck.sourceDeckId,
    createdAt: deck.createdAt.toISOString(),
  }))

  return NextResponse.json(result)
}
