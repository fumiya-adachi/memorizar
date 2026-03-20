import Link from "next/link"
import { ROUTES } from "@/constants/routes"
import DeckFilterForm from "@/components/decks/DeckFilterForm"
import { requireCurrentUser } from "@/lib/currentUser"
import { prisma } from "@/lib/prisma"
import {
  getDaysFromFilter,
  getLanguageLabel,
  isCreatedWithinFilter,
  isQuestionLanguageFilter,
  isSortFilter,
} from "@/features/decks/filters"
import { importPublicDeck } from "./actions"

type PublicDecksPageProps = {
  searchParams: Promise<{
    questionLanguage?: string
    createdWithin?: string
    sort?: string
  }>
}

export default async function PublicDecksPage({ searchParams }: PublicDecksPageProps) {
  const user = await requireCurrentUser()
  const params = await searchParams

  const questionLanguage =
    params.questionLanguage && isQuestionLanguageFilter(params.questionLanguage)
    ? params.questionLanguage
    : "all"

  const createdWithin = params.createdWithin && isCreatedWithinFilter(params.createdWithin)
    ? params.createdWithin
    : "all"

  const sort = params.sort && isSortFilter(params.sort) ? params.sort : "newest"

  const days = getDaysFromFilter(createdWithin)
  const createdAtFilter = days
    ? {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      }
    : undefined

  const publicDecks = await prisma.deck.findMany({
    where: {
      isPublic: true,
      sourceDeckId: null,
      ...(questionLanguage !== "all" ? { questionLanguage } : {}),
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
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
      createdAt: sort === "newest" ? "desc" : "asc",
    },
  })

  const hasFilter = questionLanguage !== "all" || createdWithin !== "all" || sort !== "newest"

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
          <h1 className="mt-3 text-2xl font-bold text-gray-900">公開単語帳</h1>
          <p className="mt-2 text-sm text-gray-500">
            他のユーザーが公開した単語帳を探して取り込めます。取り込んだ単語帳はあなた専用として保存されます。
          </p>
        </div>

        <DeckFilterForm
          questionLanguage={questionLanguage}
          createdWithin={createdWithin}
          sort={sort}
          hasFilter={hasFilter}
          resetHref={ROUTES.publicDecks}
        />

        {publicDecks.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-base font-medium text-gray-900">条件に一致する公開単語帳はありません</p>
            <p className="mt-2 text-sm text-gray-500">
              絞り込み条件を変更するか、しばらくしてから再度確認してください。
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
                        学習言語: {getLanguageLabel(deck.questionLanguage)}
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
