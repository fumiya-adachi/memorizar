import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import { requireCurrentUser } from "@/lib/currentUser"
import { prisma } from "@/lib/prisma"
import { importPublicDeck } from "./actions"

export default async function PublicDecksPage() {
  const user = await requireCurrentUser()

  const publicDecks = await prisma.deck.findMany({
    where: {
      isPublic: true,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          flashcards: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href={ROUTES.decks}
            className="inline-flex items-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← あなたの単語帳へ戻る
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">みんなの公開単語帳</h1>
          <p className="mt-2 text-sm text-gray-500">
            他のユーザーが公開した単語帳を探して取り込めます。取り込んだ単語帳はあなた専用として保存されます。
          </p>
        </div>

        {publicDecks.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-base font-medium text-gray-900">公開中の単語帳はまだありません</p>
            <p className="mt-2 text-sm text-gray-500">
              あなたの単語帳を公開して、他のユーザーにも共有してみましょう。
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {publicDecks.map((deck) => {
              const isOwnDeck = deck.userId === user.id

              return (
                <article key={deck.id} className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={ROUTES.publicDeckDetail(deck.id)}
                        className="text-lg font-semibold text-gray-900 hover:underline underline-offset-4"
                      >
                        {deck.name}
                      </Link>
                      <p className="mt-2 text-sm text-gray-500">
                        投稿者: {deck.user.name || deck.user.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        作成日: {new Date(deck.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>

                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {deck._count.flashcards} cards
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={ROUTES.publicDeckDetail(deck.id)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      中身を見る
                    </Link>

                    {isOwnDeck ? (
                      <p className="text-sm font-medium text-gray-500">
                        あなたが公開中の単語帳です
                      </p>
                    ) : (
                      <form action={importPublicDeck.bind(null, deck.id)}>
                        <button
                          type="submit"
                          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                          この単語帳を取り込む
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
