import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "../../../auth"
import { prisma } from "../../../lib/prisma"
import FlashCardForm from "./FlashCardForm"
import FlashCardItem from "./FlashCardItem"

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
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <Link
            href="/decks"
            className="inline-flex items-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Decksへ戻る
          </Link>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                {deck.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* 登録済みカード数 */}
              {/* <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Cards
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {deck.flashcards.length}
                </p>
              </div> */}

              <div className="flex items-center gap-3">
                <Link
                  href={`/decks/${deck.id}/review?mode=normal`}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  全体を学習
                </Link>

                <Link
                  href={`/decks/${deck.id}/review?mode=weak`}
                  className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  苦手なカードを復習
                </Link>
              </div>
            </div>
          </div>
          </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              カードを追加
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              このDeckに新しいフラッシュカードを追加します。
              単語・意味・用語などを登録して、あとで復習できるようにしましょう。
            </p>

            <div className="mt-6">
              <FlashCardForm deckId={deck.id} />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  登録済みカード
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  このDeckに登録されているフラッシュカード一覧です。
                </p>
              </div>

              <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {deck.flashcards.length} 件
              </div>
            </div>

            {deck.flashcards.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                <p className="text-base font-medium text-gray-900">
                  まだカードがありません
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  左側のフォームから最初のカードを追加してみましょう。
                </p>
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
                    <FlashCardItem
                      key={card.id}
                      deckId={deck.id}
                      card={{
                        id: card.id,
                        question: card.question,
                        answer: card.answer,
                        description: card.description,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}