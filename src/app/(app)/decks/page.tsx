import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import DeckForm from "./DeckForm"

export default async function DecksPage() {
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

  const decks = await prisma.deck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          flashcards: true,
        },
      },
    },
  })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Decks
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              学習用の単語帳を作成して、カードを整理できます。
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow">
          <details open={decks.length === 0}>
            <summary className="cursor-pointer text-lg font-semibold text-gray-900">
              新しいDeckを作成
            </summary>

            <div className="mt-4">
              <DeckForm />
            </div>
          </details>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">あなたのDeck</h2>
            <p className="text-sm text-gray-500">{decks.length}件</p>
          </div>

          {decks.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow">
              <p className="text-base font-medium text-gray-900">
                まだDeckがありません
              </p>
              <p className="mt-2 text-sm text-gray-500">
                最初のDeckを作成して、暗記カードを追加していきましょう。
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {decks.map((deck) => (
                <Link
                  key={deck.id}
                  href={`/decks/${deck.id}`}
                  className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {deck.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        作成日:{" "}
                        {new Date(deck.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>

                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {deck._count.flashcards} cards
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Deckを開く
                    </span>
                    <span className="text-lg text-gray-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}