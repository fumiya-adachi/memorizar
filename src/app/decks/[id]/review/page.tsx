import { redirect } from "next/navigation"
import { auth } from "../../../../auth"
import { prisma } from "../../../../lib/prisma"
import ReviewCard from "./ReviewCard"

export default async function ReviewPage() {
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

  const now = new Date()

  const card = await prisma.flashCard.findFirst({
    where: {
      userId: user.id,
      OR: [
        {
          progress: {
            none: {
              userId: user.id,
            },
          },
        },
        {
          progress: {
            some: {
              userId: user.id,
              nextReview: {
                lte: now,
              },
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      deck: true,
    },
  })

  if (!card) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">復習</h1>
          <p className="mt-4 text-sm text-gray-500">
            いま復習できるカードはありません。
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
        </div>

        <ReviewCard
          card={{
            id: card.id,
            question: card.question,
            answer: card.answer,
            description: card.description ?? "",
            deckName: card.deck.name,
          }}
        />
      </div>
    </main>
  )
}