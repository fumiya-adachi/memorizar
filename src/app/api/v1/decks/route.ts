import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/apiAuth"
import { calcImportedDeckCardCount } from "@memorizar/shared/features/decks/cardCount"

export async function GET(req: NextRequest) {
  const result = await requireApiUser(req)
  if (result instanceof NextResponse) return result
  const { user } = result

  const decks = await prisma.deck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      questionLanguage: true,
      answerLanguage: true,
      sourceDeckId: true,
      createdAt: true,
    },
  })

  const deckIds = decks.map((d) => d.id)
  const importedDecks = decks.filter((d) => d.sourceDeckId !== null)
  const importedDeckIds = importedDecks.map((d) => d.id)
  const sourceDeckIds = importedDecks.map((d) => d.sourceDeckId!)

  const [localCounts, sourceCounts, overrideCounts] = await Promise.all([
    deckIds.length > 0
      ? prisma.flashCard.groupBy({
          by: ["deckId"],
          where: { deckId: { in: deckIds } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    sourceDeckIds.length > 0
      ? prisma.flashCard.groupBy({
          by: ["deckId"],
          where: { deckId: { in: sourceDeckIds } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    importedDeckIds.length > 0
      ? prisma.flashCard.groupBy({
          by: ["deckId"],
          where: {
            deckId: { in: importedDeckIds },
            sourceCardId: { not: null },
          },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ])

  const localCountMap = new Map(localCounts.map((x) => [x.deckId, x._count._all]))
  const sourceCountMap = new Map(sourceCounts.map((x) => [x.deckId, x._count._all]))
  const overrideCountMap = new Map(overrideCounts.map((x) => [x.deckId, x._count._all]))

  const data = decks.map((deck) => {
    const localCardCount = localCountMap.get(deck.id) ?? 0
    const cardCount =
      deck.sourceDeckId === null
        ? localCardCount
        : calcImportedDeckCardCount(
            sourceCountMap.get(deck.sourceDeckId) ?? 0,
            localCardCount,
            overrideCountMap.get(deck.id) ?? 0,
          )

    return {
      id: deck.id,
      name: deck.name,
      questionLanguage: deck.questionLanguage,
      answerLanguage: deck.answerLanguage,
      cardCount,
      createdAt: deck.createdAt.toISOString(),
    }
  })

  return NextResponse.json({ decks: data })
}
