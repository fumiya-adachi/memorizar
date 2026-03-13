import { notFound, redirect } from "next/navigation"
import { auth } from "../../../../auth"
import { prisma } from "../../../../lib/prisma"
import ReviewCard from "./ReviewCard"

type ReviewPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    mode?: string
  }>
}

function getAccuracy(progress?: {
  correctCount: number
  reviewCount: number
} | null) {
  if (!progress || progress.reviewCount === 0) return -1
  return progress.correctCount / progress.reviewCount
}

export default async function ReviewPage({
  params,
  searchParams,
}: ReviewPageProps) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const { mode = "normal" } = await searchParams

  const deckId = Number(id)

  if (Number.isNaN(deckId)) {
    notFound()
  }

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId: user.id,
    },
  })

  if (!deck) {
    notFound()
  }

  const now = new Date()

  const cards = await prisma.flashCard.findMany({
    where: {
      deckId: deck.id,
      userId: user.id,
    },
    include: {
      deck: true,
      progress: {
        where: {
          userId: user.id,
        },
        take: 1,
      },
    },
  })

  if (cards.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">復習</h1>
          <p className="mt-4 text-sm text-gray-500">
            このDeckにはまだカードがありません。
          </p>
        </div>
      </main>
    )
  }

  let sortedCards = [...cards]

  if (mode === "weak") {
    sortedCards.sort((a, b) => {
      const progressA = a.progress[0] ?? null
      const progressB = b.progress[0] ?? null

      const accuracyA = getAccuracy(progressA)
      const accuracyB = getAccuracy(progressB)

      if (accuracyA !== accuracyB) {
        return accuracyA - accuracyB
      }

      const reviewCountA = progressA?.reviewCount ?? 0
      const reviewCountB = progressB?.reviewCount ?? 0

      if (reviewCountA !== reviewCountB) {
        return reviewCountA - reviewCountB
      }

      return a.createdAt.getTime() - b.createdAt.getTime()
    })
  } else {
    sortedCards = sortedCards.filter((card) => {
      const progress = card.progress[0] ?? null

      if (!progress) return true
      if (!progress.nextReview) return true

      return progress.nextReview <= now
    })

    sortedCards.sort((a, b) => {
      const progressA = a.progress[0] ?? null
      const progressB = b.progress[0] ?? null

      const nextA = progressA?.nextReview?.getTime() ?? 0
      const nextB = progressB?.nextReview?.getTime() ?? 0

      return nextA - nextB
    })
  }

  if (sortedCards.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "weak" ? "苦手カード復習" : "通常復習"}
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            {mode === "weak"
              ? "いま練習対象の苦手カードはありません。"
              : "いま復習対象のカードはありません。"}
          </p>
        </div>
      </main>
    )
  }

  const card = sortedCards[0]
  const progress = card.progress[0] ?? null

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500">{deck.name}</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {mode === "weak" ? "苦手カード復習" : "通常復習"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {mode === "weak"
              ? "正答率が低いカードから優先して出題します。"
              : "未学習または復習期限が来たカードを順番に出題します。"}
          </p>
        </div>

        <ReviewCard
          key={card.id}
          card={{
            id: card.id,
            question: card.question,
            answer: card.answer,
            description: card.description,
            deckName: card.deck.name,
          }}
        />

        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-600 shadow-sm">
          {progress ? (
            <>
              正答率: {Math.round((progress.correctCount / progress.reviewCount) * 100)}%
              {" / "}
              復習回数: {progress.reviewCount}
            </>
          ) : (
            <>このカードはまだ未学習です。</>
          )}
        </div>
      </div>
    </main>
  )
}