import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
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

function sortByWeakness<
  T extends {
    createdAt: Date
    progress: {
      correctCount: number
      wrongCount: number
      reviewCount: number
      nextReview: Date | null
      lastReviewed: Date | null
    }[]
  }
>(cards: T[]) {
  return [...cards].sort((a, b) => {
    const progressA = a.progress[0] ?? null
    const progressB = b.progress[0] ?? null

    const accuracyA = getAccuracy(progressA)
    const accuracyB = getAccuracy(progressB)

    // 正答率が低い順
    if (accuracyA !== accuracyB) {
      return accuracyA - accuracyB
    }

    // 復習回数が少ない順
    const reviewCountA = progressA?.reviewCount ?? 0
    const reviewCountB = progressB?.reviewCount ?? 0

    if (reviewCountA !== reviewCountB) {
      return reviewCountA - reviewCountB
    }

    // 間違えた回数が多いものを優先
    const wrongCountA = progressA?.wrongCount ?? 0
    const wrongCountB = progressB?.wrongCount ?? 0

    if (wrongCountA !== wrongCountB) {
      return wrongCountB - wrongCountA
    }

    // 最後は古いカード順
    return a.createdAt.getTime() - b.createdAt.getTime()
  })
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
    // 苦手モード
    sortedCards = sortByWeakness(cards)
  } else {
    // 通常モード
    // nextReviewでは絞らず、全カードを正答率が低い順に出す
    sortedCards = sortByWeakness(cards)
  }

  const card = sortedCards[0]
  const progress = card.progress[0] ?? null

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          {/* <p className="text-sm font-medium text-gray-500">{deck.name}</p> */}
          {/* <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {mode === "weak" ? "苦手カード復習" : "全体復習"}
          </h1> */}
          <p className="mt-2 text-sm text-gray-500">
            {mode === "weak"
              ? "正答率が低いカードを優先して出題します。"
              : "Deck内の全カードを対象に、正答率が低い順で出題します。"}
          </p>
        </div>

        <ReviewCard
          key={card.id}
          card={{
            ...card,
            deckName: card.deck.name,
            questionLanguage: card.deck.questionLanguage,
            answerLanguage: card.deck.answerLanguage,
          }}
        />

        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-600 shadow-sm">
          {progress ? (
            <>
              正答率:{" "}
              {progress.reviewCount > 0
                ? Math.round((progress.correctCount / progress.reviewCount) * 100)
                : 0}
              %
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