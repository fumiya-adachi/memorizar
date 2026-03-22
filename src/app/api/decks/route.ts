import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getApiUser } from "@/lib/apiAuth"
import type { DeckSummary } from "@memorizar/shared"

export async function POST(request: Request) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name) {
    return NextResponse.json({ error: "名前は必須です" }, { status: 400 })
  }

  const existing = await prisma.deck.findUnique({
    where: { userId_name: { userId: user.id, name } },
  })
  if (existing) {
    return NextResponse.json({ error: "同じ名前の単語帳が既に存在します" }, { status: 400 })
  }

  const deck = await prisma.deck.create({
    data: {
      userId: user.id,
      name,
      questionLanguage: body.questionLanguage || null,
      answerLanguage: body.answerLanguage || null,
    },
  })

  const summary: DeckSummary = {
    id: deck.id,
    name: deck.name,
    questionLanguage: deck.questionLanguage,
    answerLanguage: deck.answerLanguage,
    cardCount: 0,
    sourceDeckId: null,
    createdAt: deck.createdAt.toISOString(),
  }

  return NextResponse.json(summary, { status: 201 })
}

export async function GET(request: Request) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decks = await prisma.deck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      sourceDeckId: true,
      questionLanguage: true,
      answerLanguage: true,
    },
  })

  const deckIds = decks.map((d) => d.id)
  const importedDecks = decks.filter((d) => d.sourceDeckId !== null)
  const sourceDeckIds = importedDecks.map((d) => d.sourceDeckId!)
  const importedDeckIds = importedDecks.map((d) => d.id)

  const [localCounts, sourceCounts, overrideCounts] = await Promise.all([
    deckIds.length > 0
      ? prisma.flashCard.groupBy({
          by: ["deckId"],
          where: { deckId: { in: deckIds } },
          _count: { _all: true },
        })
      : [],
    sourceDeckIds.length > 0
      ? prisma.flashCard.groupBy({
          by: ["deckId"],
          where: { deckId: { in: sourceDeckIds } },
          _count: { _all: true },
        })
      : [],
    importedDeckIds.length > 0
      ? prisma.flashCard.groupBy({
          by: ["deckId"],
          where: { deckId: { in: importedDeckIds }, sourceCardId: { not: null } },
          _count: { _all: true },
        })
      : [],
  ])

  const localCountMap = new Map(localCounts.map((i) => [i.deckId, i._count._all]))
  const sourceCountMap = new Map(sourceCounts.map((i) => [i.deckId, i._count._all]))
  const overrideCountMap = new Map(overrideCounts.map((i) => [i.deckId, i._count._all]))

  const result: DeckSummary[] = decks.map((deck) => {
    const localCardCount = localCountMap.get(deck.id) ?? 0
    const cardCount =
      deck.sourceDeckId === null
        ? localCardCount
        : Math.max(
            0,
            (sourceCountMap.get(deck.sourceDeckId) ?? 0) +
              localCardCount -
              (overrideCountMap.get(deck.id) ?? 0)
          )

    return {
      id: deck.id,
      name: deck.name,
      questionLanguage: deck.questionLanguage,
      answerLanguage: deck.answerLanguage,
      cardCount,
      sourceDeckId: deck.sourceDeckId,
      createdAt: deck.createdAt.toISOString(),
    }
  })

  return NextResponse.json(result)
}
