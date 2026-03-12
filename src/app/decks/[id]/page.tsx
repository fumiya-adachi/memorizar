import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "../../../auth"
import { prisma } from "../../../lib/prisma"

type DeckDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function DeckDetailPage({
  params,
}: DeckDetailPageProps) {
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
  const deckId = Number(id)

  if (Number.isNaN(deckId)) {
    notFound()
  }

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId: user.id,
    },
    include: {
      flashcards: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!deck) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/decks"
              className="text-sm font-medium text-gray-600 underline underline-offset-4"
            >
              ← Deck一覧へ戻る
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-gray-900">
              {deck.name}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              作成日:{" "}
              {new Date(deck.createdAt).toLocaleDateString("ja-JP")}
            </p>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow">
            {deck.flashcards.length} cards
          </div>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              登録済みカード
            </h2>

            <button
              type="button"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white opacity-60"
              disabled
            >
              カードを追加（次で実装）
            </button>
          </div>

          {deck.flashcards.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-base font-medium text-gray-900">
                まだカードがありません
              </p>
              <p className="mt-2 text-sm text-gray-500">
                次にこのDeckへフラッシュカードを追加していきましょう。
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {deck.flashcards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Question
                      </p>
                      <p className="mt-2 text-base font-medium text-gray-900">
                        {card.question}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Answer
                      </p>
                      <p className="mt-2 text-base text-gray-700">
                        {card.answer}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    作成日:{" "}
                    {new Date(card.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}