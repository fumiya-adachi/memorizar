import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getApiUser } from "@/lib/apiAuth"

export type ProfileSummary = {
  name: string | null
  email: string
  totalCards: number
  todayReviews: number
  overallAccuracy: number | null  // null = 未学習
}

export async function GET(request: Request) {
  const user = await getApiUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [decks, todayReviews, progress] = await Promise.all([
    prisma.deck.findMany({
      where: { userId: user.id },
      select: { _count: { select: { flashcards: true } } },
    }),
    prisma.flashCardProgress.count({
      where: { userId: user.id, lastReviewed: { gte: todayStart } },
    }),
    prisma.flashCardProgress.aggregate({
      where: { userId: user.id },
      _sum: { correctCount: true, reviewCount: true },
    }),
  ])

  const totalCards = decks.reduce((sum, d) => sum + d._count.flashcards, 0)

  const totalCorrect = progress._sum.correctCount ?? 0
  const totalReviews = progress._sum.reviewCount ?? 0
  const overallAccuracy = totalReviews > 0
    ? Math.round((totalCorrect / totalReviews) * 100)
    : null

  const summary: ProfileSummary = {
    name: user.name,
    email: user.email,
    totalCards,
    todayReviews,
    overallAccuracy,
  }

  return NextResponse.json(summary)
}
