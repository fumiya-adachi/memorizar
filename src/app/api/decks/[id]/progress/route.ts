import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getApiUser } from "@/lib/apiAuth"

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

  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId: user.id } })
  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 })
  }

  // デッキに属するカードIDを取得（インポート元含む）
  const ownCards = await prisma.flashCard.findMany({
    where: { deckId },
    select: { id: true },
  })
  const cardIds = ownCards.map((c) => c.id)

  if (cardIds.length === 0) {
    return NextResponse.json({ reviewedCount: 0, todayCount: 0, lastReviewed: null })
  }

  const progresses = await prisma.flashCardProgress.findMany({
    where: { userId: user.id, cardId: { in: cardIds }, reviewCount: { gt: 0 } },
    select: { lastReviewed: true },
  })

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const reviewedCount = progresses.length
  const todayCount = progresses.filter(
    (p) => p.lastReviewed && p.lastReviewed >= todayStart
  ).length
  const lastReviewed =
    progresses.reduce<Date | null>((latest, p) => {
      if (!p.lastReviewed) return latest
      return !latest || p.lastReviewed > latest ? p.lastReviewed : latest
    }, null)

  return NextResponse.json({
    reviewedCount,
    todayCount,
    lastReviewed: lastReviewed?.toISOString() ?? null,
  })
}
