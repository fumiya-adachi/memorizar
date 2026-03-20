import Link from "next/link"
import { notFound } from "next/navigation"
import { ROUTES } from "@/constants/routes"
import { requireCurrentUser } from "@/lib/currentUser"
import { prisma } from "@/lib/prisma"
import { importPublicDeck } from "../actions"

type PublicDeckDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function PublicDeckDetailPage({ params }: PublicDeckDetailPageProps) {
  const user = await requireCurrentUser()
  const { id } = await params

  const deckId = Number(id)

  if (Number.isNaN(deckId)) {
    notFound()
  }

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      isPublic: true,
      sourceDeckId: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      flashcards: {
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          flashcards: true,
        },
      },
    },
  })

  if (!deck) {
    notFound()
  }

  const isOwnDeck = deck.user.id === user.id

  const importedDeck = isOwnDeck
    ? null
    : await prisma.deck.findFirst({
        where: {
          userId: user.id,
          sourceDeckId: deck.id,
        },
        select: {
          id: true,
        },
      })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <Link
            href={ROUTES.publicDecks}
            className="inline-flex items-center text-sm font-medium text-gray-500 transition hover:text-gray-900 hover:underline underline-offset-4"
          >
            ← みんなの公開単語帳へ戻る
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">{deck.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <p>投稿者: {deck.user.name || deck.user.email}</p>
            <span>•</span>
            <p>カード数: {deck._count.flashcards}件</p>
            <span>•</span>
            <p>作成日: {new Date(deck.createdAt).toLocaleDateString("ja-JP")}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isOwnDeck ? (
              <p className="text-sm font-medium text-gray-500">あなたが公開中の単語帳です</p>
            ) : importedDeck ? (
              <Link
                href={ROUTES.deckDetail(importedDeck.id)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                取り込み済みの単語帳を開く
              </Link>
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
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">単語一覧</h2>
            <p className="text-sm text-gray-500">{deck._count.flashcards}件</p>
          </div>

          {deck.flashcards.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
              <p className="text-base font-medium text-gray-900">この単語帳にはカードがありません</p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
              <div className="hidden grid-cols-[1.2fr_1.2fr_140px] bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
                <p>Question</p>
                <p>Answer</p>
                <p>Description</p>
              </div>

              <div className="divide-y divide-gray-200">
                {deck.flashcards.map((card) => (
                  <div
                    key={card.id}
                    className="grid w-full gap-4 px-5 py-4 text-left md:grid-cols-[1.1fr_1.1fr_1.2fr] md:items-start"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                        Question
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900 md:mt-0">{card.question}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                        Answer
                      </p>
                      <p className="mt-1 text-sm text-gray-700 md:mt-0">{card.answer}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                        Description
                      </p>
                      <p className="mt-1 text-sm text-gray-600 md:mt-0">{card.description || "-"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
