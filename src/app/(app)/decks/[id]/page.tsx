import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import FlashCardForm from "./FlashCardForm"
import FlashCardItem from "./FlashCardItem"
import Pagination from "@/components/ui/Pagination"
import { ROUTES } from "@/constants/routes"
import DeleteDeckButton from "./DeleteDeckButton"
import { deleteDeck } from "./actions"
import EditDeckNameForm from "./EditDeckNameForm"
import { requireCurrentUser } from "@/lib/currentUser"

export const dynamic = "force-dynamic"

type DeckDetailPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

export default async function DeckDetailPage({
  params,
  searchParams,
}: DeckDetailPageProps) {
  const user = await requireCurrentUser()

  const { id } = await params
  const { page: pageQuery = "1" } = await searchParams

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

  const PAGE_SIZE = 10
  const requestedPage = Number(pageQuery ?? "1")
  const currentPage = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage

  const totalFlashCards = await prisma.flashCard.count({
    where: { deckId },
  })

  const totalPages = Math.max(1, Math.ceil(totalFlashCards / PAGE_SIZE))
  const page = Math.min(currentPage, totalPages)

  const flashcards = await prisma.flashCard.findMany({
    where: { deckId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <Link
            href="/decks"
            className="inline-flex items-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← 単語帳リストへ戻る
          </Link>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 md:flex-1 md:pr-6">
              <EditDeckNameForm deckId={deck.id} deckName={deck.name} />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <Link
                  href={ROUTES.deckReview(deck.id)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  学習する
                </Link>
              </div>
            </div>
          </div>
          </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <section className="rounded-3xl bg-white p-6 shadow-sm h-[640px] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900">
                カードを追加
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                この単語帳に新しいフラッシュカードを追加します。
                単語・意味・用語などを登録して、あとで復習できるようにしましょう。
              </p>

              <div className="mt-6">
                <FlashCardForm deckId={deck.id} />
              </div>
            </section>

            <DeleteDeckButton deckId={deck.id} onDelete={deleteDeck} />
          </div>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  登録済みカード
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  この単語帳に登録されているフラッシュカード一覧です。
                </p>
              </div>

              <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {totalFlashCards} 件
              </div>
            </div>

            {totalFlashCards === 0 ? (
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
                  {flashcards.map((card) => (
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

            {totalFlashCards > 0 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath={ROUTES.deckDetail(deck.id)}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}